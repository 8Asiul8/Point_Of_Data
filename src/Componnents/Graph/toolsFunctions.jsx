import { RotationAngleContext } from "../../App";
import { ToolsContext } from "../../App";

function moveGraph(posAntX, posAntY, deslocamentoX, deslocamentoY) {
  const newPos = [posAntX + deslocamentoX, posAntY + deslocamentoY];
  return newPos;
}

export { moveGraph };
