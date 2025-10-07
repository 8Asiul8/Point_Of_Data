function ButtonDeco(props) {
  return (
    <div>
      <button onClick={props.onClick} className="botaoNormal">
        <b>{props.lable}</b>
      </button>
    </div>
  );
}

export default ButtonDeco;
