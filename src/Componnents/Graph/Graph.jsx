import { useContext, useEffect, useRef, useState } from "react";
import {
  DataContext,
  RotationAngleContext,
  visInputsContext,
  InteractionPointsContext,
  PointsContext,
} from "../../App";
import { UMAP } from "umap-js";
import { PointsTransformer, pointsCanvasPos } from "./PointsTransformation";
import Point from "./Point";
import { map } from "../../Utils/map";
import { useTools } from "../Interface/Tools/ToolsContext";
import { useIsLoadingConfig } from "../Interface/Simple_Components/LoadConfig";

function Graph({ wrapperRef }) {
  const { data } = useContext(DataContext);
  const { visInputs } = useContext(visInputsContext);
  const { rotationAngle, setRotationAngle } = useContext(RotationAngleContext);
  const { interactionPoints, setInteractionPoints } = useContext(
    InteractionPointsContext
  );

  const { isLoadingConfig } = useIsLoadingConfig();

  const { tools, setTools } = useTools();

  const [size, setSize] = useState(0);
  const [patternZoom, setPatternZoom] = useState(0);
  const { points, setPoints } = useContext(PointsContext);
  const [embeddings, setEmbeddings] = useState([]);
  const [preCoordinates, setPreCoordinates] = useState([]);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [ellipseRadius, setEllipseRadius] = useState(10);

  const isDragging = useRef(false);
  const dragStart = useRef([0, 0]);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectingBox, setSelectingBox] = useState(null); //x, y, w, h

  const dataTriggeredAlt = useRef(false);

  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function framePoints() {
    const xs = preCoordinates.map((p) => p[0]);
    const ys = preCoordinates.map((p) => p[1]);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const w = Math.abs(maxX - minX);
    const h = Math.abs(maxY - minY);

    const windowScale = Math.min((size.w - 50) / w - 10, size.h / h - 10);

    setPatternZoom(windowScale);

    const desvX =
      (size.w - 50) / 2 -
      (minX * windowScale +
        Math.abs(maxX * windowScale - minX * windowScale) / 2);
    const desvY =
      size.h / 2 -
      (minY * windowScale +
        Math.abs(maxY * windowScale - minY * windowScale) / 2);

    setRotationAngle((prev) => ({
      ...prev,
      zoom: windowScale,
      translateX: desvX,
      translateY: desvY,
    }));
  }

  useEffect(() => {
    if (!wrapperRef?.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ w: width, h: height });
      }
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [wrapperRef]);

  useEffect(() => {
    if (data.length < 15 || size.w === 0 || size.h === 0) return;

    const attributeKeys = Object.keys(visInputs.atrWeights);

    const attrMins = {};
    const attrMaxs = {};
    attributeKeys.forEach((key) => {
      const numericVals = data
        .map((row) => parseFloat(row[key]))
        .filter((v) => !isNaN(v));

      const min = Math.min(...numericVals);
      const max = Math.max(...numericVals);

      attrMins[key] = min;
      attrMaxs[key] = max;
    });

    const numericData = data.map((row) =>
      attributeKeys.map((key) => {
        const rawVal = parseFloat(row[key]);
        const weight = visInputs.atrWeights[key];
        const min = attrMins[key];
        const max = attrMaxs[key];

        if (isNaN(rawVal) || max === min) return 0;

        const normalizedVal = (rawVal - min) / (max - min);
        return normalizedVal * weight;
      })
    );

    const umap = new UMAP({ ...visInputs.umapParams, nComponents: 3 });
    const rawEmbedding = umap.fit(numericData);

    const pointObjects = data.map((d, i) => ({
      id: d.key,
      rawAttributes: d,
      umapEmbedding: rawEmbedding[i],
      screenCoordinates: [0, 0],
    }));

    if (isLoadingConfig && points.length > 0 && points[0].umapEmbedding) {
      setEmbeddings(points.map((p) => p.umapEmbedding));
    } else {
      setEmbeddings(rawEmbedding);
    }
    setPoints(pointObjects);
    dataTriggeredAlt.current = true;
  }, [visInputs]);

  useEffect(() => {
    if (embeddings.length === 0) return;

    const XAngle = (rotationAngle.XAngle * Math.PI * 2) / 360.0;
    const YAngle = (rotationAngle.YAngle * Math.PI * 2) / 360.0;
    const ZAngle = (rotationAngle.ZAngle * Math.PI * 2) / 360.0;

    const transformed = PointsTransformer(embeddings, XAngle, YAngle, ZAngle);
    setPreCoordinates(transformed);
  }, [
    rotationAngle.XAngle,
    rotationAngle.YAngle,
    rotationAngle.ZAngle,
    embeddings,
  ]);

  useEffect(() => {
    if (isLoadingConfig) return;
    if (preCoordinates.length === 0) return;

    const finalProj = pointsCanvasPos(
      preCoordinates,
      rotationAngle.zoom,
      rotationAngle.translateX,
      rotationAngle.translateY
    );

    setPoints((prevPoints) =>
      prevPoints.map((p, i) => ({
        ...p,
        screenCoordinates: finalProj[i],
      }))
    );
  }, [
    preCoordinates,
    rotationAngle.zoom,
    rotationAngle.translateX,
    rotationAngle.translateY,
  ]);

  // 5. Ajusta automaticamente o scale e a translação para centralizar o conteúdo
  useEffect(() => {
    if (preCoordinates.length === 0) return;
    //if (dataTriggeredAlt.current) return;
    if (tools.framePointsTrigger) {
      framePoints();

      setTools((prev) => ({
        ...prev,
        framePointsTrigger: false,
      }));
    }
  }, [tools.framePointsTrigger]);

  const numRuns = useRef(0);
  useEffect(() => {
    if (embeddings.length === 0) return;
    if (preCoordinates.length === 0) return;
    if (!dataTriggeredAlt.current) return;

    framePoints();
    numRuns.current += 1;
    if (numRuns.current > 1) {
      dataTriggeredAlt.current = false;
      numRuns.current = 0;
    }
  }, [preCoordinates]);

  const handleBackgroundClick = (e) => {
    if (
      e.target.tagName === "circle" ||
      e.target.closest("circle") ||
      e.ctrlKey ||
      tools.cursor === "grabber" ||
      spacePressed === true
    )
      return;
    setInteractionPoints((prev) => ({ ...prev, selected: [] }));
  };

  const handleMouseDown = (e) => {
    if (tools.cursor == "grabber" || spacePressed) {
      isDragging.current = true;
      setIsDraggingState(true);
      dragStart.current = [e.clientX, e.clientY];
    } else if (tools.cursor == "selector" && !spacePressed) {
      if (e.target.tagName.toLowerCase() === "circle" || e.ctrlKey) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setSelectingBox({
        startX: currentX,
        startY: currentY,
        endX: currentX,
        endY: currentY,
      });
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isSelecting) {
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setSelectingBox((prev) => ({
        ...prev,
        endX: currentX,
        endY: currentY,
      }));
      return;
    }

    if (
      !isDragging.current ||
      (tools.cursor !== "grabber" && spacePressed === false)
    )
      return;

    const [startX, startY] = dragStart.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    dragStart.current = [e.clientX, e.clientY];

    setRotationAngle((prev) => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }));
  };

  const handleMouseUp = () => {
    if (isSelecting && selectingBox) {
      // calcula pontos dentro do retângulo
      const xMin = Math.min(selectingBox.startX, selectingBox.endX);
      const xMax = Math.max(selectingBox.startX, selectingBox.endX);
      const yMin = Math.min(selectingBox.startY, selectingBox.endY);
      const yMax = Math.max(selectingBox.startY, selectingBox.endY);

      const selectedIds = points
        .filter((p) => {
          const [px, py] = p.screenCoordinates;
          return px >= xMin && px <= xMax && py >= yMin && py <= yMax;
        })
        .map((p) => p.id);

      setInteractionPoints((prev) => ({
        ...prev,
        selected: selectedIds,
      }));

      setIsSelecting(false);
      setSelectingBox(null);
      return;
    }

    if (tools.cursor !== "grabber" && spacePressed === false) return;
    isDragging.current = false;
    setIsDraggingState(false);
  };

  useEffect(() => {
    const svg = document.getElementById("canvas");
    if (!svg) return;

    const wheelHandler = (e) => {
      handleWheel(e);
    };

    svg.addEventListener("wheel", wheelHandler, { passive: false });
    return () => svg.removeEventListener("wheel", wheelHandler);
  }, [rotationAngle]);

  const handleWheel = (e) => {
    //e.preventDefault();

    const { zoom, translateX, translateY } = rotationAngle;
    const rect = e.currentTarget.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const logicalX = (mouseX - translateX) / zoom;
    const logicalY = (mouseY - translateY) / zoom;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = zoom * zoomFactor;

    const newTranslateX = mouseX - logicalX * newZoom;
    const newTranslateY = mouseY - logicalY * newZoom;

    setRotationAngle((prev) => ({
      ...prev,
      zoom: newZoom,
      translateX: newTranslateX,
      translateY: newTranslateY,
    }));
  };

  useEffect(() => {
    const selectedPoints = points.filter((p) =>
      interactionPoints.selected.includes(p.id)
    );

    if (selectedPoints.length < 2) {
      setEllipseRadius(10); // raio padrão
      return;
    }

    const distances = selectedPoints.map((p1) => {
      const [x1, y1] = p1.screenCoordinates;

      let minDist = Infinity;
      selectedPoints.forEach((p2) => {
        if (p1.id === p2.id) return;
        const [x2, y2] = p2.screenCoordinates;
        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist < minDist) minDist = dist;
      });

      return minDist;
    });

    const maxMinDistance = Math.max(...distances);
    setEllipseRadius(maxMinDistance);
  }, [points, interactionPoints.selected]);

  return (
    <svg
      id="canvas"
      style={{ display: "block", overflow: "visible" }}
      width={size.w}
      height={size.h}
      onClick={handleBackgroundClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <defs>
        <filter id="groupOpacityFilter" x="0" y="0" width="100%" height="100%">
          <feMerge result="merged">
            <feMergeNode in="SourceGraphic" />
          </feMerge>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.05" />{" "}
            {/* Controla a opacidade global */}
          </feComponentTransfer>
        </filter>
      </defs>
      {interactionPoints.selected.length > 1 && (
        <g filter="url(#groupOpacityFilter)">
          {interactionPoints.selected.map((pointId) => {
            const point = points.find((p) => p.id === pointId);
            if (!point) return null;

            const [x, y] = point.screenCoordinates;
            //const color = point.fill;

            return (
              <ellipse
                key={`highlight-${pointId}`}
                cx={0}
                cy={0}
                rx={ellipseRadius}
                ry={ellipseRadius}
                fill={"var(--elements-color)"}
                fillOpacity={1}
                stroke="var(--highlight-color)"
                strokeWidth={2}
                style={{
                  transition: `${
                    isDraggingState
                      ? "none"
                      : "transform 0.5s ease , r 0.2s ease"
                  }`,
                  transform: `translate(${x}px, ${y}px)`,
                }}
              />
            );
          })}
        </g>
      )}
      {points.map((point) => (
        <Point
          key={point.id}
          id={point.id}
          dragguingMode={isDraggingState}
          rawAttributes={point.rawAttributes}
          umapEmbedding={point.umapEmbedding}
          screenCoordinates={point.screenCoordinates}
          radius={Math.max(
            2,
            Math.min(
              4,
              map(rotationAngle.zoom, patternZoom / 10, patternZoom * 10, 2, 4)
            )
          )}
        />
      ))}

      {isSelecting && selectingBox && (
        <rect
          x={Math.min(selectingBox.startX, selectingBox.endX)}
          y={Math.min(selectingBox.startY, selectingBox.endY)}
          width={
            Math.max(selectingBox.startX, selectingBox.endX) -
            Math.min(selectingBox.startX, selectingBox.endX)
          }
          height={
            Math.max(selectingBox.startY, selectingBox.endY) -
            Math.min(selectingBox.startY, selectingBox.endY)
          }
          fill="var(--elements-color)"
          fillOpacity={0.2}
          stroke="var(--elements-color)"
        />
      )}
    </svg>
  );
}

export default Graph;
