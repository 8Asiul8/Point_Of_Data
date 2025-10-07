import { createContext, useEffect, useState } from "react";
import "./App.css";
import { useRef } from "react";
import RightBar from "./Componnents/Interface/RightBar";
import LeftBar from "./Componnents/Interface/LeftBar";
import Graph from "./Componnents/Graph/Graph";
import Guizmo3D from "./Componnents/Interface/Tools/Guizmos";
import ToolBox from "./Componnents/Interface/Tools/toolBox";

import { TooltipProvider } from "./Componnents/Interface/Simple_Components/Upper_Layer/TooltipContext";
import { PopoverProvider } from "./Componnents/Interface/Simple_Components/Upper_Layer/PopoverContext";
import { ToolsProvider } from "./Componnents/Interface/Tools/ToolsContext";
import { IsLoadingConfigProvider } from "./Componnents/Interface/Simple_Components/LoadConfig";

export const DataContext = createContext();
export const visInputsContext = createContext();
export const RotationAngleContext = createContext();
export const InteractionPointsContext = createContext();
export const ToolsContext = createContext();
export const ClusterContext = createContext();
export const PointsContext = createContext();

function App() {
  const [rightDisplay, setRightDisplay] = useState("block");
  const [numColRight, setNumColRight] = useState(3);

  const [data, setData] = useState([]);
  const [visInputs, setVisInputs] = useState({
    atrWeights: {},
    umapParams: {},
  });
  const [rotationAngle, setRotationAngle] = useState({
    XAngle: 0,
    YAngle: 0,
    ZAngle: 0,
    translateX: 0,
    translateY: 0,
    zoom: 1,
  });
  const [interactionPoints, setInteractionPoints] = useState({
    selected: [],
    hovered: [],
  });

  const [clusters, setClusters] = useState([]);
  const [points, setPoints] = useState([]);

  const chartAreaRef = useRef(null);

  return (
    <>
      <DataContext.Provider value={{ data, setData }}>
        <visInputsContext.Provider value={{ visInputs, setVisInputs }}>
          <RotationAngleContext.Provider
            value={{ rotationAngle, setRotationAngle }}
          >
            <InteractionPointsContext.Provider
              value={{ interactionPoints, setInteractionPoints }}
            >
              <ToolsProvider>
                <ClusterContext.Provider value={{ clusters, setClusters }}>
                  <PointsContext.Provider value={{ points, setPoints }}>
                    <IsLoadingConfigProvider>
                      <TooltipProvider>
                        <PopoverProvider>
                          <LeftBar />
                          <div
                            id="right-space"
                            style={{
                              gridTemplateColumns: `repeat(4, 1fr)`,
                            }}
                          >
                            <div
                              id="chart_area"
                              ref={chartAreaRef}
                              style={{
                                position: "relative",
                              }}
                            >
                              <Graph wrapperRef={chartAreaRef} />
                              <ToolBox />
                              <Guizmo3D />
                            </div>
                            <RightBar display="block" />
                          </div>
                        </PopoverProvider>
                      </TooltipProvider>
                    </IsLoadingConfigProvider>
                  </PointsContext.Provider>
                </ClusterContext.Provider>
              </ToolsProvider>
            </InteractionPointsContext.Provider>
          </RotationAngleContext.Provider>
        </visInputsContext.Provider>
      </DataContext.Provider>
    </>
  );
}

export default App;
