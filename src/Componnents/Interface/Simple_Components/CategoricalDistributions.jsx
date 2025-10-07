import { useEffect, useRef, useState } from "react";
import HorizontalBar from "./HorizontaalBar";
import ButtonTypeOnly from "./ButtonTypeOnly";

function CategoricalHistogram({
  attributeData = [],
  selectedValues = [],
  hoveredValue = null,
  width = 70,
  attrName = "Attribute",
  clusterColor = "var(--elements-color)",
}) {
  const padding = 0;
  const barHeight = 5;
  const barSpacing = 5;
  const containerRef = useRef(null);
  const [svgWidthPx, setSvgWidthPx] = useState(0);

  const [displayMode, setDisplayMode] = useState("block");

  const handleDisplayChange = () => {
    if (displayMode == "block") setDisplayMode("none");
    else setDisplayMode("block");
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const bbox = container.getBoundingClientRect();
      const svgWidth = (bbox.width * width) / 100;
      setSvgWidthPx(svgWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(container);

    return () => observer.disconnect();
  }, [width]);

  // Agrupamento e contagem
  const [attributesInfo, setAttributesInfo] = useState({
    counts: 0,
    selectedCounts: 0,
    categories: [],
    maxCount: 0,
    pointsID: [],
    selectedPointsID: [],
  });

  useEffect(() => {
    const countMap = {};
    const selectedMap = {};
    const IDMap = {};
    const selectedIDMap = {};

    attributeData.forEach((val) => {
      countMap[val.value] = (countMap[val.value] || 0) + 1;
      if (!IDMap[val.value]) IDMap[val.value] = [];
      IDMap[val.value].push(val.id);

      if (selectedValues.includes(val.id)) {
        selectedMap[val.value] = (selectedMap[val.value] || 0) + 1;
        if (!selectedIDMap[val.value]) selectedIDMap[val.value] = [];
        selectedIDMap[val.value].push(val.id);
      }
    });

    const cats = Object.keys(countMap);
    const max = Math.max(...Object.values(countMap));

    setAttributesInfo({
      counts: countMap,
      selectedCounts: selectedMap,
      categories: cats,
      maxCount: max,
      pointsID: IDMap,
      selectedPointsID: selectedIDMap,
    });
  }, [attributeData]);

  const chartVertSpacing = 10;
  const chartHeight = barHeight * 2 + barSpacing * 3 + chartVertSpacing * 2;

  return (
    <div style={{ width: "100%", marginBottom: "25px" }} ref={containerRef}>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontSize: "var(--lable-size)" }}>
          <b>{attrName}</b>
        </p>
        <ButtonTypeOnly
          initialState="hide"
          secondState="show"
          onChangeFunction={handleDisplayChange}
        />
      </div>
      <div style={{ display: `${displayMode}` }}>
        {attributesInfo.categories.map((cat, i) => {
          const count = attributesInfo.counts[cat];
          const selectedCount = attributesInfo.selectedCounts[cat]
            ? attributesInfo.selectedCounts[cat]
            : 0;

          return (
            <div
              key={cat}
              style={{
                width: "100%",
                display: "flex",
                margin: "0 0",
              }}
            >
              <div
                style={{
                  width: `${100 - width}%`,
                  fontSize: "var(--mini-lable-size)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                  overflow: "hidden",
                  textAlign: "end",
                  paddingRight: "5px",
                }}
              >
                <b style={{ height: "auto" }}>{cat}</b>
              </div>
              <svg
                width={width + "%"}
                height={chartHeight}
                style={{ overflow: "visible" }}
                viewBox={`0 0 ${svgWidthPx} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                {selectedValues.length > 1 ? (
                  <HorizontalBar
                    x={2.5}
                    y={barSpacing + chartVertSpacing}
                    height={barHeight}
                    width={
                      selectedCount >= 1
                        ? 5 +
                          ((svgWidthPx - 5) * selectedCount) /
                            attributesInfo.maxCount
                        : 0
                    }
                    fillColor={clusterColor}
                    pointKeys={attributesInfo.selectedPointsID[cat]}
                  />
                ) : null}

                <HorizontalBar
                  x={2.5}
                  y={barHeight + barSpacing * 2 + chartVertSpacing}
                  height={barHeight}
                  width={
                    count >= 1
                      ? 5 + ((svgWidthPx - 5) * count) / attributesInfo.maxCount
                      : 0
                  }
                  fillColor="var(--elements-color)"
                  pointKeys={attributesInfo.pointsID[cat]}
                />

                {selectedValues.length == 1 && selectedCount == 1 ? (
                  <ellipse
                    cx={svgWidthPx / 2}
                    cy={barSpacing + chartVertSpacing}
                    rx={5}
                    ry={5}
                    fill="var(--elements-color)"
                  />
                ) : null}

                {hoveredValue === cat ? (
                  <ellipse
                    cx={svgWidthPx / 2}
                    cy={barSpacing + chartVertSpacing}
                    rx={5}
                    ry={5}
                    fill="var(--elements-color)"
                    opacity={0.2}
                  />
                ) : null}

                <rect
                  width={5}
                  height={chartHeight + 2.5}
                  x={0}
                  y={-2.5}
                  rx={2.5}
                  ry={2.5}
                  fill="var(--elements-color)"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoricalHistogram;
