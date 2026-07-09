import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import Select from "../../components/ui/Select/Select.jsx";
import {
    updateMeetingTime,
    toMinutes,
    DAY_START,
    DAY_END,
} from "../../mocks/interviews.js";

const DURATION_OPTIONS = [
    { value: 15, label: "15 мин" },
    { value: 30, label: "30 мин" },
    { value: 45, label: "45 мин" },
    { value: 60, label: "1 час" },
    { value: 90, label: "1,5 часа" },
    { value: 120, label: "2 часа" },
];

const START_STEP = 15;

const START_OPTIONS = (() => {
    const options = [];
    for (let min = DAY_START; min < DAY_END; min += START_STEP) {
        const hours = String(Math.floor(min / 60)).padStart(2, "0");
        const rest = String(min % 60).padStart(2, "0");
        options.push(`${hours}:${rest}`);
    }
    return options;
})();

function MeetingTimeForm({ meeting, onClose, onSaved }) {
    const [date, setDate] = useState(meeting.date);
    const [startTime, setStartTime] = useState(meeting.startTime);
    const [duration, setDuration] = useState(
        toMinutes(meeting.endTime) - toMinutes(meeting.startTime)
    );
    const [error, setError] = useState("");
    const [position, setPosition] = useState(null);
    const [dragging, setDragging] = useState(false);
    const dialogRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        if (!dragging) {
            return;
        }
        const handleMove = (event) => {
            setPosition({
                x: event.clientX - dragOffset.current.x,
                y: event.clientY - dragOffset.current.y,
            });
        };
        const handleUp = () => setDragging(false);
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };
    }, [dragging]);

    const startDrag = (event) => {
        const rect = dialogRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        setPosition({ x: rect.left, y: rect.top });
        setDragging(true);
    };

    const handleSave = () => {
        if (!date) {
            setError("Укажите день встречи");
            return;
        }
        if (toMinutes(startTime) + duration > DAY_END) {
            setError("Встреча не помещается в рабочий день");
            return;
        }

        const result = updateMeetingTime(meeting.id, {
            date,
            startTime,
            durationMinutes: duration,
        });

        if (!result.ok) {
            setError("Это время пересекается с другой встречей");
            return;
        }

        onSaved(result.meeting);
        onClose();
    };

    const style = position
        ? { top: `${position.y}px`, left: `${position.x}px`, transform: "none" }
        : undefined;

    return createPortal(
        <div className="mtm-modal" role="dialog" ref={dialogRef} style={style}>
            <div className="mtm-drag" onPointerDown={startDrag}>
                <span className="mtm-drag-title">Изменить время встречи</span>
                <span className="mtm-drag-hint">
                    Перетащите окно, чтобы видеть занятые слоты
                </span>
            </div>

            <div className="mtm-body">
                <div className="mtm-field">
                    <span className="mtm-label">Изменить день</span>
                    <input
                        type="date"
                        className="mtm-input"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                    />
                </div>

                <div className="mtm-field">
                    <span className="mtm-label">Изменить время начала</span>
                    <Select
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                    >
                        {START_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="mtm-field">
                    <span className="mtm-label">Изменить продолжительность</span>
                    <Select
                        value={String(duration)}
                        onChange={(event) => setDuration(Number(event.target.value))}
                    >
                        {DURATION_OPTIONS.map((option) => (
                            <option key={option.value} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>

                {error && <div className="mtm-error">{error}</div>}

                <div className="mtm-actions">
                    <button type="button" className="iv-btn ghost" onClick={onClose}>
                        Отмена
                    </button>
                    <button type="button" className="iv-btn primary" onClick={handleSave}>
                        Сохранить
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function MeetingTimeModal({ open, meeting, onClose, onSaved }) {
    if (!open || !meeting) {
        return null;
    }
    return (
        <MeetingTimeForm meeting={meeting} onClose={onClose} onSaved={onSaved} />
    );
}
