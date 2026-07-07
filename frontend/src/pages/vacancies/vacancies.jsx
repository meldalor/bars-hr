import "./vacancies.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    VACANCIES,
    LANGUAGES,
    TAG_COLORS,
    formatSalary,
    plural,
} from "../../mocks/vacancies.js";

import {
    IconArrowUpRight,
    IconUsers,
    IconRuble,
    IconCalendar,
    IconEdit,
    IconSearch,
    IconFilter,
    IconSort,
    IconPlus,
} from "./icons.jsx";

import Navigation_Bar from "../../components/ui/Navigation_Bar/Navigation_Bar";

const STATUS_WORDS = {
    active: ["активная", "активные", "активных"],
    completed: ["завершенная", "завершенные", "завершенных"],
};

const CANDIDATE_WORDS = ["кандидат", "кандидата", "кандидатов"];

const TAB_ITEMS = [
    { id: "active", label: "Активные" },
    { id: "completed", label: "Завершенные" },
];

export default function Vacancies() {
    const navigate = useNavigate();

    const [tab, setTab] = useState("active");
    const [query, setQuery] = useState("");

    const byStatus = VACANCIES.filter((vacancy) => vacancy.status === tab);
    const search = query.trim().toLowerCase();
    const visible = search
        ? byStatus.filter(
              (vacancy) =>
                  vacancy.title.toLowerCase().includes(search) ||
                  vacancy.city.toLowerCase().includes(search)
          )
        : byStatus;

    const count = byStatus.length;

    const openVacancy = (id) => navigate(`/app/vacancies/${id}`);

    return (
        <div className="vacancies">
            <h1 className="vac-title">
                Вакансии:{" "}
                <span className="vac-title-count">
                    {count} {plural(count, STATUS_WORDS[tab])}
                </span>
            </h1>

            <div className="vac-toolbar">
                <Navigation_Bar
                    items={TAB_ITEMS}
                    activeItem={tab}
                    onItemClick={setTab}
                />

                <div className="vac-search">
                    <IconSearch size={18} />
                    <input
                        className="vac-search-input"
                        placeholder="Поиск по вакансиям"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>

                <button type="button" className="vac-btn">
                    <IconFilter size={18} />
                    Фильтры
                </button>

                <button type="button" className="vac-btn">
                    <IconSort size={18} />
                    Сортировка
                </button>

                <button
                    type="button"
                    className="vac-btn vac-btn-primary"
                    onClick={() => navigate("/app/vacancies/new")}
                >
                    <IconPlus size={18} />
                    Создать вакансию
                </button>
            </div>

            {visible.length === 0 ? (
                <div className="vac-empty">Ничего не найдено</div>
            ) : (
                <div className="vac-grid">
                    {visible.map((vacancy) => {
                        const lang = LANGUAGES[vacancy.lang];

                        return (
                            <div
                                key={vacancy.id}
                                className="vac-card"
                                onClick={() => openVacancy(vacancy.id)}
                            >
                                <div className="vac-card-head">
                                    <div
                                        className="vac-card-icon"
                                        style={{
                                            backgroundColor: lang.color,
                                            color: lang.text,
                                        }}
                                    >
                                        {lang.code}
                                    </div>

                                    <div className="vac-card-title">{vacancy.title}</div>

                                    <button
                                        type="button"
                                        className="vac-card-link"
                                        aria-label="Открыть вакансию"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openVacancy(vacancy.id);
                                        }}
                                    >
                                        <IconArrowUpRight size={20} />
                                    </button>
                                </div>

                                <div className="vac-tags">
                                    <span
                                        className="vac-tag"
                                        style={{
                                            backgroundColor: lang.color,
                                            color: lang.text,
                                        }}
                                    >
                                        {lang.label}
                                    </span>
                                    <span
                                        className="vac-tag"
                                        style={{ backgroundColor: TAG_COLORS.experience }}
                                    >
                                        {vacancy.experience}
                                    </span>
                                    <span
                                        className="vac-tag"
                                        style={{ backgroundColor: TAG_COLORS.employment }}
                                    >
                                        {vacancy.employment}
                                    </span>
                                    <span
                                        className="vac-tag"
                                        style={{ backgroundColor: TAG_COLORS.city }}
                                    >
                                        {vacancy.city}
                                    </span>
                                </div>

                                <div className="vac-stats">
                                    <div className="vac-stat">
                                        <IconUsers size={18} />
                                        <span>
                                            {vacancy.candidates}{" "}
                                            {plural(vacancy.candidates, CANDIDATE_WORDS)}
                                        </span>
                                    </div>
                                    <div className="vac-stat">
                                        <IconRuble size={18} />
                                        <span>
                                            {formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}
                                        </span>
                                    </div>
                                    <div className="vac-stat">
                                        <IconCalendar size={18} />
                                        <span>{vacancy.createdAt}</span>
                                    </div>
                                    <div className="vac-stat">
                                        <IconEdit size={18} />
                                        <span>{vacancy.updatedAt}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
