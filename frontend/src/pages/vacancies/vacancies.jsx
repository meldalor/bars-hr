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
    { key: "title", label: "По названию" },
    { key: "city", label: "По городу" },
    { key: "candidates", label: "По кандидатам" },
    { key: "salary", label: "По зарплате" },
];

function toggleFilter(value, setter) {
    setter((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
}

function compareVacancies(a, b, key) {
    if (key === "candidates") {
        return a.candidates - b.candidates;
    }

    if (key === "salary") {
        return a.salaryFrom - b.salaryFrom;
    }

    return String(a[key]).localeCompare(String(b[key]), "ru", {
        sensitivity: "base",
        numeric: true,
    });
}

export default function Vacancies() {
    const navigate = useNavigate();

    const [tab, setTab] = useState("active");
    const [query, setQuery] = useState("");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [cityFilters, setCityFilters] = useState([]);
    const [languageFilters, setLanguageFilters] = useState([]);
    const [experienceFilters, setExperienceFilters] = useState([]);
    const [sort, setSort] = useState({ key: "title", direction: "asc" });

    const filterRef = useRef(null);
    const sortRef = useRef(null);

    const byStatus = useMemo(
        () => VACANCIES.filter((vacancy) => vacancy.status === tab),
        [tab]
    );

    const cities = useMemo(
        () => [...new Set(byStatus.map((vacancy) => vacancy.city))].sort((a, b) => a.localeCompare(b, "ru")),
        [byStatus]
    );

    const languages = useMemo(
        () => [...new Set(byStatus.map((vacancy) => vacancy.lang))],
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
            .filter((vacancy) => cityFilters.length === 0 || cityFilters.includes(vacancy.city))
            .filter((vacancy) => languageFilters.length === 0 || languageFilters.includes(vacancy.lang))
            .filter((vacancy) => experienceFilters.length === 0 || experienceFilters.includes(vacancy.experience))
            .filter((vacancy) => {
                if (!search) {
                    return true;
                }

                const lang = LANGUAGES[vacancy.lang];
                return [
                    vacancy.title,
                    vacancy.city,
                    vacancy.experience,
                    vacancy.employment,
                    vacancy.format,
                    vacancy.department,
                    lang?.label,
                    vacancy.requirements.join(" "),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(search);
            })
            .sort((a, b) => {
                const result = compareVacancies(a, b, sort.key);
                return sort.direction === "asc" ? result : -result;
            });
    }, [byStatus, cityFilters, experienceFilters, languageFilters, query, sort]);

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

    const count = byStatus.length;

    const openVacancy = (id) => navigate(`/app/vacancies/${id}`);

    const changeSort = (key) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
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
                    onItemClick={(value) => {
                        setTab(value);
                        setCityFilters([]);
                        setLanguageFilters([]);
                        setExperienceFilters([]);
                    }}
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
                        <div className="vac-dropdown-menu vac-filter-menu">
                            <div className="vac-filter-column">
                                <div className="vac-filter-title">Город</div>
                                {cities.map((city) => (
                                    <label className="vac-check-row" key={city}>
                                        <input
                                            type="checkbox"
                                            checked={cityFilters.includes(city)}
                                            onChange={() => toggleFilter(city, setCityFilters)}
                                        />
                                        <span>{city}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="vac-filter-column">
                                <div className="vac-filter-title">Технология</div>
                                {languages.map((language) => (
                                    <label className="vac-check-row" key={language}>
                                        <input
                                            type="checkbox"
                                            checked={languageFilters.includes(language)}
                                            onChange={() => toggleFilter(language, setLanguageFilters)}
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
                                            onChange={() => toggleFilter(experience, setExperienceFilters)}
                                        />
                                        <span>{experience}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="vac-filter-clear"
                                onClick={() => {
                                    setCityFilters([]);
                                    setLanguageFilters([]);
                                    setExperienceFilters([]);
                                }}
                            >
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
                        <div className="vac-dropdown-menu vac-sort-menu">
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    type="button"
                                    className={`vac-sort-item ${sort.key === option.key ? "active" : ""}`}
                                    key={option.key}
                                    onClick={() => changeSort(option.key)}
                                >
                                    <span>{option.label}</span>
                                    {sort.key === option.key && (
                                        <span>{sort.direction === "asc" ? "↑" : "↓"}</span>
                                    )}
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
