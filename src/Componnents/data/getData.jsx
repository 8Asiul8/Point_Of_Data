import Papa from "papaparse";
import { useContext } from "react";
import {
  DataContext,
  visInputsContext,
  InteractionPointsContext,
} from "../../App";
import ButtonDeco from "../Interface/Simple_Components/ButtonDeco";

function DataInput() {
  const { setData } = useContext(DataContext);
  const { setVisInputs } = useContext(visInputsContext);
  const { setInteractionPoints } = useContext(InteractionPointsContext);

  const handleLoadDataset = async () => {
    const csvString = await window.electronAPI.openCSVFile();
    if (!csvString) return;

    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        let data = results.data;

        data = data.map((row, index) => {
          const keysMap = Object.keys(row).reduce((acc, key) => {
            acc[key.toLowerCase()] = key;
            return acc;
          }, {});

          if ("key" in keysMap) return row;
          if ("id" in keysMap) {
            const originalIdKey = keysMap["id"];
            const { [originalIdKey]: idValue, ...rest } = row;
            return { key: idValue, ...rest };
          }

          return { key: "dataPoint_" + index.toString(), ...row };
        });

        setInteractionPoints({ selected: [], hovered: [] });
        setVisInputs({ atrWeights: {}, umapParams: {} });
        setData(data);
      },
    });
  };

  return <ButtonDeco lable="Load Dataset" onClick={handleLoadDataset} />;
}

export default DataInput;
