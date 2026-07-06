

import "./Input.css";

function Input({
    type = "text",
    placeholder = "",
    value,
    onChange,
    disabled = false,
    className = "",
}) {
    return (
        <input
            className={`input ${className}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
    );
}

export default Input;