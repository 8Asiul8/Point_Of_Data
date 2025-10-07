import { useContext, useEffect, useState } from "react";
import Section from "../Section";
import ButtonDeco from "./ButtonDeco";
import {
  DataContext,
  visInputsContext,
  RotationAngleContext,
  ClusterContext,
  PointsContext,
} from "../../../App";

function SaveConfig(props) {
  const [configName, setConfigName] = useState("");
  const [configuration, setConfiguration] = useState({});

  const { data } = useContext(DataContext);
  const { visInputs } = useContext(visInputsContext);
  const { rotationAngle } = useContext(RotationAngleContext);
  const { clusters } = useContext(ClusterContext);
  const { points } = useContext(PointsContext);

  useEffect(() => {
    setConfiguration({
      data,
      visInputs,
      rotationAngle,
      clusters,
      points,
    });
  }, [data, visInputs, rotationAngle, clusters]);

  return (
    <>
      <Section title="Save Configuration">
        <div style={{ marginBottom: "10px", padding: "0 10px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "var(--lable-size)",
            }}
          >
            Preset Filename
          </label>
          <input
            className="inputInStyle"
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder={"e.g., Confuguration_1"}
          />
        </div>
        <ButtonDeco
          lable="Save"
          onClick={() => {
            exportarJSON(configName, configuration);
            props.resetState();
          }}
        />
        <ButtonDeco
          lable="Cancel"
          onClick={() => {
            props.resetState();
          }}
        />
      </Section>
    </>
  );
}

export default SaveConfig;

function exportarJSON(fileName, configuration) {
  const config = {
    fileName: fileName,
    configuration,
  };

  window.electronAPI.saveConfig(`${fileName}.json`, config).then((success) => {
    if (success) {
      alert("Configuração salva com sucesso!");
    } else {
      alert("Erro ao salvar a configuração.");
    }
  });
}
