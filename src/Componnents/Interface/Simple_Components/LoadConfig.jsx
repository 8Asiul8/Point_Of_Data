import { useContext, useRef, useState, useEffect, createContext } from "react";
import {
  DataContext,
  visInputsContext,
  RotationAngleContext,
  ClusterContext,
  PointsContext,
} from "../../../App";
import ButtonDeco from "./ButtonDeco";

function LoadConfig() {
  const fileInputRef = useRef(null);

  const { setData } = useContext(DataContext);
  const { visInputs, setVisInputs } = useContext(visInputsContext);
  const { setRotationAngle } = useContext(RotationAngleContext);
  const { setClusters } = useContext(ClusterContext);
  const { points, setPoints } = useContext(PointsContext);

  const { setIsLoadingConfig } = useIsLoadingConfig();

  const [config, setConfig] = useState(null);
  const [loadStep, setLoadStep] = useState(0);

  useEffect(() => {
    if (loadStep === 0 && config) {
      setData(config.data);
      setLoadStep(1);
    }
  }, [config]);

  useEffect(() => {
    if (loadStep === 1 && config) {
      setVisInputs(config.visInputs);
      setRotationAngle(config.rotationAngle);
      setClusters(config.clusters);
      setPoints(config.points);
      setLoadStep(2);
    }
  }, [visInputs.atrWeights]);

  useEffect(() => {
    if (loadStep === 2 && config) {
      setVisInputs(config.visInputs);
      setPoints(config.points);
      setLoadStep(3);
    }
  }, [visInputs.umapParams]);

  useEffect(() => {
    if (loadStep === 3 && config) {
      setPoints(config.points);
      setLoadStep(4);
    }
  }, [points]);

  useEffect(() => {
    if (loadStep === 4 && config) {
      setPoints(config.points);
      setLoadStep(5);
    }
  }, [points]);

  useEffect(() => {
    if (loadStep === 5) {
      setIsLoadingConfig(false);
    }
  }, [loadStep]);

  const handleFileChange = async () => {
    setIsLoadingConfig(true);
    const configData = await window.electronAPI.openConfigFile();
    if (!configData) {
      console.error("Erro ao carregar configuração.");
      setIsLoadingConfig(false);
      return;
    }
    setConfig(configData);
    setLoadStep(0);
  };

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <ButtonDeco lable="Load Configuration" onClick={triggerFileInput} />
    </>
  );
}

export default LoadConfig;

const isLoadingConfigContext = createContext();

export function IsLoadingConfigProvider({ children }) {
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  return (
    <isLoadingConfigContext.Provider
      value={{ isLoadingConfig, setIsLoadingConfig }}
    >
      {children}
    </isLoadingConfigContext.Provider>
  );
}

export function useIsLoadingConfig() {
  return useContext(isLoadingConfigContext);
}
