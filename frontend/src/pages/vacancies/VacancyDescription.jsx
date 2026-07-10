import "./vacancies.css";
import "./candidates_table.css";
import "./vacancy_description.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatSalaryFull } from "../../mocks/vacancies.js";
import { closeVacancy, duplicateVacancy } from "../../api/vacancies.js";
import { getActivityByVacancy } from "../../mocks/activity.js";

import Modal from "../../components/ui/Modal/Modal.jsx";
import Pagination from "../../components/ui/Pagination/Pagination.jsx";

import {
    IconBriefcase,
    IconRuble,
    IconUsers,
    IconBuilding,
    IconBulb,
    IconDocument,
    IconCheckCircle,
    IconSearch,
    IconFilter,
    IconCalendar,
    IconChevronDown,
} from "./icons.jsx";

const PAGE_SIZE = 8;

const LOG_COLUMNS = [
    { key: "datetime", label: "Дата и время" },
    { key: "user", label: "Пользователь" },
    { key: "role", label: "Роль" },
    { key: "action", label: "Действие" },
    { key: "details", label: "Детали" },
];

function parseDisplayDate(value) {
    const [datePart, timePart = "00:00"] = value.split(" ");
    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(2000 + year, month - 1, day, hours, minutes);
}

function toInputDate(value) {
    const date = parseDisplayDate(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function compareLogRows(a, b, key) {
    if (key === "datetime") {
        return parseDisplayDate(a.datetime) - parseDisplayDate(b.datetime);
    }

    return String(a[key]).localeCompare(String(b[key]), "ru", {
        sensitivity: "base",
        numeric: true,
    });
}

export default function VacancyDescription({ vacancy }) {
    const navigate = useNavigate();
    const filterRef = useRef(null);
    const dateRef = useRef(null);

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState({ key: "datetime", direction: "desc" });
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedActions, setSelectedActions] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [confirmClose, setConfirmClose] = useState(false);
    const [confirmCopy, setConfirmCopy] = useState(false);
    const [page, setPage] = useState(1);

    const handleClose = async () => {
        await closeVacancy(vacancy.id);
        setConfirmClose(false);
        navigate("/app/vacancies");
    };

    const handleCopy = async () => {
        await duplicateVacancy(vacancy.id);
        setConfirmCopy(false);
        navigate("/app/vacancies");
    };

    const handleEdit = () => {
        navigate(`/app/vacancies/${vacancy.id}/edit`);
    };

    const handleQuestions = () => {
        navigate(`/app/vacancies/${vacancy.id}/assessment`);
    };

    const log = useMemo(() => getActivityByVacancy(vacancy.id), [vacancy.id]);

    const roles = useMemo(
        () => [...new Set(log.map((entry) => entry.role))].sort((a, b) => a.localeCompare(b, "ru")),
        [log]
    );

    const actions = useMemo(
        () => [...new Set(log.map((entry) => entry.action))].sort((a, b) => a.localeCompare(b, "ru")),
        [log]
    );

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
            if (dateRef.current && !dateRef.current.contains(event.target)) {
                setIsDateOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const toggleValue = (value, setter) => {
        setter((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
        setPage(1);
    };

    const handleSort = (key) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const rows = useMemo(() => {
        const search = query.trim().toLowerCase();

        return log
            .filter((entry) => {
                const source = [entry.datetime, entry.user, entry.role, entry.action, entry.details]
                    .join(" ")
                    .toLowerCase();
                return !search || source.includes(search);
            })
            .filter((entry) => selectedRoles.length === 0 || selectedRoles.includes(entry.role))
            .filter((entry) => selectedActions.length === 0 || selectedActions.includes(entry.action))
            .filter((entry) => !selectedDate || toInputDate(entry.datetime) === selectedDate)
            .sort((a, b) => {
                const result = compareLogRows(a, b, sort.key);
                return sort.direction === "asc" ? result : -result;
            });
    }, [log, query, selectedActions, selectedDate, selectedRoles, sort]);

    const hasFilters = selectedRoles.length > 0 || selectedActions.length > 0;

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = rows.slice(0, safePage * PAGE_SIZE);

    return (
        <div className="vdesc">
            <div className="vdesc-card">
                <div className="vdesc-grid">
                    <div className="vdesc-col">
                        <div className="vdesc-info-row">
                            <IconBriefcase size={20} />
                            <span>Формат работы: {vacancy.format}</span>
                        </div>
                        <div className="vdesc-info-row">
                            <IconRuble size={20} />
                            <span>
                                Зарплата: {formatSalaryFull(vacancy.salaryFrom, vacancy.salaryTo)}
                            </span>
                        </div>
                        <div className="vdesc-info-row">
                            <IconUsers size={20} />
                            <span>Количество требуемых людей: {vacancy.peopleCount}</span>
                        </div>
                        <div className="vdesc-info-row">
                            <IconBuilding size={20} />
                            <span>Отдел: {vacancy.department}</span>
                        </div>

                        <div className="vdesc-req">
                            <span className="vdesc-req-label">
                                <IconBulb size={20} />
                                Требования:
                            </span>
                            {vacancy.requirements.map((requirement) => (
                                <span key={requirement} className="vdesc-chip">
                                    {requirement}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="vdesc-col">
                        <div className="vdesc-head">
                            <IconDocument size={20} />
                            Описание вакансии
                        </div>
                        <p className="vdesc-text">{vacancy.description}</p>
                    </div>

                    <div className="vdesc-col">
                        <div className="vdesc-head">
                            <IconCheckCircle size={20} />
                            Обязанности
                        </div>
                        <ul className="vdesc-list">
                            {vacancy.responsibilities.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="vdesc-actions">
                    <button
                        type="button"
                        className="vdesc-btn danger"
                        onClick={() => setConfirmClose(true)}
                    >
                        Закрыть вакансию
                    </button>
                    <button
                        type="button"
                        className="vdesc-btn primary"
                        onClick={() => setConfirmCopy(true)}
                    >
                        Создать копию
                    </button>
                    <button
                        type="button"
                        className="vdesc-btn primary"
                        onClick={handleQuestions}
                    >
                        Матрица компетенций
                    </button>
                    <button
                        type="button"
                        className="vdesc-btn primary"
                        onClick={handleEdit}
                    >
                        Изменить вакансию
                    </button>
                </div>
            </div>

            <h2 className="vdesc-log-title">Журнал активности</h2>

            <div className="vdesc-log-toolbar">
                <div className="vac-search">
                    <IconSearch size={18} />
                    <input
                        className="vac-search-input"
                        placeholder="Поиск"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="vdesc-dropdown-wrap" ref={filterRef}>
                    <button
                        type="button"
                        className={`vac-btn ${hasFilters ? "vac-btn-active" : ""}`}
                        onClick={() => setIsFilterOpen((value) => !value)}
                    >
                        <IconFilter size={18} />
                        Фильтры
                    </button>

                    {isFilterOpen && (
                        <div className="vdesc-dropdown vdesc-filter-menu">
                            <div className="vdesc-filter-group">
                                <div className="vdesc-filter-title">Роль</div>
                                {roles.map((role) => (
                                    <label className="vdesc-check-row" key={role}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(role)}
                                            onChange={() => toggleValue(role, setSelectedRoles)}
                                        />
                                        <span>{role}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="vdesc-filter-group">
                                <div className="vdesc-filter-title">Тип действия</div>
                                {actions.map((action) => (
                                    <label className="vdesc-check-row" key={action}>
                                        <input
                                            type="checkbox"
                                            checked={selectedActions.includes(action)}
                                            onChange={() => toggleValue(action, setSelectedActions)}
                                        />
                                        <span>{action}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="vdesc-clear-btn"
                                onClick={() => {
                                    setSelectedRoles([]);
                                    setSelectedActions([]);
                                    setPage(1);
                                }}
                            >
                                Очистить фильтры
                            </button>
                        </div>
                    )}
                </div>

                <div className="vdesc-dropdown-wrap" ref={dateRef}>
                    <button
                        type="button"
                        className={`vac-btn ${selectedDate ? "vac-btn-active" : ""}`}
                        onClick={() => setIsDateOpen((value) => !value)}
                    >
                        <IconCalendar size={18} />
                        {selectedDate || "Выбрать дату"}
                    </button>

                    {isDateOpen && (
                        <div className="vdesc-dropdown vdesc-date-menu">
                            <label className="vdesc-date-label">
                                Дата события
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(event) => {
                                        setSelectedDate(event.target.value);
                                        setPage(1);
                                    }}
                                />
                            </label>

                            <button
                                type="button"
                                className="vdesc-clear-btn"
                                onClick={() => {
                                    setSelectedDate("");
                                    setPage(1);
                                }}
                            >
                                Очистить дату
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="ct-card">
                <table className="ct-table">
                    <thead>
                        <tr>
                            {LOG_COLUMNS.map((column) => (
                                <th key={column.key}>
                                    <button
                                        type="button"
                                        className="ct-sort"
                                        onClick={() => handleSort(column.key)}
                                    >
                                        {column.label}
                                        <span
                                            className={`ct-sort-icon ${
                                                sort.key === column.key && sort.direction === "asc" ? "desc" : ""
                                            }`}
                                        >
                                            <IconChevronDown size={16} />
                                        </span>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="ct-empty">
                                    Записей не найдено
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="ct-date">{entry.datetime}</td>
                                    <td className="vdesc-log-user">{entry.user}</td>
                                    <td className="vdesc-log-cell">{entry.role}</td>
                                    <td className="vdesc-log-cell">{entry.action}</td>
                                    <td className="vdesc-log-cell">{entry.details}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

            <Modal open={confirmClose} onClose={() => setConfirmClose(false)}>
                <p className="vdesc-modal-title">Закрыть вакансию «{vacancy.title}»?</p>
                <div className="vdesc-modal-actions">
                    <button
                        type="button"
                        className="vdesc-btn ghost"
                        onClick={() => setConfirmClose(false)}
                    >
                        Отмена
                    </button>
                    <button type="button" className="vdesc-btn danger" onClick={handleClose}>
                        Закрыть
                    </button>
                </div>
            </Modal>

            <Modal open={confirmCopy} onClose={() => setConfirmCopy(false)}>
                <p className="vdesc-modal-title">Создать копию вакансии «{vacancy.title}»?</p>
                <div className="vdesc-modal-actions">
                    <button
                        type="button"
                        className="vdesc-btn ghost"
                        onClick={() => setConfirmCopy(false)}
                    >
                        Отмена
                    </button>
                    <button type="button" className="vdesc-btn primary" onClick={handleCopy}>
                        Создать копию
                    </button>
                </div>
            </Modal>
        </div>
    );
}
