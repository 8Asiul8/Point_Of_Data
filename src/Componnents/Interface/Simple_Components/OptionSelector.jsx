import { useEffect, useState, useRef } from "react";

function OptionSelector({
  placeHolder = false,
  options = [],
  optionColors = "default",
  stateChangeFunction,
}) {
  const componentStyle = {
    border: "2px solid var(--elements-color)",
    margin: "10px 0",
  };
  const componentRef = useRef(null);
  const [optionSelected, setOptionSelected] = useState(
    placeHolder ? placeHolder : options[0]
  );
  const [activeMode, setActiveMode] = useState(false);
  const [arrowOnHover, setArrowOnHover] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target)
      ) {
        setActiveMode(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (optionSelected != placeHolder) {
      if (stateChangeFunction) {
        stateChangeFunction(optionSelected);
      }
    }
  }, [optionSelected]);

  return (
    <div style={componentStyle} ref={componentRef}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
        }}
      >
        <p
          style={{
            flexBasis: 0,
            flexGrow: 1,
            color:
              optionSelected === placeHolder
                ? "var(--interactive-indicator)"
                : "var(--elements-color)",
          }}
        >
          {optionSelected}
        </p>
        <svg
          onMouseEnter={() => setArrowOnHover(true)}
          onMouseLeave={() => setArrowOnHover(false)}
          onClick={() => setActiveMode(!activeMode)}
          width="20px"
          height="20px"
          viewBox="0 0 100 100"
          style={{
            flexShrink: 0,
            transform: activeMode ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease", // animação suave
          }}
        >
          <path
            d="M0 25 L50 75 L100 25 Z"
            fill={
              arrowOnHover
                ? "var(--interaction-feedback) "
                : "var(--interactive-indicator)"
            }
          />
        </svg>
      </div>
      <div
        style={{
          display: activeMode ? "block" : "none",
          borderTop: "2px solid var(--elements-color)",
        }}
      >
        {options.map((option, index) => (
          <p
            style={{
              padding: "10px 20px",
              boxShadow:
                optionColors === "default"
                  ? "none"
                  : `inset 0 0 0 2px ${optionColors[index] ?? "transparent"}`,
            }}
            key={index}
            className="list-option"
            onClick={() => {
              setOptionSelected(option);
              setActiveMode(false);
            }}
          >
            {option}
          </p>
        ))}
      </div>
    </div>
  );
}

export default OptionSelector;
