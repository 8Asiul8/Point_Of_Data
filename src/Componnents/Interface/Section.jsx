import { useState } from "react";
import ButtonTypeOnly from "./Simple_Components/ButtonTypeOnly";
import { useTooltip } from "./Simple_Components/Upper_Layer/TooltipContext";

function Section(props) {
  const { tooltipContent = undefined } = props;

  const [displayMode, setDisplayMode] = useState("block");

  const { showTooltip, hideTooltip } = useTooltip();

  const thisStyle = {
    marginTop: "30px",
    paddingRight: "25px",
    paddingLeft: "25px",
    paddingBottom: "20px",
    borderBottom: "5px solid var(--elements-color)",
  };

  const thisHStyle = {
    fontSize: "var(--section-title-size)",
    textTransform: "uppercase",
    display: "inlineBlock",
  };

  const handleDisplayChange = () => {
    if (displayMode == "block") {
      setDisplayMode("none");
    } else {
      setDisplayMode("block");
    }
  };

  return (
    <div style={thisStyle}>
      <div style={{ display: "flex", gap: "10px" }}>
        <h1 style={thisHStyle}>
          <span
          /* onMouseEnter={(e) =>
              tooltipContent
                ? showTooltip(tooltipContent, e.currentTarget, 300, 500)
                : {}
            }
            onMouseLeave={hideTooltip} */
          >
            {props.title}
          </span>
        </h1>
        {tooltipContent ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="var(--elements-color)"
            viewBox="0 -960 960 960"
            onMouseEnter={(e) =>
              tooltipContent
                ? showTooltip(tooltipContent, e.nativeEvent, 300, 0)
                : {}
            }
            onMouseLeave={hideTooltip}
          >
            <path d="M440-280h80v-240h-80zm40-320q17 0 28.5-11.5T520-640t-11.5-28.5T480-680t-28.5 11.5T440-640t11.5 28.5T480-600m0 520q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320"></path>
          </svg>
        ) : null}
      </div>
      <ButtonTypeOnly
        initialState="hide"
        secondState="show"
        onChangeFunction={handleDisplayChange}
      ></ButtonTypeOnly>
      <div style={{ display: displayMode }}>{props.children}</div>
    </div>
  );
}

export default Section;
