// TooltipContext.js
import { createContext, useContext, useState, useRef } from "react";
import { Tooltip } from "./Tooltip";

const TooltipContext = createContext();

function getQuadrant(posX, posY, viewportWidth, viewportHeight) {
  const isLeft = posX < viewportWidth / 2;
  const isTop = posY < viewportHeight / 2;

  if (isTop && isLeft) return "top-left";
  if (isTop && !isLeft) return "top-right";
  if (!isTop && isLeft) return "bottom-left";
  return "bottom-right";
}

export function TooltipProvider({ children }) {
  const [tooltip, setTooltip] = useState({
    content: null,
    position: { x: 0, y: 0 },
    visible: false,
  });

  const delayTimeout = useRef(null);

  const showTooltip = (content, anchor, width = 500, delayMs = 0) => {
    clearTimeout(delayTimeout.current);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;
    let transform = "";

    if (anchor instanceof MouseEvent || anchor instanceof PointerEvent) {
      // Ancorado na posição atual do mouse
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
        "showTooltip: Anchor deve ser um evento de rato ou um elemento HTML."
      );
      return;
    }

    // Aplica o atraso, se necessário
    delayTimeout.current = setTimeout(() => {
      setTooltip({
        visible: true,
        content,
        position: { x, y },
        transform,
        width,
      });
    }, delayMs);
  };

  const hideTooltip = () => {
    clearTimeout(delayTimeout.current);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <TooltipContext.Provider value={{ tooltip, showTooltip, hideTooltip }}>
      {children}
      <Tooltip />
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  return useContext(TooltipContext);
}
