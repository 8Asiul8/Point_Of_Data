import { useContext, useEffect, useState } from "react";
import { InteractionPointsContext, DataContext } from "../../App";
import Section from "./Section";
import HistogramSelector from "./Simple_Components/HistogramSlector";
import HistogramSelectorMult from "./Simple_Components/HistogramSelectorMult";
import ButtonDeco from "./Simple_Components/ButtonDeco";
import OptionSelector from "./Simple_Components/OptionSelector";
import SliderBasico from "./Simple_Components/SliderBasic";
import { ClusterContext } from "../../App";
import { arrayComp } from "../../Utils/arrayCompar";
import CategoricalHistogram from "./Simple_Components/CategoricalDistributions";

function RightBar(props) {
  const thisStyle = {
    display: props.display,
    borderLeft: "5px solid var(--elements-color)",
    height: "100vh",
    gridColumn: "span 1",
    width: "100%",
    paddingTop: "20px",
    overflowY: "auto",
    boxSizing: "border-box", //ADDED
    zIndex: "100",
  };

  const { interactionPoints } = useContext(InteractionPointsContext);
  const { data } = useContext(DataContext);
  const { clusters, setClusters } = useContext(ClusterContext);
  const [attributes, setAttributes] = useState([]);
  const [categoricalAtributes, setCategoricalAtributes] = useState([]);
  const [clusterCreationMode, setClusterCreationMode] = useState(false);

  useEffect(() => {
    if (data.length === 0) return;

    const first = data[0];
    const keys = Object.keys(first).filter((k) => k.toLowerCase() !== "key");

    const numericKeys = keys.filter((key) =>
      data.every((row) => !isNaN(parseFloat(row[key])))
    );

    const categoricalKeys = keys.filter(
      (key) =>
        !numericKeys.includes(key) &&
        data.some((row) => typeof row[key] === "string" || isNaN(row[key]))
    );

    setAttributes(numericKeys);
    setCategoricalAtributes(categoricalKeys);
  }, [data]);

  return (
    <div id="rightBar" style={thisStyle}>
      {interactionPoints.selected.length === 0 && (
        <NoPointSelected
          selectedPoints={interactionPoints.selected}
          hoveredPoints={
            interactionPoints.hovered.length == 1
              ? interactionPoints.hovered
              : []
          }
          attributes={attributes}
          catAttributes={categoricalAtributes}
          clusters={clusters}
          data={data}
        />
      )}
      {interactionPoints.selected.length === 1 && (
        <SinglePointPanel
          selectedPoints={interactionPoints.selected}
          hoveredPoints={
            interactionPoints.hovered.length == 1
              ? interactionPoints.hovered
              : []
          }
          attributes={attributes}
          catAttributes={categoricalAtributes}
          clusters={clusters}
          data={data}
          clusterCreationMode={clusterCreationMode}
          setClusterCreationMode={setClusterCreationMode}
        />
      )}
      {interactionPoints.selected.length > 1 && (
        <MultiPointPanel
          selectedPoints={interactionPoints.selected}
          hoveredPoints={
            interactionPoints.hovered.length == 1
              ? interactionPoints.hovered
              : []
          }
          attributes={attributes}
          catAttributes={categoricalAtributes}
          clusters={clusters}
          data={data}
          clusterCreationMode={clusterCreationMode}
          setClusterCreationMode={setClusterCreationMode}
        />
      )}
    </div>
  );
}

// SubComponentes

