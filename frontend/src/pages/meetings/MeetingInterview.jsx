import "../vacancies/vacancies.css";
import "./interview.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getMeetingById,
    getInterview,
    saveInterview,
    removeMeeting,
    formatMeetingSlot,
    INTERVIEW_QUESTION_HINT,
    MATRIX_GROUP_TITLES,
} from "../../mocks/interviews.js";
import { setCandidateSubstatus } from "../../mocks/candidates.js";
import { IconDocument, IconCalendar } from "../vacancies/icons.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";

const MATRIX_KEYS = ["hard", "soft", "culture"];

function initials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function StarRating({ value, onChange }) {
    return (
        <div className="iv-stars">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    type="button"
                    key={n}
                    className={`iv-star ${n <= value ? "on" : ""}`}
                    aria-label={`${n} из 5`}
                    onClick={() => onChange(n === value ? 0 : n)}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

function stat(items) {
    const count = items.length;
    const sum = items.reduce((acc, item) => acc + item.rating, 0);
    return { sum, max: count * 5, avg: count ? sum / count : 0 };
}

export default function MeetingInterview() {
    const navigate = useNavigate();
    const { id } = useParams();
    const meeting = getMeetingById(id);

    const [initial] = useState(() => getInterview(meeting));
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState(initial.questions);
    const [matrix, setMatrix] = useState(initial.matrix);
    const [skills, setSkills] = useState(initial.skills);
    const [addingSkill, setAddingSkill] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [finalScore, setFinalScore] = useState(initial.finalScore);
    const [finalComment, setFinalComment] = useState(initial.finalComment);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const back = () => navigate("/app/meetings");

    if (!meeting) {
        return (
            <div className="interview">
                <button type="button" className="vac-back" onClick={back}>
                    ← Вернуться назад
                </button>
                <h1 className="vac-detail-title">Встреча не найдена</h1>
            </div>
        );
    }

    const handleCancelMeeting = () => {
        if (meeting.candidateId) {
            setCandidateSubstatus(meeting.candidateId, "Интервью не назначено");
        }
        removeMeeting(meeting.id);
        navigate("/app/meetings");
    };

    const confirmCancelMeeting = () => {
        setConfirmCancel(false);
        handleCancelMeeting();
    };

    const handleReschedule = () =>
        navigate("/app/meetings", { state: { reschedule: { meetingId: meeting.id } } });

    const setQuestionRating = (index, rating) =>
        setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, rating } : q)));

    const setQuestionComment = (index, comment) =>
        setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, comment } : q)));

    const setSkillRating = (key, index, rating) =>
        setMatrix((prev) => ({
            ...prev,
            [key]: prev[key].map((item, i) => (i === index ? { ...item, rating } : item)),
        }));

    const setSkillComment = (key, index, comment) =>
        setMatrix((prev) => ({
            ...prev,
            [key]: prev[key].map((item, i) => (i === index ? { ...item, comment } : item)),
        }));

    const addSkill = () => {
        const value = newSkill.trim();
        if (!value) {
            return;
        }
        setSkills((prev) => (prev.includes(value) ? prev : [...prev, value]));
        setNewSkill("");
        setAddingSkill(false);
    };

    const goStep = (next) => {
        setStep(next);
        window.scrollTo({ top: 0 });
    };

    const confirm = () => {
        saveInterview(id, { questions, matrix, skills, finalScore, finalComment });
        back();
    };

    const qStats = stat(questions);
    const groupStats = {
        hard: stat(matrix.hard),
        soft: stat(matrix.soft),
        culture: stat(matrix.culture),
    };

    const allItems = [...questions, ...matrix.hard, ...matrix.soft, ...matrix.culture];
    const rated = allItems.filter((item) => item.rating > 0);
    const overall = rated.length
        ? rated.reduce((acc, item) => acc + item.rating, 0) / rated.length
        : 0;

    const results = [
        { title: "Вопросы", stats: qStats },
        { title: "Hard Skills", stats: groupStats.hard },
        { title: "Soft Skills", stats: groupStats.soft },
        { title: "Culture Fit", stats: groupStats.culture },
    ];

    return (
        <div className="interview">
            <button type="button" className="vac-back" onClick={back}>
                ← Вернуться назад
            </button>

            <div className="iv-subtitle">Оценка кандидата по интервью</div>
            <h1 className="vac-detail-title">{meeting.vacancy}</h1>

            <div className="vac-tags">
                {meeting.tags.map((tag) => (
                    <span
                        key={tag.label}
                        className="vac-tag"
                        style={{ backgroundColor: tag.color }}
                    >
                        {tag.label}
                    </span>
                ))}
            </div>

            <div className="iv-candidate">
                <div className="iv-cand-head">
                    <div className="iv-cand-avatar">{initials(meeting.fullName)}</div>
                    <div>
                        <div className="iv-cand-name">{meeting.fullName}</div>
                        <div className="iv-cand-role">{meeting.role}</div>
                    </div>
                </div>

                <div className="iv-cand-label">Навыки</div>
                <div className="iv-chips">
                    {skills.map((skill) => (
                        <span key={skill} className="iv-chip">
                            {skill}
                        </span>
                    ))}

                    {addingSkill ? (
                        <span className="iv-chip-form">
                            <input
                                className="iv-chip-input"
                                placeholder="Навык"
                                value={newSkill}
                                autoFocus
                                onChange={(event) => setNewSkill(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addSkill();
                                    }
                                }}
                            />
                            <button type="button" className="iv-chip-ok" onClick={addSkill}>
                                OK
                            </button>
                        </span>
                    ) : (
                        <button
                            type="button"
                            className="iv-chip-add"
                            onClick={() => setAddingSkill(true)}
                        >
                            + Добавить
                        </button>
                    )}
                </div>

                <div className="iv-cand-label iv-cand-info-label">
                    <IconDocument size={16} />
                    Дополнительная информация:
                </div>
                <div className="iv-cand-info">{meeting.additionalInfo}</div>

                <div className="iv-cand-actions">
                    <span className="iv-slot-badge">
                        <IconCalendar size={16} />
                        {formatMeetingSlot(meeting)}
                    </span>
                    <button
                        type="button"
                        className="iv-btn danger"
                        onClick={() => setConfirmCancel(true)}
                    >
                        Отменить встречу
                    </button>
                    <button type="button" className="iv-btn primary">
                        Ссылка на встречу
                    </button>
                    <button
                        type="button"
                        className="iv-btn primary"
                        onClick={handleReschedule}
                    >
                        Изменить время
                    </button>
                </div>
            </div>

            {step === 1 && (
                <>
                    <div className="iv-card">
                        <h3 className="iv-step-title">Этап 1: Вопросы</h3>

                        {questions.map((question, index) => (
                            <div className="iv-question" key={index}>
                                <div className="iv-q-head">
                                    <span className="iv-q-num">{index + 1}</span>
                                    <div>
                                        <div className="iv-q-text">{question.text}</div>
                                        <div className="iv-q-hint">
                                            {question.hint || INTERVIEW_QUESTION_HINT}
                                        </div>
                                    </div>
                                </div>

                                <div className="iv-field-label">Оценка</div>
                                <StarRating
                                    value={question.rating}
                                    onChange={(rating) => setQuestionRating(index, rating)}
                                />

                                <div className="iv-field-label">Комментарий</div>
                                <div className="iv-textarea-wrap">
                                    <textarea
                                        className="iv-textarea"
                                        maxLength={2000}
                                        placeholder="Комментарий к ответу..."
                                        value={question.comment}
                                        onChange={(event) =>
                                            setQuestionComment(index, event.target.value)
                                        }
                                    />
                                    <span className="iv-counter">
                                        {question.comment.length}/2000
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="iv-footer iv-footer-end">
                        <button type="button" className="iv-btn danger" onClick={back}>
                            Отменить
                        </button>
                        <button type="button" className="iv-btn primary" onClick={() => goStep(2)}>
                            Далее →
                        </button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className="iv-card">
                        <h3 className="iv-step-title">Этап 2: Матрица компетенций</h3>

                        {MATRIX_KEYS.map((key) => (
                            <div className="iv-mgroup" key={key}>
                                <h4 className="iv-mgroup-title">{MATRIX_GROUP_TITLES[key]}</h4>
                                <table className="iv-table">
                                    <thead>
                                        <tr>
                                            <th>Компетенция</th>
                                            <th className="iv-th-score">Оценка</th>
                                            <th>Комментарий</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matrix[key].map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="iv-comp-name">{item.name}</div>
                                                    <div className="iv-comp-desc">
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td>
                                                    <StarRating
                                                        value={item.rating}
                                                        onChange={(rating) =>
                                                            setSkillRating(key, index, rating)
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="iv-comp-comment"
                                                        placeholder="Написать..."
                                                        value={item.comment}
                                                        onChange={(event) =>
                                                            setSkillComment(
                                                                key,
                                                                index,
                                                                event.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    <div className="iv-footer">
                        <button type="button" className="iv-btn ghost" onClick={() => goStep(1)}>
                            ← Назад
                        </button>
                        <div className="iv-footer-right">
                            <button type="button" className="iv-btn danger" onClick={back}>
                                Отменить
                            </button>
                            <button
                                type="button"
                                className="iv-btn primary"
                                onClick={() => goStep(3)}
                            >
                                Далее →
                            </button>
                        </div>
                    </div>
                </>
            )}

            {step === 3 && (
                <>
                    <div className="iv-card">
                        <h3 className="iv-step-title">Этап 3: Итоговое решение</h3>

                        <div className="iv-results-label">Результаты по категориям</div>
                        <div className="iv-results">
                            {results.map((result) => (
                                <div className="iv-stat" key={result.title}>
                                    <div className="iv-stat-title">{result.title}</div>
                                    <div className="iv-stat-line">
                                        Суммарный балл: {result.stats.sum}/{result.stats.max}
                                    </div>
                                    <div className="iv-stat-line">
                                        Средний балл: {result.stats.avg.toFixed(1)}/5
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="iv-field-label">Итоговая оценка</div>
                        <input
                            className="iv-input"
                            placeholder="Например: 4.4/5"
                            value={finalScore}
                            onChange={(event) => setFinalScore(event.target.value)}
                        />

                        <div className="iv-field-label">Итоговый комментарий</div>
                        <div className="iv-textarea-wrap">
                            <textarea
                                className="iv-textarea"
                                maxLength={2000}
                                placeholder="Общее впечатление о кандидате..."
                                value={finalComment}
                                onChange={(event) => setFinalComment(event.target.value)}
                            />
                            <span className="iv-counter">{finalComment.length}/2000</span>
                        </div>
                    </div>

                    <div className="iv-footer">
                        <button type="button" className="iv-btn ghost" onClick={() => goStep(2)}>
                            ← Назад
                        </button>
                        <span className="iv-badge">{overall.toFixed(1)}/5</span>
                        <div className="iv-footer-right">
                            <button type="button" className="iv-btn danger" onClick={back}>
                                Отменить
                            </button>
                            <button type="button" className="iv-btn primary" onClick={confirm}>
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </>
            )}

            <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)}>
                <p className="iv-modal-title">
                    Отменить встречу с {meeting.fullName}?
                </p>
                <div className="iv-modal-actions">
                    <button
                        type="button"
                        className="iv-btn ghost"
                        onClick={() => setConfirmCancel(false)}
                    >
                        Нет
                    </button>
                    <button
                        type="button"
                        className="iv-btn danger"
                        onClick={confirmCancelMeeting}
                    >
                        Отменить встречу
                    </button>
                </div>
            </Modal>
        </div>
    );
}
