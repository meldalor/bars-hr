import "./vacancies.css";
import "./vacancy_assessment.css";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getVacancyById, updateVacancy, LANGUAGES, TAG_COLORS } from "../../mocks/vacancies.js";
import { getAssessment, QUESTION_HINT } from "../../mocks/assessment.js";

const GROUP_ORDER = ["hard", "soft", "culture"];

const GROUP_TITLES = {
    hard: "A. Hard Skills (технические навыки)",
    soft: "B. Soft Skills (личностные качества)",
    culture: "C. Culture Fit (соответствие команде)",
};

function CompetencyGroup({ title, items, onDelete, onAdd }) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const confirm = () => {
        if (!name.trim()) {
            return;
        }
        onAdd(name.trim(), description.trim());
        setName("");
        setDescription("");
        setAdding(false);
    };

    const cancel = () => {
        setName("");
        setDescription("");
        setAdding(false);
    };

    return (
        <div className="va-group">
            <h4 className="va-group-title">{title}</h4>

            {items.map((item, index) => (
                <div className="va-skill" key={index}>
                    <div className="va-skill-body">
                        <div className="va-skill-name">{item.name}</div>
                        {item.description && (
                            <div className="va-skill-desc">{item.description}</div>
                        )}
                    </div>
                    <button
                        type="button"
                        className="va-del"
                        aria-label="Удалить компетенцию"
                        onClick={() => onDelete(index)}
                    >
                        ×
                    </button>
                </div>
            ))}

            {adding ? (
                <div className="va-add-form">
                    <input
                        className="va-add-input"
                        placeholder="Название"
                        value={name}
                        autoFocus
                        onChange={(event) => setName(event.target.value)}
                    />
                    <input
                        className="va-add-input"
                        placeholder="Описание"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                    <button type="button" className="va-add-confirm" onClick={confirm}>
                        Добавить
                    </button>
                    <button type="button" className="va-add-cancel" onClick={cancel}>
                        Отмена
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className="va-add-btn"
                    onClick={() => setAdding(true)}
                >
                    Добавить
                </button>
            )}
        </div>
    );
}

export default function VacancyAssessment() {
    const navigate = useNavigate();
    const { id } = useParams();

    const vacancy = getVacancyById(id);
    const lang = vacancy ? LANGUAGES[vacancy.lang] : null;

    const [initial] = useState(() => getAssessment(vacancy));
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState(initial.questions);
    const [matrix, setMatrix] = useState(initial.matrix);
    const [errors, setErrors] = useState([]);
    const [stepError, setStepError] = useState("");

    const backToVacancy = () => navigate(`/app/vacancies/${id}`);

    const updateQuestion = (index, field, value) => {
        setQuestions((prev) =>
            prev.map((question, i) =>
                i === index ? { ...question, [field]: value } : question
            )
        );
    };

    const deleteQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const addQuestion = () => {
        setQuestions((prev) => [...prev, { text: "", hint: "" }]);
    };

    const deleteSkill = (key, index) => {
        setMatrix((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index),
        }));
    };

    const addSkill = (key, name, description) => {
        setMatrix((prev) => ({
            ...prev,
            [key]: [...prev[key], { name, description }],
        }));
    };

    const goNext = () => {
        if (questions.length === 0) {
            setStepError("Добавьте хотя бы один вопрос");
            setErrors([]);
            return;
        }

        const invalid = [];
        questions.forEach((question, index) => {
            if (!question.text.trim()) {
                invalid.push(index);
            }
        });

        if (invalid.length > 0) {
            setStepError("Заполните все вопросы");
            setErrors(invalid);
            return;
        }

        setStepError("");
        setErrors([]);
        setStep(2);
        window.scrollTo({ top: 0 });
    };

    const goBack = () => {
        setStep(1);
        window.scrollTo({ top: 0 });
    };

    const save = () => {
        updateVacancy(id, { assessment: { questions, matrix } });
        navigate(`/app/vacancies/${id}`, { state: { tab: "description" } });
    };

    return (
        <div className="vacancies">
            <button type="button" className="vac-back" onClick={backToVacancy}>
                ← Вернуться назад
            </button>

            {!vacancy ? (
                <h1 className="vac-detail-title">Вакансия не найдена</h1>
            ) : (
                <>
                    <h1 className="vac-detail-title">{vacancy.title}</h1>

                    <div className="vac-tags">
                        {lang && (
                            <span
                                className="vac-tag"
                                style={{ backgroundColor: lang.color, color: lang.text }}
                            >
                                {lang.label}
                            </span>
                        )}
                        <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.experience }}>
                            {vacancy.experience}
                        </span>
                        <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.employment }}>
                            {vacancy.employment}
                        </span>
                        <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.city }}>
                            {vacancy.city}
                        </span>
                    </div>

                    <h2 className="va-subtitle">Настройка оценивания</h2>

                    {step === 1 ? (
                        <>
                            <div className="va-card">
                                <h3 className="va-step-title">Этап 1: Вопросы</h3>

                                {questions.map((question, index) => (
                                    <div className="va-question" key={index}>
                                        <div className="va-question-head">
                                            <span className="va-question-label">
                                                Вопрос {index + 1}
                                                <span className="va-req"> *</span>
                                            </span>
                                            <button
                                                type="button"
                                                className="va-del"
                                                aria-label="Удалить вопрос"
                                                onClick={() => deleteQuestion(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <input
                                            className={`va-input ${
                                                errors.includes(index) ? "va-invalid" : ""
                                            }`}
                                            placeholder="Введите вопрос"
                                            value={question.text}
                                            onChange={(event) =>
                                                updateQuestion(index, "text", event.target.value)
                                            }
                                        />
                                        <input
                                            className="va-input va-input-hint"
                                            placeholder={QUESTION_HINT}
                                            value={question.hint}
                                            onChange={(event) =>
                                                updateQuestion(index, "hint", event.target.value)
                                            }
                                        />
                                    </div>
                                ))}

                                <button type="button" className="va-add-btn" onClick={addQuestion}>
                                    Добавить вопрос
                                </button>

                                {stepError && <div className="va-error-note">{stepError}</div>}
                            </div>

                            <div className="va-footer va-footer-end">
                                <button type="button" className="va-btn danger" onClick={backToVacancy}>
                                    Отменить
                                </button>
                                <button type="button" className="va-btn primary" onClick={goNext}>
                                    Далее →
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="va-card">
                                <h3 className="va-step-title">Этап 2: Матрица компетенций</h3>

                                {GROUP_ORDER.map((key) => (
                                    <CompetencyGroup
                                        key={key}
                                        title={GROUP_TITLES[key]}
                                        items={matrix[key]}
                                        onDelete={(index) => deleteSkill(key, index)}
                                        onAdd={(name, description) => addSkill(key, name, description)}
                                    />
                                ))}
                            </div>

                            <div className="va-footer">
                                <button type="button" className="va-btn ghost" onClick={goBack}>
                                    ← Назад
                                </button>
                                <div className="va-footer-right">
                                    <button
                                        type="button"
                                        className="va-btn danger"
                                        onClick={backToVacancy}
                                    >
                                        Отменить
                                    </button>
                                    <button type="button" className="va-btn primary" onClick={save}>
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
