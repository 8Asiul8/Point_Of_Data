import { matrix, identity, multiply, rotationMatrix, resize } from "mathjs";

function PointsTransformer(
  data3d,
  rotationAngleX = 0,
  rotationAngleY = 0,
  rotationAngleZ = 0
) {
  const initialPoints = data3d.map((row) => [...row, 1]); // coordenadas homogêneas

  // Matrizes de rotação 4x4
  const rotateX = resize(rotationMatrix(rotationAngleX, [1, 0, 0]), [4, 4]);
  rotateX[3][3] = 1;

  const rotateY = resize(rotationMatrix(rotationAngleY, [0, 1, 0]), [4, 4]);
  rotateY[3][3] = 1;

  const rotateZ = resize(rotationMatrix(rotationAngleZ, [0, 0, 1]), [4, 4]);
  rotateZ[3][3] = 1;

  // Rotação composta
  const rotationMatrix4x4 = multiply(rotateZ, multiply(rotateY, rotateX));

  // Aplicar rotação, mas não projetar ainda
  const rotatedPoints = initialPoints.map((point) =>
    Array.from(multiply(rotationMatrix4x4, point))
  );

  // Projeção: descartar o z
  const projectedPoints = rotatedPoints.map(([x, y, z, _]) => [x, y]);

  return projectedPoints;
}

function pointsCanvasPos(projPoints, zoom = 1, translateX = 0, translateY = 0) {
  return projPoints.map(([x, y]) => [
    x * zoom + translateX,
    y * zoom + translateY,
  ]);
}

export { PointsTransformer, pointsCanvasPos };