function SinglePointPanel({
  attributes,
  catAttributes,
  selectedPoints,
  hoveredPoints,
  clusters,
  data,
  clusterCreationMode,
  setClusterCreationMode,
}) {
  const clusterEncontrado = clusters.find((cluster) =>
    arrayComp(cluster.points, selectedPoints)
  );

  const clusterColor = clusterEncontrado
    ? clusterEncontrado.color
    : "var(--elements-color)";
  return (
    <>
      <p
        style={{
          fontSize: "var(--bigger-tittle-size)",
          marginLeft: "25px",
          marginTop: "25px",
        }}
      >
        <b>{selectedPoints[0]}</b>
      </p>
      {clusterCreationMode ? (
        <ClusterCreation
          setClusterCreationMode={setClusterCreationMode}
          clusterEncontrado={clusterEncontrado}
        />
      ) : (
        <ClusterCreationIniciator
          setClusterCreationMode={setClusterCreationMode}
          clusterEncontrado={clusterEncontrado}
        />
      )}
      <Section
        title="Attributes"
        tooltipContent={
          <ul
            style={{
              display: " block",
              listStyleType: "disc",
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              paddingInlineStart: "40px",
            }}
          >
            <li style={{ margin: 0 }}>
              Each attribute has a histogram at the bottom.
            </li>
            <li>
              Bottom bars show two overlapped series: full dataset (background)
              and current selection (foreground, semi-transparent).
            </li>
            <li style={{ margin: 0 }}>
              Top bar heights are normalized to the attribute’s local maximum,
              and bottom bars are normalized to the global maximum.
            </li>
            <li style={{ margin: 0 }}>
              Upward markers visualize only the selection: a dot for a single
              selected point, or bars for multiple points.
            </li>
            <li style={{ margin: 0 }}>
              Bars have a minimum display height so tiny bins remain clickable.
            </li>
            <li style={{ margin: 0 }}>
              Click a bar to select all points whose values fall within that
              range.
            </li>
          </ul>
        }
      >
        {attributes.map((attr) => {
          const attributeData = data
            .map((d, i) => ({
              id: d.key ?? i, // usa d.key se existir, senão o índice
              value: parseFloat(d[attr]),
            }))
            .filter((item) => !isNaN(item.value));

          return (
            <HistogramSelector
              key={attr}
              attrName={attr}
              AttributeData={attributeData}
              selectedValue={
                selectedPoints.length != 0
                  ? parseFloat(
                      data.find((d) => d.key === selectedPoints[0])?.[attr]
                    )
                  : null
              }
              hoveredValue={
                hoveredPoints.length != 0
                  ? parseFloat(
                      data.find((d) => d.key === hoveredPoints[0])?.[attr]
                    )
                  : null
              }
              minExpValue={Math.min(...attributeData.map((d) => d.value))}
              maxExpValue={Math.max(...attributeData.map((d) => d.value))}
            />
          );
        })}
        {catAttributes.map((attr) => {
          const attributeData = data
            .map((d, i) => ({
              id: d.key ?? i, // usa d.key se existir, senão o índice
              value: d[attr],
            }))
            .filter((item) => item.value !== undefined && item.value !== null);

          return (
            <CategoricalHistogram
              key={attr}
              attributeData={attributeData}
              selectedValues={selectedPoints}
              hoveredValue={
                hoveredPoints.length === 1
                  ? attributeData.find((point) => point.id === hoveredPoints[0])
                      ?.value ?? null
                  : null
              }
              attrName={attr}
              clusterColor={clusterColor}
            />
          );
        })}
      </Section>
    </>
  );
}

