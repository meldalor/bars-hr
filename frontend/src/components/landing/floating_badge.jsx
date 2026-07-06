import "./floating_badge.css";

export default function FloatingBadge({ icon, text, style }) {
    return (
        <div className="floating-badge" style={style}>
            <img src={icon} alt={text} className="floating-badge__icon" />
            <span className="floating-badge__text">{text}</span>
        </div>
    );
}