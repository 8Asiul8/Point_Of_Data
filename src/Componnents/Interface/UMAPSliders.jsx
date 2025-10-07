import { useContext, useEffect, useState } from "react";
import { DataContext, visInputsContext } from "../../App";
import SliderBasico from "./Simple_Components/SliderBasic";
import { map } from "../../Utils/map";

import { useIsLoadingConfig } from "../Interface/Simple_Components/LoadConfig";

function UMAPSliders() {
  const { visInputs, setVisInputs } = useContext(visInputsContext);
  const { data } = useContext(DataContext);
  const { isLoadingConfig } = useIsLoadingConfig();
  const [maxNeighbors, setMaxNeighbors] = useState(50);

  function sliderToNeighbors(value) {
    return Math.round(map(value, 0, 100, 2, maxNeighbors));
  }

  function sliderToMinDist(value) {
    return Number(map(value, 0, 100, 0.01, 1)).toFixed(2);
  }

  useEffect(() => {
    /* if (isLoadingConfig) return; */

    const newMax = Math.max(2, Math.floor(data.length / 2));
    setMaxNeighbors(newMax);

    setVisInputs((prev) => ({
      ...prev,
      umapParams: {
        nNeighbors: prev.umapParams?.nNeighbors ?? Math.min(15, newMax),
        minDist: prev.umapParams?.minDist ?? 0.1,
      },
    }));
  }, [data]);

  return (
    <>
      <SliderBasico
        numSteps={maxNeighbors - 2}
        key="NeighborsSetter"
        lable="Neighbors"
        conversionFunction={sliderToNeighbors}
        onChange={(newValue) => {
          setVisInputs((prev) => ({
            ...prev,
            umapParams: {
              ...prev.umapParams,
              nNeighbors: newValue,
            },
          }));
        }}
        value={visInputs.umapParams.nNeighbors}
      />

      <SliderBasico
        numSteps={100}
        key="minDistSetter"
        lable="Minimum Distance"
        conversionFunction={sliderToMinDist}
        onChange={(newValue) => {
          setVisInputs((prev) => ({
            ...prev,
            umapParams: {
              ...prev.umapParams,
              minDist: newValue,
            },
          }));
        }}
        value={visInputs.umapParams.minDist}
      />
    </>
  );
}

export default UMAPSliders;
