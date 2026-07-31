function Input(props) {
    return (
        <span dir="rtl" >
            <label className="text-base-content">{props.fieldName}</label>
            <input type="text" placeholder={props.placeholder} className="input bg-cyan-700" />
        </span>
    );
}
export default Input;