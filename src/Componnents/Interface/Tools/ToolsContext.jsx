import { createContext, useContext, useState } from "react";

const ToolsContext = createContext();

export function ToolsProvider({ children }) {
  const [tools, setTools] = useState({
    cursor: "selector", //selector / grabber / laço
    gizmos: true,
    autoCenter: false,
    framePointsTrigger: false,
  });

  return (
    <ToolsContext.Provider value={{ tools, setTools }}>
      {children}
    </ToolsContext.Provider>
  );
}

export function useTools() {
  return useContext(ToolsContext);
}
