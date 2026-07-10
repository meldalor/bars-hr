import "./vacancies.css";
import "./candidates_table.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { STATUSES, STATUS_ORDER, SUBSTATUSES } from "../../mocks/candidates.js";
import { backendStatus } from "../../api/candidates.js";
import { updateApplicationStatus } from "../../api/applications.js";
import { IconSearch, IconChevronDown, IconPlus } from "./icons.jsx";

function initials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0] || "")
        .join("")
        .toUpperCase();
}

// отклики по вакансии + инлайн-смена статуса/подстатуса (PUT /applications/{id}/status)
export default function CandidatesTable({ vacancyId, applications, statusFilter, onChanged }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [openKey, setOpenKey] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const rows = useMemo(() => {
        const search = query.trim().toLowerCase();
        return applications
            .filter((app) => statusFilter === "all" || app.statusKey === statusFilter)
            .filter((app) => !search || app.candidateName.toLowerCase().includes(search));
    }, [applications, statusFilter, query]);

    const applyChange = async (app, body) => {
        setBusyId(app.id);
        setError("");
        setOpenKey(null);
        try {
            await updateApplicationStatus(app.id, body);
            await onChanged();
        } catch (changeError) {
            setError(changeError.message || "Не удалось изменить статус");
        } finally {
            setBusyId(null);
        }
    };

    const changeStatus = (app, key) => applyChange(app, { status: backendStatus(key), subStatus: null });
    const changeSubStatus = (app, subStatus) => applyChange(app, { status: app.status, subStatus });

    return (
        <div className="ct">
            <div className="ct-toolbar">
                <div className="vac-search">
                    <IconSearch size={18} />
                    <input
                        className="vac-search-input"
                        placeholder="Поиск по кандидатам"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="vac-btn"
                    onClick={() =>
                        navigate("/app/candidates", { state: { selectForVacancy: vacancyId } })
                    }
                >
                    Выбрать кандидата
                </button>
                <button
                    type="button"
                    className="vac-btn vac-btn-primary"
                    onClick={() => navigate("/app/candidates/create", { state: { vacancyId } })}
                >
                    <IconPlus size={18} />
                    Создать кандидата
                </button>
            </div>

            {error && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>{error}</div>}

            <div className="ct-card">
                <table className="ct-table">
                    <thead>
                        <tr>
                            <th>Имя кандидата</th>
                            <th>Дата отклика</th>
                            <th>Статус</th>
                            <th>Подстатус</th>
                            <th>Интервью</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="ct-empty">Кандидаты не найдены</td>
                            </tr>
                        ) : (
                            rows.map((app) => {
                                const status = STATUSES[app.statusKey];
                                const subs = SUBSTATUSES[app.statusKey] || [];
                                const statusMenu = `${app.id}:status`;
                                const subMenu = `${app.id}:sub`;
                                const pillStyle = { color: status.color, backgroundColor: status.bg };

                                return (
                                    <tr
                                        key={app.id}
                                        className="ct-clickable-row"
                                        onClick={() => navigate(`/app/candidates/${app.candidateId}`)}
                                    >
                                        <td>
                                            <div className="ct-person">
                                                <span className="ct-avatar">{initials(app.candidateName)}</span>
                                                <div className="ct-person-name">{app.candidateName}</div>
                                            </div>
                                        </td>
                                        <td className="ct-date">{app.appliedAt}</td>
                                        <td onClick={(event) => event.stopPropagation()}>
                                            <div className="ct-status-wrap">
                                                <button
                                                    type="button"
                                                    className="ct-pill"
                                                    style={pillStyle}
                                                    disabled={busyId === app.id}
                                                    onClick={() => setOpenKey(openKey === statusMenu ? null : statusMenu)}
                                                >
                                                    <span>{status.label}</span>
                                                    <IconChevronDown size={15} />
                                                </button>
                                                {openKey === statusMenu && (
                                                    <div className="ct-menu">
                                                        {STATUS_ORDER.filter((key) => key !== "free").map((key) => (
                                                            <button
                                                                type="button"
                                                                key={key}
                                                                className="ct-menu-item"
                                                                onClick={() => changeStatus(app, key)}
                                                            >
                                                                {STATUSES[key].label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td onClick={(event) => event.stopPropagation()}>
                                            {subs.length === 0 ? (
                                                // у статуса нет подстатусов — чужой (устаревший) не показываем
                                                <span className="ct-muted">—</span>
                                            ) : (
                                                <div className="ct-status-wrap">
                                                    <button
                                                        type="button"
                                                        className="ct-pill"
                                                        style={pillStyle}
                                                        disabled={busyId === app.id}
                                                        onClick={() => setOpenKey(openKey === subMenu ? null : subMenu)}
                                                    >
                                                        <span>{subs.includes(app.subStatus) ? app.subStatus : "Выбрать"}</span>
                                                        <IconChevronDown size={15} />
                                                    </button>
                                                    {openKey === subMenu && (
                                                        <div className="ct-menu">
                                                            {subs.map((sub) => (
                                                                <button
                                                                    type="button"
                                                                    key={sub}
                                                                    className="ct-menu-item"
                                                                    onClick={() => changeSubStatus(app, sub)}
                                                                >
                                                                    {sub}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td onClick={(event) => event.stopPropagation()}>
                                            {app.interviewsCount > 0 ? (
                                                <button
                                                    type="button"
                                                    className="ct-schedule"
                                                    onClick={() => navigate("/app/meetings")}
                                                >
                                                    К встречам
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="ct-schedule"
                                                    onClick={() =>
                                                        navigate("/app/meetings", {
                                                            state: {
                                                                schedule: {
                                                                    candidateId: app.candidateId,
                                                                    vacancyId: app.vacancyId,
                                                                },
                                                            },
                                                        })
                                                    }
                                                >
                                                    Назначить интервью
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
