import "./vacancies.css";
import "./vacancy_create.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/ui/Input/Input.jsx";
import Select from "../../components/ui/Select/Select.jsx";

import { addVacancy } from "../../mocks/vacancies.js";
import { IconPlus, IconXCircle, IconCheckCircle } from "./icons.jsx";

const DEFAULT_REQUIREMENTS = [
    "Язык C#",
    "Язык JS",
    "Язык Py",
    "Язык Kotlin",
    "Знания Git",
    "Английский",
];

const LANG_BY_REQUIREMENT = {
    "Язык C#": "csharp",
    "Язык JS": "js",
    "Язык Py": "python",
};

const REQUIRED_FIELDS = [
    "title",
    "city",
    "employment",
    "experience",
    "format",
    "salaryFrom",
    "salaryTo",
    "peopleCount",
];

function deriveLang(requirements) {
    for (const requirement of requirements) {
        if (LANG_BY_REQUIREMENT[requirement]) {
            return LANG_BY_REQUIREMENT[requirement];
        }
    }
    return "js";
}

function nowStamp() {
    const now = new Date();
    const date = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
    const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}

function Field({ label, required, children }) {
    return (
        <div className="vcreate-field">
            <span className="vcreate-label">
                {label}
                {required && <span className="vcreate-req-mark"> *</span>}
            </span>
            {children}
        </div>
    );
}

