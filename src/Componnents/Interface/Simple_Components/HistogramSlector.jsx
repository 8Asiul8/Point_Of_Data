import { useEffect, useRef, useState } from "react";
import HistogramBar from "./HistogramBar"; // Subcomponente
import { map } from "../../../Utils/map";

function HistogramSelector({
  AttributeData, // Array de objetos: { id, value }
  selectedValue,
  hoveredValue,
  width = 100,
  height = 80,
  numBars = 50,
  minExpValue,
  maxExpValue,
  attrName,
}) {
  const histogramRef = useRef(null);
  const [uni, setUni] = useState({ w: 1, h: 1 });
  const [barsValue, setBarsValue] = useState([]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (histogramRef.current) {
        const { width: trueWidth, height: trueHeight } =
          histogramRef.current.getBoundingClientRect();
        if (trueWidth > 0 && trueHeight > 0) {
          setUni({
            w: width / trueWidth,
            h: height / trueHeight,
          });
        }
      }
    });

    if (histogramRef.current) {
      resizeObserver.observe(histogramRef.current);
    }

    return () => {
      if (histogramRef.current) {
        resizeObserver.unobserve(histogramRef.current);
      }
    };
  }, [width, height]);

  useEffect(() => {
    const dataIntervals = (maxExpValue - minExpValue) / numBars;
    const dataExtremes = Array(numBars)
      .fill()
      .map(() => []);
    const oraganizedDataPoints = Array(numBars)
      .fill()
      .map(() => []);
    for (let i = 0; i < numBars; i++) {
      AttributeData.forEach((n) => {
        const val = parseFloat(n.value);
        if (!Number.isFinite(val)) return; // ignora se não for número

        if (
          val >= i * dataIntervals + minExpValue &&
          val <= (i + 1) * dataIntervals + minExpValue
        ) {
          oraganizedDataPoints[i].push(n.id);

          if (!dataExtremes[i].min) {
            dataExtremes[i].min = val;
          } else {
            if (val < dataExtremes[i].min) {
              dataExtremes[i].min = val;
            }
          }
          if (!dataExtremes[i].max) {
            dataExtremes[i].max = val;
          } else {
            if (val > dataExtremes[i].max) {
              dataExtremes[i].max = val;
            }
          }
        }
      });
    }

    const bars = Array(numBars)
      .fill()
      .map((_, i) => ({
        extInf: dataExtremes[i].min,
        extSup: dataExtremes[i].max,
        pointArray: oraganizedDataPoints[i],
      }));
    setBarsValue(bars);
  }, [AttributeData, minExpValue, maxExpValue, numBars]);

  const maxVal = Math.max(...barsValue.map((bar) => bar.pointArray.length));

  return (
    <div style={{ marginBottom: "20px" }}>
      <p style={{ fontSize: "var(--lable-size)" }}>
        <b>{attrName}</b> {selectedValue !== null ? `: ${selectedValue}` : null}
      </p>

      <div
        style={{
          margin: "0",
          padding: "0",
          position: "relative",
          lineHeight: 0,
        }}
      >
        <svg
          ref={histogramRef}
          width="100%"
          height={`${height}px`}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ overflow: "visible", display: "block" }}
        >
          {barsValue.map((bar, index) => {
            const rawHeight =
              bar.pointArray.length >= 1
                ? maxVal == 1
                  ? 50
                  : map(bar.pointArray.length, 1, maxVal, 5, 50)
                : 0;

            return (
              <HistogramBar
                key={index}
                x={index * (100 / numBars) + 100 / (numBars * 2)}
                width={100 / numBars / 1.0}
                height={Math.max(0, rawHeight)}
                pointKeys={bar.pointArray}
                fillColor="var(--elements-color)"
                minExt={bar.extInf}
                maxExt={bar.extSup}
              />
            );
          })}
          {selectedValue != null ? (
            <ellipse
              cx={map(selectedValue, minExpValue, maxExpValue, 0, 100) ?? 0}
              cy={10}
              rx={5 * uni.w}
              ry={5 * uni.h}
              fill="var(--elements-color)"
            />
          ) : null}
          {hoveredValue != null ? (
            <ellipse
              cx={map(hoveredValue, minExpValue, maxExpValue, 0, 100)}
              cy={10}
              rx={5 * uni.w}
              ry={5 * uni.h}
              fill="var(--elements-color)"
              opacity={0.5}
            />
          ) : null}
          <rect
            width={width}
            height={5 * uni.h}
            x={0}
            y={27.5 * uni.h}
            rx={2.5 * uni.w}
            ry={2.5 * uni.h}
            fill="var(--elements-color)"
          />
        </svg>
        <p
          style={{
            fontSize: "var(--mini-lable-size)",
            marginBlockEnd: "0",
            position: "absolute",
            bottom: "0px",
            pointerEvents: "none",
            display: "block",
          }}
        >
          {maxVal}
        </p>
      </div>
    </div>
  );
}

export default HistogramSelector;
