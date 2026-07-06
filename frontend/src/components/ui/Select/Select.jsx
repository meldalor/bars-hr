

import "./Select.css";

function Select({
    value,
    onChange,
    disabled = false,
    className = "",
    children,
}) {
    return (
        <select
            className={`select ${className}`}
            value={value}
            onChange={onChange}
            disabled={disabled}
        >
            {children}
        </select>
    );
}

export default Select;