import "./vacancies.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    VACANCIES,
    LANGUAGES,
    TAG_COLORS,
    formatSalary,
    plural,
    requirementStyle,
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
    IconUser,
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

const SORT_OPTIONS = [
    { id: "created-desc", label: "Сначала новые" },
    { id: "created-asc", label: "Сначала старые" },
    { id: "title-asc", label: "Название А–Я" },
    { id: "title-desc", label: "Название Я–А" },
    { id: "candidates-desc", label: "Больше кандидатов" },
    { id: "salary-desc", label: "Выше зарплата" },
];

function parseVacancyDate(value) {
    const months = {
        января: 0,
        февраля: 1,
        марта: 2,
        апреля: 3,
        мая: 4,
        июня: 5,
        июля: 6,
        августа: 7,
        сентября: 8,
        октября: 9,
        ноября: 10,
        декабря: 11,
    };

    const [dayRaw, monthRaw, timeRaw = "00:00"] = value.split(" ");
    const [hours, minutes] = timeRaw.split(":").map(Number);
    return new Date(2026, months[monthRaw] ?? 0, Number(dayRaw), hours, minutes);
}

function toggleFilterValue(value, setter) {
    setter((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
}

export default function Vacancies() {
    const navigate = useNavigate();
    const filterRef = useRef(null);
    const sortRef = useRef(null);

    const [tab, setTab] = useState("active");
    const [query, setQuery] = useState("");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [cityFilters, setCityFilters] = useState([]);
    const [languageFilters, setLanguageFilters] = useState([]);
    const [experienceFilters, setExperienceFilters] = useState([]);
    const [sortMode, setSortMode] = useState("created-desc");

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFiltersOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const byStatus = VACANCIES.filter((vacancy) => vacancy.status === tab);

    const cities = useMemo(
        () => [...new Set(byStatus.map((vacancy) => vacancy.city))].sort((a, b) => a.localeCompare(b, "ru")),
        [byStatus]
    );

    const languages = useMemo(
        () => [...new Set(byStatus.map((vacancy) => vacancy.lang))].filter(Boolean),
        [byStatus]
    );

    const experiences = useMemo(
        () => [...new Set(byStatus.map((vacancy) => vacancy.experience))].sort((a, b) => a.localeCompare(b, "ru")),
        [byStatus]
    );

    const hasFilters = cityFilters.length > 0 || languageFilters.length > 0 || experienceFilters.length > 0;

    const visible = useMemo(() => {
        const search = query.trim().toLowerCase();

        return byStatus
            .filter((vacancy) => {
                if (!search) {
                    return true;
                }

                return [
                    vacancy.title,
                    vacancy.city,
                    vacancy.experience,
                    vacancy.employment,
                    vacancy.format,
                    vacancy.department,
                    ...(vacancy.requirements || []),
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);
            })
            .filter((vacancy) => cityFilters.length === 0 || cityFilters.includes(vacancy.city))
            .filter((vacancy) => languageFilters.length === 0 || languageFilters.includes(vacancy.lang))
            .filter((vacancy) => experienceFilters.length === 0 || experienceFilters.includes(vacancy.experience))
            .sort((a, b) => {
                if (sortMode === "created-asc") {
                    return parseVacancyDate(a.createdAt) - parseVacancyDate(b.createdAt);
                }
                if (sortMode === "title-asc") {
                    return a.title.localeCompare(b.title, "ru", { sensitivity: "base" });
                }
                if (sortMode === "title-desc") {
                    return b.title.localeCompare(a.title, "ru", { sensitivity: "base" });
                }
                if (sortMode === "candidates-desc") {
                    return b.candidates - a.candidates;
                }
                if (sortMode === "salary-desc") {
                    return b.salaryTo - a.salaryTo;
                }
                return parseVacancyDate(b.createdAt) - parseVacancyDate(a.createdAt);
            });
    }, [byStatus, cityFilters, experienceFilters, languageFilters, query, sortMode]);

    const count = byStatus.length;

    const openVacancy = (id) => navigate(`/app/vacancies/${id}`, { state: { tab: "description" } });

    const clearFilters = () => {
        setCityFilters([]);
        setLanguageFilters([]);
        setExperienceFilters([]);
    };

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

                <div className="vac-dropdown-wrap" ref={filterRef}>
                    <button
                        type="button"
                        className={`vac-btn ${hasFilters ? "vac-btn-active" : ""}`}
                        onClick={() => setIsFiltersOpen((value) => !value)}
                    >
                        <IconFilter size={18} />
                        Фильтры
                    </button>

                    {isFiltersOpen && (
                        <div className="vac-dropdown vac-filter-menu">
                            <div className="vac-filter-column">
                                <div className="vac-filter-title">Город</div>
                                {cities.map((city) => (
                                    <label className="vac-check-row" key={city}>
                                        <input
                                            type="checkbox"
                                            checked={cityFilters.includes(city)}
                                            onChange={() => toggleFilterValue(city, setCityFilters)}
                                        />
                                        <span>{city}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="vac-filter-column">
                                <div className="vac-filter-title">Язык</div>
                                {languages.map((language) => (
                                    <label className="vac-check-row" key={language}>
                                        <input
                                            type="checkbox"
                                            checked={languageFilters.includes(language)}
                                            onChange={() => toggleFilterValue(language, setLanguageFilters)}
                                        />
                                        <span>{LANGUAGES[language]?.label || language}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="vac-filter-column">
                                <div className="vac-filter-title">Опыт</div>
                                {experiences.map((experience) => (
                                    <label className="vac-check-row" key={experience}>
                                        <input
                                            type="checkbox"
                                            checked={experienceFilters.includes(experience)}
                                            onChange={() => toggleFilterValue(experience, setExperienceFilters)}
                                        />
                                        <span>{experience}</span>
                                    </label>
                                ))}
                            </div>

                            <button type="button" className="vac-filter-clear" onClick={clearFilters}>
                                Очистить фильтры
                            </button>
                        </div>
                    )}
                </div>

                <div className="vac-dropdown-wrap" ref={sortRef}>
                    <button
                        type="button"
                        className="vac-btn"
                        onClick={() => setIsSortOpen((value) => !value)}
                    >
                        <IconSort size={18} />
                        Сортировка
                    </button>

                    {isSortOpen && (
                        <div className="vac-dropdown vac-sort-menu">
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    type="button"
                                    key={option.id}
                                    className={`vac-sort-option ${sortMode === option.id ? "active" : ""}`}
                                    onClick={() => {
                                        setSortMode(option.id);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
                                            backgroundColor: lang ? lang.color : "#16a34a",
                                            color: lang ? lang.text : "#ffffff",
                                        }}
                                    >
                                        {lang ? lang.code : <IconUser size={26} />}
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
                                    {vacancy.requirements.map((requirement) => (
                                        <span
                                            key={requirement}
                                            className="vac-tag"
                                            style={requirementStyle(requirement)}
                                        >
                                            {requirement}
                                        </span>
                                    ))}
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
