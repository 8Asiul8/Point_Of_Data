import { gapSize } from "three/tsl";
import ButtonTypeOnly from "../Simple_Components/ButtonTypeOnly";
import { useTools } from "./ToolsContext";
import { ToolButtonAction, ToolButtonModeControl } from "./toolButtons";
import { useState, useEffect } from "react";

function ToolBox() {
  const style = {
    width: "100vh",
    display: "flex",
    borderBottom: "5px solid var(--elements-color)",
    height: "50px",
    background: "var(--background-color)",
    zIndex: "100",
    position: "absolute",
    bottom: "0px",
    right: "50px",
    transform: "rotate(90deg)",
    transformOrigin: "right bottom",
    boxSizing: "border-box",
    alignItems: "center",
    gap: "10px",
  };
  const { tools, setTools } = useTools();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const rootElement = document.getElementById("root");
    rootElement?.classList.toggle("dark", darkMode);
  }, [darkMode]);

  function updateCursor(newCursor) {
    setTools((prev) => ({ ...prev, cursor: newCursor }));
  }

  return (
    <div style={style}>
      <div
        style={{
          display: "flex",
          width: "200px",
          height: "50px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ButtonTypeOnly
          initialState="Hide Gizmo"
          secondState="Show Gizmo"
          onChangeFunction={() =>
            setTools((prev) => ({
              ...prev,
              gizmos: !prev.gizmos,
            }))
          }
        />
      </div>

      <ToolButtonModeControl
        value={tools.cursor}
        onChange={updateCursor}
        selectedWhen="grabber"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 -960 960 960"
        >
          <path d="M402-40q-30 0-56-13.5T303-92L48-465l24-23q19-19 45-22t47 12l116 81v-383q0-17 11.5-28.5T320-840t28.5 11.5T360-800v537L212-367l157 229q5 8 14 13t19 5h278q33 0 56.5-23.5T760-200v-560q0-17 11.5-28.5T800-800t28.5 11.5T840-760v560q0 66-47 113T680-40zm38-440v-400q0-17 11.5-28.5T480-920t28.5 11.5T520-880v400zm160 0v-360q0-17 11.5-28.5T640-880t28.5 11.5T680-840v360zM486-300"></path>
        </svg>
      </ToolButtonModeControl>

      <ToolButtonModeControl
        value={tools.cursor}
        onChange={updateCursor}
        selectedWhen="selector"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 -960 960 960"
        >
          <path d="m320-410 79-110h170L320-716zM551-80 406-392 240-160v-720l560 440H516l144 309zM399-520"></path>
        </svg>
      </ToolButtonModeControl>
      <ToolButtonAction
        onClickAction={() => {
          setTools((prev) => ({
            ...prev,
            framePointsTrigger: true,
          }));
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 -960 960 960"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120zM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160zM480-280q-83 0-141.5-58.5T280-480t58.5-141.5T480-680t141.5 58.5T680-480t-58.5 141.5T480-280m0-80q50 0 85-35t35-85-35-85-85-35-85 35-35 85 35 85 85 35m0-120"></path>
        </svg>
      </ToolButtonAction>

      <ToolButtonAction
        onClickAction={() => {
          setDarkMode((prev) => !prev);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="#e3e3e3"
          viewBox="0 -960 960 960"
        >
          <path d="M480-80q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m40-83q119-15 199.5-104.5T800-480t-80.5-212.5T520-797z"></path>
        </svg>
      </ToolButtonAction>
    </div>
  );
}

export default ToolBox;
