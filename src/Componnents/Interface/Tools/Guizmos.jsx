import { useContext, useMemo, useRef, useState, useEffect } from "react";
import { RotationAngleContext } from "../../../App";
import { matrix, multiply, cos, sin, transpose } from "mathjs";
import { useTools } from "./ToolsContext";

const NUM_POINTS = 360; //Isto controla o número de anchor points

//UTILITÁRIAS

function generateCircle3D(plane = "X", radius = 1) {
  //Criar os anchor pontos das circunferências para o Guizmo (coordenadas 3D sem transformações aplicadas)
  const points = [];
  for (let i = 0; i < NUM_POINTS; i++) {
    const angle = ((2 * Math.PI) / NUM_POINTS) * i;
    const cord1 = radius * Math.cos(angle); //O centro é (0,0,0)
    const cord2 = radius * Math.sin(angle);

    if (plane === "X") points.push([0, cord1, cord2]);
    if (plane === "Y") points.push([cord2, 0, cord1]); //verificar mais tarde...
    if (plane === "Z") points.push([cord1, cord2, 0]);
  }
  return points;
}

//Gerar as Matrizes de Roração (4X4) para os 3 planos
function getRotationMatrixX(angle) {
  return matrix([
    [1, 0, 0, 0],
    [0, cos(angle), -sin(angle), 0],
    [0, sin(angle), cos(angle), 0],
    [0, 0, 0, 1],
  ]);
}
function getRotationMatrixY(angle) {
  return matrix([
    [cos(angle), 0, sin(angle), 0],
    [0, 1, 0, 0],
    [-sin(angle), 0, cos(angle), 0],
    [0, 0, 0, 1],
  ]);
}
function getRotationMatrixZ(angle) {
  return matrix([
    [cos(angle), -sin(angle), 0, 0],
    [sin(angle), cos(angle), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
}

function getCombinationMatrix(anglesDeg) {
  //Recebe os ângulos em graus de todos os eixos e compõe-nos numa só matriz de rotação

  const anglesRad = {
    //angulos convertidos em radianos
    x: (anglesDeg.x * Math.PI) / 180,
    y: (anglesDeg.y * Math.PI) / 180,
    z: (anglesDeg.z * Math.PI) / 180,
  };

  const rotX = getRotationMatrixX(anglesRad.x);
  const rotY = getRotationMatrixY(anglesRad.y);
  const rotZ = getRotationMatrixZ(anglesRad.z);

  return multiply(rotZ, multiply(rotY, rotX));
}

function applyRotation(points, angleDeg) {
  //recebe os angulos de rotação, cria a matriz composta e aplica-a a todos os pontos que recebe.
  const rotation = getCombinationMatrix(angleDeg);
  return points.map((p) => {
    const homogeneous = matrix([...p, 1]); //Os pontos têm de estar numa matriz 1X4

    const [x, y, z] = multiply(rotation, homogeneous).toArray();
    return [x, y, z];
  });
}

function isItaLine(axel, composedMatrix, treshold = 1e-2) {
  let dirVect;
  axel = axel.toUpperCase();
  const zDirVect = [0, 0, 1, 1];
  if (axel === "X") dirVect = [1, 0, 0, 1];
  if (axel === "Y") dirVect = [0, 1, 0, 1];
  if (axel === "Z") dirVect = [0, 0, 1, 1];

  dirVect = multiply(composedMatrix, dirVect);
  dirVect = dirVect.toArray();

  const dot =
    dirVect[0] * zDirVect[0] +
    dirVect[1] * zDirVect[1] +
    dirVect[2] * zDirVect[2];

  if (Math.abs(dot) < treshold) {
    return true;
  } else {
    return false;
  }
}

function projectTo2D(
  [x, y, z],
  scale = 80,
  center = [100, 100],
  perpendicular
) {
  //Esta função vai pegar nos meus pontos e projetá-los para 2D... (a verificação da posicão atual do plano de rotação tem de ser feita antes deste passo...)
  //sinto que é aqui que devo aplicar a função de verificar se os pontos devem ficar ativos ou inativos, então devo transformá-los num objeto...
  let active;
  if (perpendicular && z < 0) active = false;
  else active = true;
  return {
    cord: [x * scale + center[0], y * scale + center[1]],
    active: active,
  };
}

function normalize(v) {
  //recebe um vetor (um array com x e y) e normaliza-o
  const leng = Math.hypot(...v);
  return v.map((val) => val / length);
}

function findClosestPointIndex(points2D, mouseX, mouseY) {
  //Encotrar que ponto de um dado guizmo está mais perto do mouse tendo em conta que alguns estão desativados...
  let closestIndex = -1;
  let minDist = Infinity;

  points2D.forEach(({ cord: [x, y], active }, i) => {
    if (active) {
      const dx = Math.abs(x - mouseX);
      const dy = Math.abs(y - mouseY);
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }
  });
  return closestIndex;
}

function extractEulerAnglesXYZ(rotationMatrix) {
  const m = rotationMatrix.toArray();

  let x, y, z;

  if (Math.abs(m[2][0]) < 0.99999) {
    y = Math.asin(-m[2][0]);
    x = Math.atan2(m[2][1], m[2][2]);
    z = Math.atan2(m[1][0], m[0][0]);
  } else {
    y = Math.asin(-m[2][0]);
    x = Math.atan2(-m[1][2], m[1][1]);
    z = 0;
  }

  return {
    x: (x * 180) / Math.PI,
    y: (y * 180) / Math.PI,
    z: (z * 180) / Math.PI,
  };
}

function localRotation(originalAxis, angle, rotationAngles) {
  //O angle deve vir em radianos
  originalAxis = originalAxis.toUpperCase();
  let localMatRot; //Definir qual a matriz de rotação local
  /*if (originalAxis === "X") localMatRot = getRotationMatrixX(angle);
  if (originalAxis === "Y") localMatRot = getRotationMatrixY(angle);
  if (originalAxis === "Z") localMatRot = getRotationMatrixZ(angle);
  if (!localMatRot) return; */
  const degreesAngle = (angle * 180) / Math.PI;
  let localAngles;
  if (originalAxis === "X") localAngles = { x: degreesAngle, y: 0, z: 0 };
  if (originalAxis === "Y") localAngles = { x: 0, y: degreesAngle, z: 0 };
  if (originalAxis === "Z") localAngles = { x: 0, y: 0, z: degreesAngle };

  localMatRot = getCombinationMatrix(localAngles);
  //Agora quero multiplicar essa matriz pela matriz completa de rotação

  const matrizLocalGlob_loc = getCombinationMatrix(rotationAngles);

  const finalMatrix = multiply(matrizLocalGlob_loc, localMatRot);
  //Por fim... eu preciso de converter esta palhaçada de novo para angulos... e isso é um passo esquisito...
  const newAngles = extractEulerAnglesXYZ(finalMatrix);

  return newAngles;
}

function Guizmo3D() {
  const { rotationAngle, setRotationAngle } = useContext(RotationAngleContext);
  const svgRef = useRef(null);
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [draggingAxis, setDraggingAxis] = useState(null);
  const [initialPointIndex, setInitialPointIndex] = useState(null);
  const { tools } = useTools();

  const draggingAxisRef = useRef(null);
  const initialPointIndexRef = useRef(null);

  const AXIS_VECTORS = {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1],
  };

  const center = [100, 100];
  const scale = 80;

  const guizmoCircles = useMemo(() => {
    const planes = {
      x: generateCircle3D("X"),
      y: generateCircle3D("Y"),
      z: generateCircle3D("Z"),
    };

    return Object.entries(planes).map(([axis, points]) => {
      const rotatedPoints = applyRotation(points, {
        x: rotationAngle.XAngle,
        y: rotationAngle.YAngle,
        z: rotationAngle.ZAngle,
      });

      const projected = rotatedPoints.map((p) =>
        projectTo2D(
          p,
          scale,
          center,
          isItaLine(
            axis,
            getCombinationMatrix({
              x: rotationAngle.XAngle,
              y: rotationAngle.YAngle,
              z: rotationAngle.ZAngle,
            })
          )
        )
      ); //eu quero que daqui resultem objetos com as coordenadas e o estado ativo ou não

      const valid = projected.filter(
        ({ cord: [x, y], active }) => isFinite(x) && isFinite(y)
      );
      if (valid.length === 0) return null;

      const pathData = valid.map(
        ({ cord: [x, y], active }, i) =>
          `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
      );
      pathData.push("Z");
      return {
        path: pathData.join(" "),
        pathPoints: projected,
        axis,
      };
    });
  }, [rotationAngle.XAngle, rotationAngle.YAngle, rotationAngle.ZAngle]);

  const axisLines = useMemo(() => {
    //ADICIONEI!
    const rotMatrix = getCombinationMatrix({
      x: rotationAngle.XAngle,
      y: rotationAngle.YAngle,
      z: rotationAngle.ZAngle,
    });

    return Object.entries(AXIS_VECTORS).map(([axis, vector]) => {
      const homogeneous = [...vector, 1]; // torna o vetor 4D
      const rotated = multiply(rotMatrix, homogeneous).toArray();

      const projected = projectTo2D(rotated.slice(0, 3), scale, center);
      return {
        axis,
        start: center,
        end: projected.cord,
        active: projected.active,
      };
    });
  }, [rotationAngle.XAngle, rotationAngle.YAngle, rotationAngle.ZAngle]);

  const handleChange = (key, value) => {
    const newValue = parseFloat(value);
    setRotationAngle((prev) => ({
      ...prev,
      [key]: isNaN(newValue) ? 0 : newValue,
    }));
  };

  const startGuizmoDrag = (axis, event) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const circle = guizmoCircles.find((g) => g.axis === axis);
    if (!circle) return;

    const index = findClosestPointIndex(circle.pathPoints, mouseX, mouseY);

    setDraggingAxis(axis);
    draggingAxisRef.current = axis;
    setInitialPointIndex(index);
    initialPointIndexRef.current = index;

    window.addEventListener("pointermove", handleGuizmoDrag);

    const handlePointerUp = () => {
      stopGuizmoDrag();
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerUp);
    };

    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", handlePointerUp);
  };

  function handleGuizmoDrag(event) {
    const axis = draggingAxisRef.current;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const circle = guizmoCircles.find((g) => g.axis === axis);
    if (!circle) return;

    const newIndex = findClosestPointIndex(circle.pathPoints, mouseX, mouseY);
    if (newIndex === -1 || initialPointIndexRef.current === null) return;

    const diff = newIndex - initialPointIndexRef.current;
    const angleDelta = ((2 * Math.PI) / NUM_POINTS) * diff;

    const newAngles = localRotation(axis, angleDelta, {
      x: rotationAngle.XAngle,
      y: rotationAngle.YAngle,
      z: rotationAngle.ZAngle,
    });

    setRotationAngle((prev) => ({
      ...prev,
      XAngle: newAngles.x,
      YAngle: newAngles.y,
      ZAngle: newAngles.z,
    }));
  }

  function stopGuizmoDrag() {
    setDraggingAxis(null);
    draggingAxisRef.current = null;
    setInitialPointIndex(null);
    window.removeEventListener("pointermove", handleGuizmoDrag);
  }

  const axisLabels = [
    { key: "XAngle", label: "X" },
    { key: "YAngle", label: "Y" },
    { key: "ZAngle", label: "Z" },
  ];

  const sortedGuizmos = [...guizmoCircles].sort((a, b) => {
    const aActive = a.axis === hoveredAxis || a.axis === draggingAxis;
    const bActive = b.axis === hoveredAxis || b.axis === draggingAxis;
    return aActive === bActive ? 0 : aActive ? 1 : -1;
  });

  return (
    <>
      {tools.gizmos ? (
        <div
          style={{
            position: "absolute",
            top: "0px",
            right: "50px",
            display: "flex",
            /* gap: "20px", */
            alignItems: "center",
            zIndex: "50",
          }}
        >
          <svg width="200" height="200" ref={svgRef}>
            {axisLines.map(({ axis, start, end, active }) =>
              active ? (
                <line
                  key={`line-${axis}`}
                  x1={start[0]}
                  y1={start[1]}
                  x2={end[0]}
                  y2={end[1]}
                  stroke={
                    hoveredAxis === axis || draggingAxis === axis
                      ? "var(--interaction-feedback)"
                      : "var(--interactive-indicator)"
                  }
                  strokeWidth="2"
                />
              ) : null
            )}
            <ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="80"
              fill="var(--elements-color)"
              opacity="0.1"
            />
            {sortedGuizmos.map((g) =>
              g ? (
                <path
                  key={g.axis}
                  d={g.path}
                  fill="none"
                  stroke={
                    hoveredAxis === g.axis || draggingAxis === g.axis
                      ? "var(--interaction-feedback)"
                      : "var(--interactive-indicator)"
                  }
                  strokeWidth="5"
                  pointerEvents="stroke"
                  onMouseEnter={() => setHoveredAxis(g.axis)}
                  onMouseLeave={() => setHoveredAxis(null)}
                  onPointerDown={(e) => startGuizmoDrag(g.axis, e)}
                />
              ) : null
            )}
          </svg>
          <div>
            {axisLabels.map(({ key, label }) => (
              <div
                key={key}
                style={{
                  marginBottom: "5px",
                  marginTop: "5px",
                  display: "flex",
                  alignItems: "center",
                  width: "100px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "var(--elements-color)",
                    width: "40%",
                    textAlign: "end",
                  }}
                >
                  <b>{label}:</b>
                </p>
                <input
                  className="inputGuizmos"
                  type="number"
                  value={rotationAngle[key].toFixed(2)}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Guizmo3D;
