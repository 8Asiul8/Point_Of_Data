import { useContext, useEffect, useState } from "react";
import { visInputsContext, DataContext } from "../../App";
import SliderHistogram from "./Simple_Components/SliderHistograms";
import { map } from "../../Utils/map";
import OptionSelector from "./Simple_Components/OptionSelector";
import { useIsLoadingConfig } from "../Interface/Simple_Components/LoadConfig";
import ButtonDeco from "./Simple_Components/ButtonDeco";

function SlidersFromData() {
  const { isLoadingConfig } = useIsLoadingConfig();
  const { data } = useContext(DataContext);
  const { visInputs, setVisInputs } = useContext(visInputsContext);
  const [attributes, setAttributes] = useState([]);

  const [sliderMode, setSliderMode] = useState("absolute");

  // Função de mapeamento de slider → peso
  function mapSliderToWeight(value) {
    if (value === 0) return 0;
    if (value > 0 && value <= 49)
      return Number(map(value, 0, 50, 0, 1)).toFixed(2);
    if (value == 50) return 1;
    if (value > 50) return Math.floor(map(value, 50, 100, 1, 100));
    return 1;
  }

  // Extrai atributos numéricos (sem o "key")
  useEffect(() => {
    if (data.length === 0) return;

    /* if (isLoadingConfig) return; */

    const first = data[0];
    const keys = Object.keys(first).filter((k) => k.toLowerCase() !== "key");

    // Filtra apenas atributos com valores numéricos em todas as linhas
    const numericKeys = keys.filter((key) =>
      data.every((row) => !isNaN(parseFloat(row[key])))
    );

    setAttributes(numericKeys);

    const initialWeights = {};
    numericKeys.forEach((key) => {
      initialWeights[key] = 1;
    });

    setVisInputs((prev) => ({
      ...prev,
      atrWeights: initialWeights,
    }));
  }, [data]);

  const updateWeight = (key, newValue) => {
    if (sliderMode == "absolute") {
      setVisInputs((prev) => ({
        ...prev,
        atrWeights: {
          ...prev.atrWeights,
          [key]: newValue,
        },
      }));
    } else {
    }
  };

  return (
    <>
      <ButtonDeco
        lable="Estimate Weights"
        onClick={() => {
          console.log("not implemented yet...");
        }}
      />
      <OptionSelector
        options={["absolute", "relative"]}
        stateChangeFunction={(newValue) => {
          setSliderMode(newValue);
        }}
      />

      {attributes.map((attr) => {
        const values = data
          .map((d) => parseFloat(d[attr]))
          .filter((v) => !isNaN(v));
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        return (
          <SliderHistogram
            key={attr}
            lable={attr}
            value={visInputs.atrWeights[attr]}
            data={values}
            minVal={minVal}
            maxVal={maxVal}
            onChange={(weight) => updateWeight(attr, weight)}
            mapSliderToWeight={mapSliderToWeight}
          />
        );
      })}
    </>
  );
}

export default SlidersFromData;
