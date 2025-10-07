import React from "react";
import { useState, isValidElement, cloneElement } from "react";

export function ToolButtonAction({ children, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const style = {
    boxSizing: "border-box",
    width: "40px",
    height: "40px",
    background: "var(--background-color)",
    border: pressed ? "2px solid var(--elements-color)" : "none",
    padding: pressed ? "3px" : "5px",
    transform: "rotate(-90deg)",
  };

  const iconStyle = {
    width: "30px",
    height: "30px",
    fill: hovered
      ? "var(--interaction-feedback)"
      : "var(--interactive-indicator)", // Azul no hover, escuro no normal
    transition: "fill 0.2s ease",
  };

  const styledChild = React.isValidElement(children)
    ? React.cloneElement(children, { style: iconStyle })
    : children;

  function handleClick() {
    if (props.onClickAction !== null) {
      props.onClickAction();
    }
    setPressed(true);
  }

  return (
    <div
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => handleClick()}
      onMouseUp={() => setPressed(false)}
    >
      {styledChild}
    </div>
  );
}

export function ToolButtonModeControl({
  children,
  value,
  onChange,
  selectedWhen,
}) {
  const [hovered, setHovered] = useState(false);
  const isSelected = value === selectedWhen;

  const style = {
    boxSizing: "border-box",
    width: "40px",
    height: "40px",
    background: "var(--background-color)",
    border: isSelected ? "2px solid var(--elements-color)" : "none",
    padding: isSelected ? "3px" : "5px",
    transform: "rotate(-90deg)",
  };

  const iconStyle = {
    width: "30px",
    height: "30px",
    fill: hovered
      ? "var(--interaction-feedback)"
      : "var(--interactive-indicator)", // Azul no hover, escuro no normal
    transition: "fill 0.2s ease",
    stroke: hovered
      ? "var(--interaction-feedback)"
      : "var(--interactive-indicator)",
  };

  const styledChild = isValidElement(children)
    ? cloneElement(children, { style: iconStyle })
    : children;

  return (
    <div
      style={style}
      onClick={() => onChange?.(selectedWhen)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {styledChild}
    </div>
  );
}
