import { useContext, useEffect, useState } from "react";
import { InteractionPointsContext } from "../../../App";
import { useTooltip } from "./Upper_Layer/TooltipContext";

function HorizontalBar({
  x = 0,
  y,
  width,
  height,
  pointKeys = [],
  fillColor,
  catName,
}) {
  const [localHover, setLocalHover] = useState(false);
  const { interactionPoints, setInteractionPoints } = useContext(
    InteractionPointsContext
  );

  const { showTooltip, hideTooltip } = useTooltip();

  const handleMouseEnter = (e) => {
    setLocalHover(true);
    /* onHover(pointIndexes); */
    setInteractionPoints({ ...interactionPoints, hovered: pointKeys });

    showTooltip(
      <>
        <p>Data Points: {pointKeys.length}</p>
      </>,
      e.nativeEvent,
      100,
      0
    );
  };

  const handleMouseLeave = () => {
    setLocalHover(false);
    /* onLeave(pointIndexes); */
    setInteractionPoints({ ...interactionPoints, hovered: [] });

    hideTooltip();
  };

  const handleClick = (e) => {
    setInteractionPoints((prev) => {
      if (!e.ctrlKey) {
        return { ...prev, selected: pointKeys };
      }

      const current = prev.selected ?? [];
      const currentSet = new Set(current);

      const allSelected = pointKeys.every((k) => currentSet.has(k));

      let nextSelected;
      if (allSelected) {
        const toRemove = new Set(pointKeys);
        nextSelected = current.filter((id) => !toRemove.has(id));
      } else {
        nextSelected = [...current];
        for (const k of pointKeys) {
          if (!currentSet.has(k)) nextSelected.push(k);
        }
      }

      return { ...prev, selected: nextSelected };
    });
  };

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fillColor}
      opacity={localHover ? 1 : 0.2}
      onPointerEnter={handleMouseEnter}
      onPointerLeave={handleMouseLeave}
      onPointerDown={handleClick}
      style={{ cursor: "pointer" }}
    />
  );
}

export default HorizontalBar;
