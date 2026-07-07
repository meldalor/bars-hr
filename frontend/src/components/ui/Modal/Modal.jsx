import "./Modal.css";
import { useEffect } from "react";

export default function Modal({ open, onClose, children }) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-dialog"
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
