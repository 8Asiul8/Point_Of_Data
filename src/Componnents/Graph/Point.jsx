import { useContext, useEffect, useState } from "react";
import { InteractionPointsContext } from "../../App";
import { ClusterContext } from "../../App";
import { forEach } from "mathjs";
import { arrayComp } from "../../Utils/arrayCompar";

import ButtonDeco from "../Interface/Simple_Components/ButtonDeco";
import OptionSelector from "../Interface/Simple_Components/OptionSelector";

import { usePopover } from "../Interface/Simple_Components/Upper_Layer/PopoverContext";

import { useTools } from "../Interface/Tools/ToolsContext";

function Point({
  id,
  screenCoordinates,
  radius = 2.5,
  onMouseEnter,
  onMouseLeave,
  dragguingMode = false,
}) {
  const { interactionPoints, setInteractionPoints } = useContext(
    InteractionPointsContext
  );
  const { clusters } = useContext(ClusterContext);

  const isSelected = interactionPoints.selected.includes(id);
  const isHovered = interactionPoints.hovered.includes(id);

  const [cluster, setCluster] = useState("none");
  const [color, setColor] = useState("var(--elements-color)");
  const [clusterFriends, setClusterFriends] = useState([]);

  const { showPopover, hidePopover } = usePopover();

  const { tools } = useTools();

  const handleClick = (e) => {
    if (tools.cursor === "grabber") return;
    e.stopPropagation();
    const alreadySelected = interactionPoints.selected.includes(id);

    if (!e.ctrlKey) {
      if (
        arrayComp(interactionPoints.selected, clusterFriends) ||
        clusterFriends.length == 0
      ) {
        setInteractionPoints({
          ...interactionPoints,
          selected: [id],
        });
      } else {
        setInteractionPoints({
          ...interactionPoints,
          selected: clusterFriends,
        });
      }
    } else {
      let newSelection;
      if (alreadySelected) {
        newSelection = interactionPoints.selected.filter((pid) => pid !== id);
      } else {
        newSelection = [...interactionPoints.selected, id];
      }
      setInteractionPoints({
        ...interactionPoints,
        selected: newSelection,
      });
    }
  };

  const handleMouseEnter = () => {
    if (tools.cursor === "grabber") return;
    setInteractionPoints({
      ...interactionPoints,
      hovered: [id],
    });
    onMouseEnter?.(id);
  };

  const handleMouseLeave = () => {
    if (tools.cursor === "grabber") return;
    setInteractionPoints({
      ...interactionPoints,
      hovered: [],
    });
    onMouseLeave?.(id);
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Impede menu nativo
    showPopover(<PointPopoverContent pointId={id} />, e.nativeEvent, 250); // largura opcional
  };

  useEffect(() => {
    const foundCluster = clusters.find((cluster) =>
      cluster.points.includes(id)
    );

    if (foundCluster) {
      setCluster(foundCluster.id);
      setClusterFriends(foundCluster.points);
      setColor(foundCluster.color);
    } else {
      setCluster("none");
      setClusterFriends([]);
      setColor("var(--elements-color)");
    }
  }, [clusters, id]);

  return (
    <>
      <circle
        r={radius * (isHovered || isSelected ? 2.5 : 1)}
        fill={color}
        fillOpacity={0.2}
        stroke={isSelected ? color : "none"}
        strokeWidth={isSelected ? 1 : 0}
        strokeOpacity={1}
        cx={0}
        cy={0}
        pointerEvents="none"
        style={{
          transition: `${
            dragguingMode ? "none" : "transform 0.5s ease , r 0.2s ease"
          }`,
          transform: `translate(${screenCoordinates[0]}px, ${screenCoordinates[1]}px)`,
        }}
      />
      <circle
        r={radius}
        fill={color}
        cx={0}
        cy={0}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: "pointer",
          transition: `${dragguingMode ? "none" : "transform 0.5s ease"}`,
          transform: `translate(${screenCoordinates[0]}px, ${screenCoordinates[1]}px)`,
        }}
        onContextMenu={handleContextMenu}
      />
    </>
  );
}

export default Point;

function PointPopoverContent({ pointId }) {
  const { clusters, setClusters } = useContext(ClusterContext);

  return (
    <>
      <OptionSelector
        placeHolder="Add to Cluster"
        options={clusters.map((cluster) => cluster.name)}
        optionColors={clusters.map((cluster) => cluster.color)}
        stateChangeFunction={(selClusterName) => {
          let cleanedClusters = clusters.map((cluster) => ({
            ...cluster,
            points: cluster.points.filter((id) => id !== pointId),
          }));

          const clusterIndex = cleanedClusters.findIndex(
            (cluster) => cluster.name === selClusterName
          );

          if (clusterIndex !== -1) {
            const updatedCluster = {
              ...cleanedClusters[clusterIndex],
              points: [...cleanedClusters[clusterIndex].points, pointId],
            };
            cleanedClusters[clusterIndex] = updatedCluster;
          }

          cleanedClusters = cleanedClusters.filter(
            (cluster) => cluster.points.length > 0
          );
          setClusters(cleanedClusters);
        }}
      />
      <ButtonDeco
        lable="Remove from Cluster"
        onClick={() => {
          const updatedClusters = clusters.map((cluster) => ({
            ...cluster,
            points: cluster.points.filter((id) => id !== pointId),
          }));
          const cleanedClusters = updatedClusters.filter(
            (cluster) => cluster.points.length > 0
          );
          setClusters(cleanedClusters);
        }}
      />
    </>
  );
}
