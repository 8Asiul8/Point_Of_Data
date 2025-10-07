import { useState } from "react";

function ButtonTypeOnly(props) {
  const [interactionState, setInteractionState] = useState(props.initialState);

  const handleInteraction = () => {
    if (interactionState == props.initialState) {
      setInteractionState(props.secondState);
    } else {
      setInteractionState(props.initialState);
    }
    props.onChangeFunction();
  };

  return (
    <button className="buttonTypeOnly" onClick={handleInteraction}>
      <b>{interactionState}</b>
    </button>
  );
}

export default ButtonTypeOnly;
