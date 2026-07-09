import { useEffect, useMemo, useRef, useState } from "react";
import "./ActivityTable.css";
import { getActivityByVacancy } from "../../../../mocks/activity";
import Pagination from "../../../../components/ui/Pagination/Pagination.jsx";

import searchIcon from "../../../../assets/overview/search.svg";
import filterIcon from "../../../../assets/overview/nastroyky.svg";
import calendarIcon from "../../../../assets/overview/calendar.svg";
import chevronDownIcon from "../../../../assets/overview/Chevron down.svg";

const PAGE_SIZE = 20;

const COLUMNS = [
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

function compareValues(a, b, key) {
    if (key === "datetime") {
        return parseDisplayDate(a.datetime) - parseDisplayDate(b.datetime);
    }

    return String(a[key]).localeCompare(String(b[key]), "ru", {
        sensitivity: "base",
        numeric: true,
    });
}

function ActivityTable() {
    const activity = useMemo(() => getActivityByVacancy(), []);

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState({ key: "datetime", direction: "desc" });
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedActions, setSelectedActions] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [page, setPage] = useState(1);

    const filterRef = useRef(null);
    const dateRef = useRef(null);

    const roles = useMemo(
        () => [...new Set(activity.map((item) => item.role))].sort((a, b) => a.localeCompare(b, "ru")),
        [activity]
    );

    const actions = useMemo(
        () => [...new Set(activity.map((item) => item.action))].sort((a, b) => a.localeCompare(b, "ru")),
        [activity]
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
    };

    const handleSort = (key) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const filteredActivity = useMemo(() => {
        const search = query.trim().toLowerCase();

        return activity
            .filter((item) => {
                const searchSource = [
                    item.datetime,
                    item.user,
                    item.role,
                    item.action,
                    item.details,
                ]
                    .join(" ")
                    .toLowerCase();

                return !search || searchSource.includes(search);
            })
            .filter((item) => selectedRoles.length === 0 || selectedRoles.includes(item.role))
            .filter((item) => selectedActions.length === 0 || selectedActions.includes(item.action))
            .filter((item) => !selectedDate || toInputDate(item.datetime) === selectedDate)
            .sort((a, b) => {
                const result = compareValues(a, b, sort.key);
                return sort.direction === "asc" ? result : -result;
            });
    }, [activity, query, selectedRoles, selectedActions, selectedDate, sort]);

    const hasFilters = selectedRoles.length > 0 || selectedActions.length > 0;

    const totalPages = Math.max(1, Math.ceil(filteredActivity.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = filteredActivity.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <section className="activity-table-card">
            <div className="activity-header">
                <h2 className="activity-title">Журнал активности</h2>

                <div className="activity-toolbar">
                    <div className="activity-search-wrapper">
                        <img src={searchIcon} alt="" className="activity-search-icon" />

                        <input
                            type="text"
                            placeholder="Поиск"
                            className="activity-search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>

                    <div className="activity-dropdown-wrap" ref={filterRef}>
                        <button
                            type="button"
                            className={`activity-button ${hasFilters ? "activity-button--active" : ""}`}
                            onClick={() => setIsFilterOpen((value) => !value)}
                        >
                            <img src={filterIcon} alt="" className="activity-button-icon" />
                            <span>Фильтры</span>
                        </button>

                        {isFilterOpen && (
                            <div className="activity-dropdown activity-filter-menu">
                                <div className="activity-filter-group">
                                    <div className="activity-filter-title">Роль</div>
                                    {roles.map((role) => (
                                        <label className="activity-check-row" key={role}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.includes(role)}
                                                onChange={() => toggleValue(role, setSelectedRoles)}
                                            />
                                            <span>{role}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="activity-filter-group">
                                    <div className="activity-filter-title">Тип действия</div>
                                    {actions.map((action) => (
                                        <label className="activity-check-row" key={action}>
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
                                    className="activity-clear-btn"
                                    onClick={() => {
                                        setSelectedRoles([]);
                                        setSelectedActions([]);
                                    }}
                                >
                                    Очистить фильтры
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="activity-dropdown-wrap" ref={dateRef}>
                        <button
                            type="button"
                            className={`activity-button ${selectedDate ? "activity-button--active" : ""}`}
                            onClick={() => setIsDateOpen((value) => !value)}
                        >
                            <img src={calendarIcon} alt="" className="activity-button-icon" />
                            <span>{selectedDate || "Выбрать дату"}</span>
                        </button>

                        {isDateOpen && (
                            <div className="activity-dropdown activity-date-menu">
                                <label className="activity-date-label">
                                    Дата события
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(event) => setSelectedDate(event.target.value)}
                                    />
                                </label>

                                <button
                                    type="button"
                                    className="activity-clear-btn"
                                    onClick={() => setSelectedDate("")}
                                >
                                    Очистить дату
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="activity-table-wrapper">
                <table className="activity-table">
                    <thead>
                        <tr>
                            {COLUMNS.map((column) => (
                                <th key={column.key}>
                                    <button
                                        type="button"
                                        className="activity-sort-button"
                                        onClick={() => handleSort(column.key)}
                                    >
                                        <span>{column.label}</span>
                                        <img
                                            src={chevronDownIcon}
                                            alt=""
                                            className={`table-arrow ${
                                                sort.key === column.key ? "table-arrow--active" : ""
                                            } ${
                                                sort.key === column.key && sort.direction === "asc"
                                                    ? "table-arrow--asc"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td className="activity-empty" colSpan={5}>
                                    Записи не найдены
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.datetime}</td>
                                    <td>{item.user}</td>
                                    <td>{item.role}</td>
                                    <td>{item.action}</td>
                                    <td>{item.details}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </section>
    );
}

export default ActivityTable;
