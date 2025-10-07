import { useEffect, useRef, useState } from "react";
import { map } from "../../../Utils/map";

function SliderBasico(props) {
  const componentStyle = {
    margin: "10px 0",
    fontSize: "var(--lable-size)",
    display: "block",
    with: "100%",
  };

  const { colorIndicator = false } = props;
  const svgRef = useRef(null);
  const [uni, setUni] = useState({ w: 1, h: 1 });
  const [value, setValue] = useState(50); // valor do slider (0 a 100)
  const numSteps = props.numSteps ?? 100;

  const [isHovered, setIsHovered] = useState(false);
  const [colorInd, setColorInd] = useState("var(--elements-color)");

  const trueHeight = 20;

  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setUni({
        w: 100 / ((width / height) * trueHeight),
        h: 100 / trueHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (props.value != null) {
      const min = props.conversionFunction ? props.conversionFunction(0) : 0;
      const max = props.conversionFunction
        ? props.conversionFunction(100)
        : 100;
      setValue(map(props.value, min, max, 0, 100));
    }
  }, []);

  useEffect(() => {
    if (colorIndicator) {
      setColorInd(`hsl(${(value * 360) / 100}, 100%, 50%)`);
    }
  }, [value]);

  const updateValueFromEvent = (event) => {
    if (!svgRef.current) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const percent = (pointerX / bounds.width) * 100;

    const stepSize = 100 / numSteps;
    const steppedValue = Math.round(percent / stepSize) * stepSize;

    setValue(Math.max(0, Math.min(steppedValue, 100)));
  };

  const startDrag = (event) => {
    updateValueFromEvent(event);

    window.addEventListener("pointermove", updateValueFromEvent);
    window.addEventListener("pointerup", (e) => stopDrag(e), { once: true });
  };

  const stopDrag = (event) => {
    window.removeEventListener("pointermove", updateValueFromEvent);

    if (!svgRef.current) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const percent = (pointerX / bounds.width) * 100;

    const stepSize = 100 / numSteps;
    const steppedValue = Math.round(percent / stepSize) * stepSize;
    const clampedValue = Math.max(0, Math.min(steppedValue, 100));

    const finalValue = props.conversionFunction
      ? props.conversionFunction(clampedValue)
      : clampedValue;

    setValue(clampedValue);
    if (props.onChange) props.onChange(finalValue);
  };

  return (
    <div style={componentStyle}>
      <p /* style={{ fontSize: "var(--lable-size)" }} */>
        <b>
          {props.lable}:{" "}
          {props.conversionFunction ? props.conversionFunction(value) : value}
        </b>
      </p>
      <svg
        ref={svgRef}
        height={`${trueHeight}px`}
        width="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{ overflow: "visible", marginBottom: "20px" }}
      >
        {/* Barra de fundo (clicável) */}
        <rect
          width={100}
          height={5 * uni.h}
          x={0}
          y={7.5 * uni.h}
          rx={2.5 * uni.w}
          ry={2.5 * uni.h}
          fill={
            isHovered
              ? "var(--interaction-feedback)"
              : "var(--interactive-indicator)"
          }
          onPointerDown={startDrag}
          style={{ cursor: "pointer" }}
        />

        {/* Barra preenchida (visual) */}
        <rect
          width={value + 2.5 * uni.w}
          height={5 * uni.h}
          x={0}
          y={7.5 * uni.h}
          rx={2.5 * uni.w}
          ry={2.5 * uni.h}
          fill="var(--elements-color)"
          onPointerDown={startDrag}
          style={{ cursor: "pointer" }}
        />

        {/* Botão do slider */}
        <ellipse
          cx={value}
          cy={10 * uni.h}
          rx={8 * uni.w}
          ry={8 * uni.h}
          fill={colorInd}
          onPointerDown={startDrag}
          style={{ cursor: "pointer" }}
        />
      </svg>
    </div>
  );
}

export default SliderBasico;