export default function VacancyCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        city: "",
        employment: "",
        experience: "",
        format: "",
        salaryFrom: "",
        salaryTo: "",
        peopleCount: "",
        department: "",
        description: "",
        responsibilities: "",
    });

    const [availableReqs, setAvailableReqs] = useState(DEFAULT_REQUIREMENTS);
    const [selectedReqs, setSelectedReqs] = useState([]);
    const [adding, setAdding] = useState(false);
    const [newReq, setNewReq] = useState("");
    const [errors, setErrors] = useState({});

    const update = (key) => (event) =>
        setForm((prev) => ({ ...prev, [key]: event.target.value }));

    const invalid = (key) => (errors[key] ? "vcreate-invalid" : "");

    const toggleReq = (requirement) => {
        setSelectedReqs((prev) =>
            prev.includes(requirement)
                ? prev.filter((item) => item !== requirement)
                : [...prev, requirement]
        );
    };

    const addReq = () => {
        const value = newReq.trim();
        if (!value) {
            return;
        }
        if (!availableReqs.includes(value)) {
            setAvailableReqs((prev) => [...prev, value]);
        }
        if (!selectedReqs.includes(value)) {
            setSelectedReqs((prev) => [...prev, value]);
        }
        setNewReq("");
        setAdding(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const newErrors = {};
        REQUIRED_FIELDS.forEach((key) => {
            if (!String(form[key]).trim()) {
                newErrors[key] = true;
            }
        });
        if (selectedReqs.length === 0) {
            newErrors.requirements = true;
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const stamp = nowStamp();

        addVacancy({
            lang: deriveLang(selectedReqs),
            title: form.title.trim(),
            experience: form.experience,
            employment: form.employment,
            city: form.city.trim(),
            salaryFrom: Number(form.salaryFrom),
            salaryTo: Number(form.salaryTo),
            createdAt: stamp,
            updatedAt: stamp,
            format: form.format,
            department: form.department.trim() || "—",
            peopleCount: Number(form.peopleCount),
            requirements: selectedReqs,
            description: form.description.trim(),
            responsibilities: form.responsibilities
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
        });

        navigate("/app/vacancies");
    };

    return (
        <div className="vacancies">
            <button
                type="button"
                className="vac-back"
                onClick={() => navigate("/app/vacancies")}
            >
                ← Назад к вакансиям
            </button>

            <h1 className="vac-detail-title">Создание новой вакансии</h1>

            <form className="vcreate-card" onSubmit={handleSubmit} noValidate>
                <h2 className="vcreate-section">Основная информация</h2>

                <div className="vcreate-cols">
                    <div className="vcreate-col">
                        <Field label="Название" required>
                            <Input
                                placeholder="Например: Junior-разработчик мобильных приложений"
                                value={form.title}
                                onChange={update("title")}
                                className={invalid("title")}
                            />
                        </Field>

                        <Field label="Город" required>
                            <Input
                                placeholder="Например: Казань"
                                value={form.city}
                                onChange={update("city")}
                                className={invalid("city")}
                            />
                        </Field>

                        <Field label="Занятость" required>
                            <Select
                                value={form.employment}
                                onChange={update("employment")}
                                className={invalid("employment")}
                            >
                                <option value="">Выберите занятость</option>
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Стажировка</option>
                            </Select>
                        </Field>

                        <Field label="Опыт работы" required>
                            <Select
                                value={form.experience}
                                onChange={update("experience")}
                                className={invalid("experience")}
                            >
                                <option value="">Выберите опыт работы</option>
                                <option>Без опыта</option>
                                <option>Опыт &gt;1 года</option>
                                <option>Опыт &gt;3 лет</option>
                            </Select>
                        </Field>

                        <Field label="Формат работы" required>
                            <Select
                                value={form.format}
                                onChange={update("format")}
                                className={invalid("format")}
                            >
                                <option value="">Выберите формат работы</option>
                                <option>Офис</option>
                                <option>Гибрид</option>
                                <option>Удалёнка</option>
                            </Select>
                        </Field>

                        <Field label="Зарплатная вилка" required>
                            <div className="vcreate-salary">
                                <Input
                                    type="number"
                                    placeholder="от"
                                    value={form.salaryFrom}
                                    onChange={update("salaryFrom")}
                                    className={invalid("salaryFrom")}
                                />
                                <Input
                                    type="number"
                                    placeholder="до"
                                    value={form.salaryTo}
                                    onChange={update("salaryTo")}
                                    className={invalid("salaryTo")}
                                />
                                <span className="vcreate-salary-unit">Рублей</span>
                            </div>
                        </Field>

                        <Field label="Количество требуемых людей" required>
                            <Input
                                type="number"
                                placeholder="Например: 2"
                                value={form.peopleCount}
                                onChange={update("peopleCount")}
                                className={invalid("peopleCount")}
                            />
                        </Field>

                        <Field label="Требования" required>
                            <div className={`vcreate-chips ${errors.requirements ? "invalid" : ""}`}>
                                {availableReqs.map((requirement) => (
                                    <button
                                        type="button"
                                        key={requirement}
                                        className={`vcreate-chip ${
                                            selectedReqs.includes(requirement) ? "selected" : ""
                                        }`}
                                        onClick={() => toggleReq(requirement)}
                                    >
                                        {requirement}
                                    </button>
                                ))}
                            </div>

                            {adding ? (
                                <div className="vcreate-add-row">
                                    <input
                                        className="vcreate-add-input"
                                        placeholder="Новое требование"
                                        value={newReq}
                                        autoFocus
                                        onChange={(event) => setNewReq(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addReq();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="vcreate-add-confirm"
                                        onClick={addReq}
                                    >
                                        Добавить
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="vcreate-add-btn"
                                    onClick={() => setAdding(true)}
                                >
                                    <IconPlus size={16} />
                                    Добавить
                                </button>
                            )}
                        </Field>
                    </div>

                    <div className="vcreate-col">
                        <Field label="Отдел">
                            <Input
                                placeholder="Например: Разработка"
                                value={form.department}
                                onChange={update("department")}
                            />
                        </Field>

                        <Field label="Описание вакансии">
                            <div className="vcreate-textarea-wrap">
                                <textarea
                                    className="vcreate-textarea"
                                    maxLength={2000}
                                    placeholder="Расскажите о задачах, проекте, команде и условиях работы..."
                                    value={form.description}
                                    onChange={update("description")}
                                />
                                <span className="vcreate-counter">
                                    {form.description.length}/2000
                                </span>
                            </div>
                        </Field>

                        <Field label="Обязанности">
                            <div className="vcreate-textarea-wrap">
                                <textarea
                                    className="vcreate-textarea"
                                    maxLength={2000}
                                    placeholder="Перечислите ключевые задачи и обязанности на этой позиции..."
                                    value={form.responsibilities}
                                    onChange={update("responsibilities")}
                                />
                                <span className="vcreate-counter">
                                    {form.responsibilities.length}/2000
                                </span>
                            </div>
                        </Field>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="vcreate-error-note">
                        Заполните обязательные поля
                    </div>
                )}

                <div className="vcreate-actions">
                    <button
                        type="button"
                        className="vcreate-btn danger"
                        onClick={() => navigate("/app/vacancies")}
                    >
                        <IconXCircle size={18} />
                        Отменить
                    </button>
                    <button type="submit" className="vcreate-btn primary">
                        <IconCheckCircle size={18} />
                        Создать вакансию
                    </button>
                </div>
            </form>
        </div>
    );
}