function NoPointSelected({
  attributes,
  catAttributes,
  selectedPoints,
  hoveredPoints,
  clusters,
  data,
}) {
  const clusterEncontrado = clusters.find((cluster) =>
    arrayComp(cluster.points, selectedPoints)
  );

  const clusterColor = clusterEncontrado
    ? clusterEncontrado.color
    : "var(--elements-color)";
  return (
    <>
      <p style={{ fontSize: "var(--text-size)", marginLeft: "25px" }}>
        {data.length} Data Entries
      </p>
      <Section
        title="Attributes"
        tooltipContent={
          <ul
            style={{
              display: " block",
              listStyleType: "disc",
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              paddingInlineStart: "20px",
            }}
          >
            <li style={{ margin: 0 }}>
              Each attribute has a histogram at the bottom.
            </li>
            <li>
              Bottom bars show two overlapped series: full dataset (background)
              and current selection (foreground, semi-transparent).
            </li>
            <li style={{ margin: 0 }}>
              Top bar heights are normalized to the attribute’s local maximum,
              and bottom bars are normalized to the global maximum.
            </li>
            <li style={{ margin: 0 }}>
              Upward markers visualize only the selection: a dot for a single
              selected point, or bars for multiple points.
            </li>
            <li style={{ margin: 0 }}>
              Bars have a minimum display height so tiny bins remain clickable.
            </li>
            <li style={{ margin: 0 }}>
              Click a bar to select all points whose values fall within that
              range.
            </li>
          </ul>
        }
      >
        {attributes.map((attr) => {
          const attributeData = data
            .map((d, i) => ({
              id: d.key ?? i, // usa d.key se existir, senão o índice
              value: parseFloat(d[attr]),
            }))
            .filter((item) => !isNaN(item.value));

          return (
            <HistogramSelector
              key={attr}
              attrName={attr}
              AttributeData={attributeData}
              selectedValue={null}
              hoveredValue={
                hoveredPoints.length != 0
                  ? parseFloat(
                      data.find((d) => d.key === hoveredPoints[0])?.[attr]
                    )
                  : null
              }
              minExpValue={Math.min(...attributeData.map((d) => d.value))}
              maxExpValue={Math.max(...attributeData.map((d) => d.value))}
            />
          );
        })}
        {catAttributes.map((attr) => {
          const attributeData = data
            .map((d, i) => ({
              id: d.key ?? i, // usa d.key se existir, senão o índice
              value: d[attr],
            }))
            .filter((item) => item.value !== undefined && item.value !== null);

          return (
            <CategoricalHistogram
              key={attr}
              attributeData={attributeData}
              selectedValues={selectedPoints}
              hoveredValue={
                hoveredPoints.length === 1
                  ? attributeData.find((point) => point.id === hoveredPoints[0])
                      ?.value ?? null
                  : null
              }
              attrName={attr}
              clusterColor={clusterColor}
            />
          );
        })}
      </Section>
    </>
  );
}

