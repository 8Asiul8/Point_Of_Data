import { createContext, useContext, useState, useRef } from "react";
import Popover from "./popover";

const PopoverContext = createContext();

function getQuadrant(posX, posY, viewportWidth, viewportHeight) {
  const isLeft = posX < viewportWidth / 2;
  const isTop = posY < viewportHeight / 2;

  if (isTop && isLeft) return "top-left";
  if (isTop && !isLeft) return "top-right";
  if (!isTop && isLeft) return "bottom-left";
  return "bottom-right";
}

export function PopoverProvider({ children }) {
  const [popover, setPopover] = useState({
    content: null,
    position: { x: 0, y: 0 },
    visible: false,
  });

  const delayTimeout = useRef(null);

  const showPopover = (content, anchor, width = 500, delayMs = 0) => {
    clearTimeout(delayTimeout.current);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;
    let transform = "";

    if (anchor instanceof MouseEvent || anchor instanceof PointerEvent) {
      x = anchor.clientX;
      y = anchor.clientY;

      // Decide a direção com base no quadrante do mouse
      const quadrant = getQuadrant(x, y, viewportWidth, viewportHeight);

      switch (quadrant) {
        case "top-left":
          transform = "translate(10%, 10%)";
          break;
        case "top-right":
          transform = "translate(-110%, 10%)";
          break;
        case "bottom-left":
          transform = "translate(10%, -110%)";
          break;
        case "bottom-right":
          transform = "translate(-110%, -110%)";
          break;
      }
    } else if (anchor instanceof HTMLElement) {
      // Ancorado a um elemento HTML
      const rect = anchor.getBoundingClientRect();
      const quadrant = getQuadrant(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        viewportWidth,
        viewportHeight
      );

      switch (quadrant) {
        case "top-left":
          x = rect.right;
          y = rect.bottom;
          transform = "translate(0%, 0)";
          break;
        case "top-right":
          x = rect.left;
          y = rect.bottom;
          transform = "translate(-100%, 10%)";
          break;
        case "bottom-left":
          x = rect.right;
          y = rect.top;
          transform = "translate(0%, -100%)";
          break;
        case "bottom-right":
          x = rect.left;
          y = rect.top;
          transform = "translate(-100%, -100%)";
          break;
      }
    } else {
      console.warn(
        "showPopover: Anchor deve ser um evento de rato ou um elemento HTML."
      );
      return;
    }
    delayTimeout.current = setTimeout(() => {
      setPopover({
        visible: true,
        content,
        position: { x, y },
        transform,
        width,
      });
    }, delayMs);
  };

  const hidePopover = () => {
    clearTimeout(delayTimeout.current);
    setPopover((prev) => ({ ...prev, visible: false }));
  };

  return (
    <PopoverContext.Provider value={{ popover, showPopover, hidePopover }}>
      {children}
      <Popover />
    </PopoverContext.Provider>
  );
}

export function usePopover() {
  return useContext(PopoverContext);
}
