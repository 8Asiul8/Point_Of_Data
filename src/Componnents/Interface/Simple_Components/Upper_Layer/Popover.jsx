import { createPortal } from "react-dom";
import { usePopover } from "./PopoverContext";
import { useEffect, useRef } from "react";

function Popover() {
  const { popover, hidePopover } = usePopover();
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popover.visible &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        hidePopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popover.visible, hidePopover]);

  if (!popover.visible) return null;

  const style = {
    position: "fixed",
    top: popover.position.y,
    left: popover.position.x,
    transform: popover.transform,

    background: "var(--background-color)",
    color: "var(--elements-color)",
    padding: "20px 10px",
    fontSize: "var(--text-size)",
    border: "solid 2px var(--elements-color)",
    maxWidth: `${popover.width}px`,
    width: `${popover.width}px`,
    overflow: "visible",

    pointerEvents: "auto",
    zIndex: 1000,
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  return createPortal(
    <div className="popover" ref={popoverRef} style={style}>
      {popover.content}
    </div>,
    document.body
  );
}

export default Popover;