function MultiPointPanel({
  attributes,
  catAttributes,
  selectedPoints,
  hoveredPoints,
  clusters,
  data,
  clusterCreationMode,
  setClusterCreationMode,
}) {
  const clusterEncontrado = clusters.find((cluster) =>
    arrayComp(cluster.points, selectedPoints)
  );

  const clusterColor = clusterEncontrado
    ? clusterEncontrado.color
    : "var(--elements-color)";

  return (
    <>
      <div style={{ marginTop: "25px" }}>
        {clusterEncontrado ? (
          <p
            style={{
              fontSize: "var(--bigger-tittle-size)",
              marginLeft: "25px",
            }}
          >
            <b>{clusterEncontrado.name}</b>
          </p>
        ) : null}
        <p style={{ fontSize: "var(--text-size)", marginLeft: "25px" }}>
          {selectedPoints.length} Points Selected
        </p>
      </div>
      {clusterCreationMode ? (
        <ClusterCreation
          setClusterCreationMode={setClusterCreationMode}
          clusterEncontrado={clusterEncontrado}
        />
      ) : (
        <ClusterCreationIniciator
          setClusterCreationMode={setClusterCreationMode}
          clusterEncontrado={clusterEncontrado}
        />
      )}
      <Section
        title="Attributes"
        tooltipContent={
          <ul
            style={{
              display: " block",
              listStyleType: "disc",
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              paddingInlineStart: "20px",
            }}
          >
            <li style={{ margin: 0 }}>
              Each attribute has a histogram at the bottom.
            </li>
            <li>
              Bottom bars show two overlapped series: full dataset (background)
              and current selection (foreground, semi-transparent).
            </li>
            <li style={{ margin: 0 }}>
              Top bar heights are normalized to the attribute’s local maximum,
              and bottom bars are normalized to the global maximum.
            </li>
            <li style={{ margin: 0 }}>
              Upward markers visualize only the selection: a dot for a single
              selected point, or bars for multiple points.
            </li>
            <li style={{ margin: 0 }}>
              Bars have a minimum display height so tiny bins remain clickable.
            </li>
            <li style={{ margin: 0 }}>
              Click a bar to select all points whose values fall within that
              range.
            </li>
          </ul>
        }
      >
        {attributes.map((attr) => {
          const attributeData = data
            .map((d, i) => ({
              id: d.key ?? i, // usa d.key se existir, senão o índice
              value: parseFloat(d[attr]),
            }))
            .filter((item) => !isNaN(item.value));

          return (
            <HistogramSelectorMult
              key={attr}
              valuesColor={clusterColor}
              attrName={attr}
              AttributeData={attributeData}
              selectedValues={selectedPoints}
              hoveredValue={
                hoveredPoints.length != 0
                  ? parseFloat(
                      data.find((d) => d.key === hoveredPoints[0])?.[attr]
                    )
                  : null
              }
              minExpValue={Math.min(...attributeData.map((d) => d.value))}
              maxExpValue={Math.max(...attributeData.map((d) => d.value))}
            />
          );
        })}
        {catAttributes.map((attr) => {
          const attributeData = data
            .map((d, i) => ({
              id: d.key ?? i, // usa d.key se existir, senão o índice
              value: d[attr],
            }))
            .filter((item) => item.value !== undefined && item.value !== null);

          return (
            <CategoricalHistogram
              key={attr}
              attributeData={attributeData}
              selectedValues={selectedPoints}
              hoveredValue={
                hoveredPoints.length === 1
                  ? attributeData.find((point) => point.id === hoveredPoints[0])
                      ?.value ?? null
                  : null
              }
              attrName={attr}
              clusterColor={clusterColor}
            />
          );
        })}
      </Section>
    </>
  );
}

function ClusterCreationIniciator({
  setClusterCreationMode,
  clusterEncontrado,
}) {
  const { interactionPoints } = useContext(InteractionPointsContext);
  const { clusters, setClusters } = useContext(ClusterContext);
  return (
    <Section
      title="Cluster"
      tooltipContent="You can create a cluster from any selection of points. However, each point can belong to only one cluster at a time — adding it to a new cluster will remove it from the previous one. A cluster must contain at least one point; otherwise, it will be deleted."
    >
      <ButtonDeco
        lable={clusterEncontrado ? "Edit Cluster" : "Create Cluster"}
        onClick={() => setClusterCreationMode(true)}
      />
      <OptionSelector
        placeHolder="Add to Cluster"
        options={clusters.map((cluster) => cluster.name)}
        optionColors={clusters.map((cluster) => cluster.color)}
        stateChangeFunction={(selClusterName) => {
          // 1. Remover os pontos selecionados de todos os clusters
          let cleanedClusters = clusters.map((cluster) => ({
            ...cluster,
            points: cluster.points.filter(
              (id) => !interactionPoints.selected.includes(id)
            ),
          }));

          // 2. Encontrar o cluster com o nome selecionado
          const clusterIndex = cleanedClusters.findIndex(
            (cluster) => cluster.name === selClusterName
          );

          // 3. Adicionar os pontos selecionados a esse cluster (caso exista)
          if (clusterIndex !== -1) {
            const updatedCluster = {
              ...cleanedClusters[clusterIndex],
              points: [
                ...cleanedClusters[clusterIndex].points,
                ...interactionPoints.selected,
              ],
            };

            // 4. Substituir o cluster antigo pelo novo
            cleanedClusters[clusterIndex] = updatedCluster;
          }

          // 5. Atualizar o estado
          cleanedClusters = cleanedClusters.filter(
            (cluster) => cluster.points.length > 0
          );
          setClusters(cleanedClusters);
        }}
      />
      <ButtonDeco
        lable="Remove from Cluster"
        onClick={() => {
          let updatedClusters = clusters.map((cluster) => ({
            ...cluster,
            points: cluster.points.filter(
              (id) => !interactionPoints.selected.includes(id)
            ),
          }));
          const cleanedClusters = updatedClusters.filter(
            (cluster) => cluster.points.length > 0
          );
          setClusters(cleanedClusters);
        }}
      />
    </Section>
  );
}

