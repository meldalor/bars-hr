import "./Button.css";

function Button({
    children,
    onClick,
    type = "button",
    disabled = false,
    className = "",
}) {
    return (
        <button
            className={`button ${className}`}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;