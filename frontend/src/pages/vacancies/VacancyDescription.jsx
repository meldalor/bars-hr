import "./vacancies.css";
import "./candidates_table.css";
import "./vacancy_description.css";
import { useMemo, useState } from "react";

import { formatSalaryFull } from "../../mocks/vacancies.js";
import { getActivityByVacancy } from "../../mocks/activity.js";

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

export default function VacancyDescription({ vacancy }) {
    const [query, setQuery] = useState("");
    const [orderDesc, setOrderDesc] = useState(true);

    const log = useMemo(() => getActivityByVacancy(vacancy.id), [vacancy.id]);

    const rows = useMemo(() => {
        const search = query.trim().toLowerCase();

        const filtered = search
            ? log.filter((entry) =>
                  [entry.datetime, entry.user, entry.role, entry.action, entry.details]
                      .join(" ")
                      .toLowerCase()
                      .includes(search)
              )
            : log;

        return orderDesc ? filtered : [...filtered].reverse();
    }, [log, query, orderDesc]);

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
                    <button type="button" className="vdesc-btn danger">
                        Закрыть вакансию
                    </button>
                    <button type="button" className="vdesc-btn primary">
                        Создать копию
                    </button>
                    <button type="button" className="vdesc-btn primary">
                        Изменить вопросы
                    </button>
                    <button type="button" className="vdesc-btn primary">
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
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>

                <button type="button" className="vac-btn">
                    <IconFilter size={18} />
                    Фильтры
                </button>

                <button type="button" className="vac-btn">
                    <IconCalendar size={18} />
                    Выбрать дату
                </button>
            </div>

            <div className="ct-card">
                <table className="ct-table">
                    <thead>
                        <tr>
                            <th>
                                <button
                                    type="button"
                                    className="ct-sort"
                                    onClick={() => setOrderDesc((value) => !value)}
                                >
                                    Дата и время
                                    <span className={`ct-sort-icon ${orderDesc ? "" : "desc"}`}>
                                        <IconChevronDown size={16} />
                                    </span>
                                </button>
                            </th>
                            <th>Пользователь</th>
                            <th>Роль</th>
                            <th>Действие</th>
                            <th>Детали</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="ct-empty">
                                    Записей не найдено
                                </td>
                            </tr>
                        ) : (
                            rows.map((entry) => (
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
        </div>
    );
}
