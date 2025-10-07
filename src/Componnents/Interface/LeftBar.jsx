import Section from "./Section";
import ButtonDeco from "./Simple_Components/ButtonDeco";
import DataInput from "../data/getData";
import SlidersFromData from "./AtrSlidersFromData";
import UMAPSliders from "./UMAPSliders";
import OptionSelector from "./Simple_Components/OptionSelector";
import SaveConfig from "./Simple_Components/SaveConfig";
import { useState } from "react";
import LoadConfig from "./Simple_Components/LoadConfig";

function LeftBar() {
  const thisStyle = {
    borderRight: "5px solid var(--elements-color)",
    height: "100vh",
    gridColumn: "span 1",
    width: "100%",
    paddingTop: "20px",
    paddingBottom: "0px",
    overflowY: "auto",
    boxSizing: "border-box",
    zIndex: "100",
  };

  const [preSetCreation, setPreSetCreation] = useState(false);

  return (
    <div id="lefttBar" style={thisStyle}>
      <div style={{ marginLeft: "25px", marginRight: "25px" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          fillRule="evenodd"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="1.5"
          clipRule="evenodd"
          viewBox="0 0 307 48"
          width="100%"
          marginLeft="25px"
        >
          <circle
            cx="826.772"
            cy="401.575"
            r="118.11"
            fill="var(--elements-color)"
            fillOpacity="0.2"
            stroke="var(--elements-color)"
            strokeWidth="22.66"
            transform="translate(-3.16 -50.036)scale(.18387)"
          ></circle>
          <circle
            cx="826.772"
            cy="401.575"
            r="118.11"
            fill="var(--elements-color)"
            transform="matrix(.07355 0 0 .07355 88.054 -5.733)"
          ></circle>
          <text
            x="6377.95"
            y="2801.28"
            fill="var(--elements-color)"
            fontFamily="'Roboto-Regular', 'Roboto'"
            fontSize="50"
            transform="translate(-6382.083 -2758.727)"
          >
            P
            <tspan x="6409.18" y="2801.28">
              o
            </tspan>
            int
          </text>
          <text
            x="6614.17"
            y="2824.9"
            fill="var(--elements-color)"
            fontFamily="'Roboto-Regular', 'Roboto'"
            fontSize="50"
            transform="translate(-6438.083 -2782.35)"
          >
            f
          </text>
          <text
            x="6803.15"
            y="2848.52"
            fill="var(--elements-color)"
            fontFamily="'Roboto-Regular', 'Roboto'"
            fontSize="50"
            transform="translate(-6597.083 -2805.972)"
          >
            Data
          </text>
        </svg>
      </div>

      {preSetCreation ? (
        <SaveConfig resetState={() => setPreSetCreation(false)} />
      ) : (
        <Section
          title="Dataset and Settings"
          tooltipContent={
            <ul
              style={{
                display: " block",
                listStyleType: "disc",
                marginBlockStart: "1em",
                marginBlockEnd: "1em",
                paddingInlineStart: "20px",
              }}
            >
              <li>
                At the bottom there are three buttons: load a dataset, save a
                configuration, and load a configuration.
              </li>
              <li>
                A configuration stores the current state of the projection:
                point positions, rotation angle, attribute weights, UMAP
                parameter values, and clusters.
              </li>
            </ul>
          }
        >
          <DataInput />
          <ButtonDeco
            lable="Save Configuration"
            onClick={() => {
              setPreSetCreation(true);
            }}
          />
          <LoadConfig />
        </Section>
      )}
      <Section
        title="Attribute Weight"
        tooltipContent={
          <ul
            style={{
              display: " block",
              listStyleType: "disc",
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              paddingInlineStart: "20px",
            }}
          >
            <li>
              At the bottom there are sliders to set attribute weights. Higher
              values increase the impact of an attribute on the projection.
            </li>
            <li>
              Two modes are available: <b>absolute</b> and <b>relative</b>. In
              absolute mode, values represent how much larger or smaller the
              weight is compared to the default (1). In relative mode, all
              weights are normalized so their sum is always 1.
            </li>
            <li>
              The <b>Estimate Weights</b> button recalculates weights
              automatically based on the current 2D distances.
            </li>
          </ul>
        }
      >
        <SlidersFromData />
      </Section>
      <Section
        title="UMAP Parameters"
        tooltipContent={
          <ul
            style={{
              display: " block",
              listStyleType: "disc",
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              paddingInlineStart: "20px",
            }}
          >
            <li>
              You can adjust two UMAP parameters: <b>neighbors</b> and{" "}
              <b>minimum distance</b>.
            </li>
            <li>
              <b>Neighbors</b> controls how many nearby points influence the
              projection. Lower values highlight local patterns, while higher
              values preserve more global structure.
            </li>
            <li>
              <b>Minimum distance</b> sets how tightly points can be packed
              together. Smaller values create denser clusters, while larger
              values spread points more evenly.
            </li>
          </ul>
        }
      >
        <UMAPSliders />
      </Section>
    </div>
  );
}

export default LeftBar;
