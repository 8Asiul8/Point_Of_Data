import { useEffect, useRef, useState } from "react";
import HistogramBar from "./HistogramBar"; // Subcomponente
import { map } from "../../../Utils/map";
import React, { Fragment } from "react";

function HistogramSelectorMult({
  AttributeData, // Array de objetos: { id, value }
  selectedValues,
  hoveredValue,
  width = 100,
  height = 100,
  numBars = 50,
  minExpValue,
  maxExpValue,
  attrName,
  valuesColor,
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
    const selectedDataExtremes = Array(numBars)
      .fill()
      .map(() => []);
    const oraganizedDataPoints = Array(numBars)
      .fill()
      .map(() => []);
    const oraganizedSelectedDataPoints = Array(numBars)
      .fill()
      .map(() => []);
    for (let i = 0; i < numBars; i++) {
      AttributeData.forEach((n) => {
        const val = parseFloat(n.value); // ou: Number(n.value)

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

          const selected = selectedValues.includes(n.id);
          if (!selected) {
            return;
          }
          oraganizedSelectedDataPoints[i].push(n.id);

          if (!selectedDataExtremes[i].min) {
            selectedDataExtremes[i].min = val;
          } else {
            if (val < selectedDataExtremes[i].min) {
              selectedDataExtremes[i].min = val;
            }
          }
          if (!selectedDataExtremes[i].max) {
            selectedDataExtremes[i].max = val;
          } else {
            if (val > selectedDataExtremes[i].max) {
              selectedDataExtremes[i].max = val;
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
        selecExtInf: selectedDataExtremes[i].min,
        selecExtSup: selectedDataExtremes[i].max,
        pointArray: oraganizedDataPoints[i],
        selectedPointArray: oraganizedSelectedDataPoints[i],
      }));
    setBarsValue(bars);
  }, [AttributeData, minExpValue, maxExpValue, numBars]);

  const maxVal = Math.max(...barsValue.map((bar) => bar.pointArray.length));
  const maxSelectedVal = Math.max(
    ...barsValue.map((bar) => bar.selectedPointArray.length)
  );

  return (
    <div style={{ marginBottom: "20px" }}>
      <p style={{ fontSize: "var(--lable-size)", marginBottom: "10px" }}>
        <b>{attrName}</b>
      </p>
      <div style={{ margin: "0", padding: "0", position: "relative" }}>
        <p
          style={{
            fontSize: "var(--mini-lable-size)",
            marginBlockEnd: "0",
            position: "absolute",
            pointerEvents: "none",
            display: "block",
          }}
        >
          {maxSelectedVal}
        </p>
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
            const selectedRawHeight =
              bar.selectedPointArray.length >= 1
                ? maxVal == 1
                  ? 50
                  : map(bar.selectedPointArray.length, 1, maxVal, 5, 50)
                : 0;
            const selectedLocalRelHeight =
              bar.selectedPointArray.length >= 1
                ? maxSelectedVal == 1
                  ? 50
                  : map(bar.selectedPointArray.length, 1, maxSelectedVal, 5, 50)
                : 0;

            /*if (!Number.isFinite(rawHeight) || rawHeight < 0) {
            console.warn("Altura inválida para barra", {
              index,
              count: bar.pointArray.length,
              maxVal,
              rawHeight,
            });
          }*/

            return (
              <React.Fragment key={"barPair-" + index}>
                <HistogramBar
                  key={"selectedDataBarLocalRel-" + index}
                  y={47.5 * uni.h - Math.max(0, selectedLocalRelHeight)}
                  x={index * (100 / numBars) + 100 / (numBars * 2)}
                  width={100 / numBars / 1.0}
                  height={Math.max(0, selectedLocalRelHeight)}
                  pointKeys={bar.selectedPointArray}
                  fillColor={valuesColor}
                  minExt={bar.selecExtInf}
                  maxExt={bar.selecExtSup}
                />

                <HistogramBar
                  key={"selectedDataBar-" + index}
                  y={52.5 * uni.h}
                  x={index * (100 / numBars) + 100 / (numBars * 2)}
                  width={100 / numBars / 1.0}
                  height={Math.max(0, selectedRawHeight)}
                  pointKeys={bar.selectedPointArray}
                  fillColor={valuesColor}
                  minExt={bar.selecExtInf}
                  maxExt={bar.selecExtSup}
                />

                <HistogramBar
                  key={"allDataBar-" + index}
                  x={index * (100 / numBars) + 100 / (numBars * 2)}
                  y={52.5 * uni.h}
                  width={100 / numBars / 1.0}
                  height={Math.max(0, rawHeight)}
                  pointKeys={bar.pointArray}
                  fillColor="var(--elements-color)"
                  minExt={bar.extInf}
                  maxExt={bar.extSup}
                />
              </React.Fragment>
            );
          })}
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
            y={47.5 * uni.h}
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

export default HistogramSelectorMult;
