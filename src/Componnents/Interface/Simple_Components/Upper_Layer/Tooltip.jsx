// Tooltip.js
import { useTooltip } from "./TooltipContext";
import { createPortal } from "react-dom";

export function Tooltip() {
  const { tooltip } = useTooltip();

  if (!tooltip.visible) return null;

  const style = {
    all: "revert",
    position: "fixed",
    top: tooltip.position.y,
    left: tooltip.position.x,
    transform: tooltip.transform,

    background: "var(--background-color)",
    color: "var(--elements-color)",
    padding: "6px 10px",
    fontSize: "var(--text-size)",
    border: "solid 2px var(--elements-color)",
    maxWidth: `${tooltip.width}px`,
    width: `${tooltip.width}px`,
    overflow: "visible",

    pointerEvents: "none",
    zIndex: 1000,
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  return createPortal(
    <div className="tooltip" style={style}>
      {tooltip.content}
    </div>,
    document.body
  );
}