function ClusterCreation({ setClusterCreationMode, clusterEncontrado }) {
  const { clusters, setClusters } = useContext(ClusterContext);
  const { interactionPoints } = useContext(InteractionPointsContext);
  const [clusterName, setClusterName] = useState("");
  const [clusterColor, setClusterColor] = useState(
    `hsl(180, 100%, var(--brighPoints))`
  );

  useEffect(() => {
    if (clusterEncontrado) {
      setClusterName(clusterEncontrado.name);
      setClusterColor(clusterEncontrado.color);
    }
  }, [interactionPoints.selected]);

  return (
    <Section
      title={clusterEncontrado ? "Edit Cluster" : "Create Cluster"}
      tooltipContent="You can create a cluster from any selection of points. However, each point can belong to only one cluster at a time — adding it to a new cluster will remove it from the previous one. A cluster must contain at least one point; otherwise, it will be deleted."
    >
      <div style={{ marginBottom: "10px", padding: "0 10px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "var(--lable-size)",
          }}
        >
          Cluster Name
        </label>
        <input
          className="inputInStyle"
          type="text"
          value={clusterName}
          onChange={(e) => setClusterName(e.target.value)}
          placeholder={
            clusterEncontrado ? clusterEncontrado.name : "e.g., Cluster A"
          }
        />
      </div>
      <SliderBasico
        value={
          clusterEncontrado
            ? parseFloat(clusterEncontrado.color.match(/hsl\((\d+),/)[1])
            : 180
        }
        colorIndicator={true}
        liveOnChange={true}
        onChange={(val) =>
          setClusterColor(`hsl(${val}, 100%, var(--brighPoints)`)
        }
        numSteps={361}
        lable="Cluster Color"
        conversionFunction={(value) => Math.floor((value * 360) / 100)}
      />
      <ButtonDeco
        lable="Save"
        onClick={() => {
          const trimmedName = clusterName.trim();
          if (!trimmedName || interactionPoints.selected.length === 0) return;

          // CRIAÇÃO
          if (!clusterEncontrado) {
            const nameExists = clusters.some(
              (cluster) =>
                cluster.name.toLowerCase() === trimmedName.toLowerCase()
            );

            if (nameExists) {
              alert(
                "Cluster name already exists. Please choose a unique name."
              );
              return;
            }

            // 1. Remove pontos selecionados de clusters existentes
            const updatedClusters = clusters.map((cluster) => ({
              ...cluster,
              points: cluster.points.filter(
                (id) => !interactionPoints.selected.includes(id)
              ),
            }));

            // 2. Cria novo cluster
            const newCluster = {
              name: clusterName,
              color: clusterColor,
              points: interactionPoints.selected,
            };

            // 3. Atualiza clusters
            setClusters([...updatedClusters, newCluster]);
          } else {
            // EDIÇÃO
            const updatedClusters = clusters.map((cluster) => {
              if (cluster.name === clusterEncontrado.name) {
                // Atualiza o cluster existente
                return {
                  ...cluster,
                  name: clusterName,
                  color: clusterColor,
                  points: interactionPoints.selected,
                };
              } else {
                // Garante que os pontos selecionados sejam removidos dos outros clusters
                return {
                  ...cluster,
                  points: cluster.points.filter(
                    (id) => !interactionPoints.selected.includes(id)
                  ),
                };
              }
            });

            setClusters(updatedClusters);
          }

          setClusterCreationMode(false);
        }}
      />
      <ButtonDeco
        lable="Cancel"
        onClick={() => {
          setClusterCreationMode(false);
        }}
      />
    </Section>
  );
}

export default RightBar;
