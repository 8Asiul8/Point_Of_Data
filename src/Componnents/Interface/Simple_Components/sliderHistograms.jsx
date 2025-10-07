import { useEffect, useRef, useState } from "react";

function SliderHistogram(props) {
  const trueHeight = 75;
  const svgRef = useRef(null);
  const [uni, setUni] = useState({ w: 1, h: 1 });
  const [value, setValue] = useState(50);
  const numSteps = 200;
  const [isHovered, setIsHovered] = useState(false);

  const [numOfBars, setNumOfBars] = useState(20);
  const [dataInterval, setDataInterval] = useState(0);
  const [dataOnIntervals, setDataOnIntervals] = useState([]);

  useEffect(() => {
    setDataInterval((props.maxVal - props.minVal) / numOfBars);
  }, [numOfBars]);

  useEffect(() => {
    if (props.data != null && props.data.length > 0 && dataInterval > 0) {
      const counts = new Array(numOfBars).fill(0);

      props.data.forEach((v) => {
        const index = Math.floor((v - props.minVal) / dataInterval);
        if (index >= 0 && index < numOfBars) {
          counts[index]++;
        }
      });

      setDataOnIntervals(counts);
    }
  }, [props.data, dataInterval]);

  useEffect(() => {
    setNumOfBars(Math.floor(value / 2));
  }, [value]);

  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setUni({
        w: 100 / ((width / height) * trueHeight),
        h: 100 / trueHeight,
      });
    }
  }, []);

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
    window.addEventListener("pointerup", handleStopDrag, { once: true });
  };

  const handleStopDrag = (event) => {
    window.removeEventListener("pointermove", updateValueFromEvent);

    if (!svgRef.current) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const percent = (pointerX / bounds.width) * 100;

    const stepSize = 100 / numSteps;
    const steppedValue = Math.round(percent / stepSize) * stepSize;
    const clampedValue = Math.max(0, Math.min(steppedValue, 100));

    setValue(clampedValue);

    const finalWeight = props.mapSliderToWeight
      ? props.mapSliderToWeight(clampedValue)
      : clampedValue;

    if (props.onChange) props.onChange(finalWeight);
  };

  return (
    <>
      <p style={{ fontSize: "var(--lable-size)" }}>
        <b>{props.lable}: </b> {props.mapSliderToWeight(value)}
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
        {/* Barra de fundo */}
        <rect
          width={100}
          height={5 * uni.h}
          x={0}
          y={22.5 * uni.h}
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

        {/* Barra preenchida */}
        <rect
          width={value + 2.5 * uni.w}
          height={5 * uni.h}
          x={0}
          y={22.5 * uni.h}
          rx={2.5 * uni.w}
          ry={2.5 * uni.h}
          fill="var(--elements-color)"
          onPointerDown={startDrag}
          style={{ cursor: "pointer" }}
        />

        {/* Triângulo marcador */}
        <path
          d={`M${value}, ${17 * uni.h}
              L${value + 15 * uni.w}, ${25 * uni.h}
              L${value}, ${33 * uni.h} Z`}
          fill="var(--elements-color)"
          onPointerDown={startDrag}
          style={{ cursor: "pointer" }}
        />

        {/* Barras do histograma */}
        {numOfBars > 1 &&
          dataOnIntervals.map((count, index) => {
            const maxCount = Math.max(...dataOnIntervals);
            const barHeight =
              maxCount > 0 ? (count / maxCount) * (50 * uni.h) : 0;

            const barWidth = value / numOfBars;
            const x = index * barWidth;
            const y = 27.5 * uni.h;

            return (
              <rect
                key={index}
                x={x + barWidth / 6}
                y={y}
                width={barWidth - barWidth / 3}
                height={barHeight}
                fill="var(--elements-color)"
                style={{ pointerEvents: "none" }}
              />
            );
          })}
      </svg>
    </>
  );
}

export default SliderHistogram;
