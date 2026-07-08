import "./vacancies.css";
import "./candidates_table.css";
import { useEffect, useMemo, useState } from "react";

import { STATUSES, STATUS_ORDER, SUBSTATUSES } from "../../mocks/candidates.js";
import {
    getMeetingForCandidate,
    scheduleInterview,
    cancelInterview,
    formatMeetingSlot,
} from "../../mocks/interviews.js";
import {
    IconSearch,
    IconFilter,
    IconEdit,
    IconPlus,
    IconChevronDown,
    IconPrinter,
    IconCalendar,
    IconUser,
    IconClock,
    IconFlask,
    IconPhone,
    IconMail,
    IconCheckCircle,
    IconXCircle,
} from "./icons.jsx";

const STATUS_ICONS = {
    free: IconUser,
    in_progress: IconClock,
    testing: IconFlask,
    interview: IconPhone,
    offer: IconMail,
    accepted: IconCheckCircle,
    rejected: IconXCircle,
};

function initials(name) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function StatusCell({
    candidate,
    openKey,
    setOpenKey,
    onChangeStatus,
    onChangeSubstatus,
    onSchedule,
    onCancel,
}) {
    const status = STATUSES[candidate.status];
    const StatusIcon = STATUS_ICONS[candidate.status];
    const subs = SUBSTATUSES[candidate.status] || [];

    const statusKey = `${candidate.id}:status`;
    const subKey = `${candidate.id}:sub`;

    const pillStyle = { color: status.color, backgroundColor: status.bg };
    const isFinal = candidate.status === "accepted" || candidate.status === "rejected";
    const scheduledMeeting =
        candidate.status === "interview" ? getMeetingForCandidate(candidate.id) : null;

    return (
        <div className="ct-status">
            <div className="ct-status-wrap">
                <button
                    type="button"
                    className="ct-pill"
                    style={pillStyle}
                    onClick={() => setOpenKey(openKey === statusKey ? null : statusKey)}
                >
                    <StatusIcon size={15} />
                    <span>{status.label}</span>
                    <IconChevronDown size={15} />
                </button>

                {openKey === statusKey && (
                    <div className="ct-menu">
                        {STATUS_ORDER.map((key) => {
                            const Ico = STATUS_ICONS[key];
                            return (
                                <button
                                    type="button"
                                    key={key}
                                    className="ct-menu-item"
                                    onClick={() => {
                                        onChangeStatus(candidate.id, key);
                                        setOpenKey(null);
                                    }}
                                >
                                    <span
                                        className="ct-menu-icon"
                                        style={{ color: STATUSES[key].color }}
                                    >
                                        <Ico size={15} />
                                    </span>
                                    {STATUSES[key].label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {isFinal ? (
                <button type="button" className="ct-print">
                    <IconPrinter size={15} />
                    Распечатать
                </button>
            ) : candidate.status === "interview" ? (
                scheduledMeeting ? (
                    <span className="ct-meeting">
                        <IconCalendar size={14} />
                        {formatMeetingSlot(scheduledMeeting)}
                        <button
                            type="button"
                            className="ct-meeting-cancel"
                            title="Отменить встречу"
                            onClick={() => onCancel(candidate.id)}
                        >
                            ×
                        </button>
                    </span>
                ) : (
                    <button
                        type="button"
                        className="ct-schedule"
                        onClick={() => onSchedule(candidate)}
                    >
                        Назначить интервью
                    </button>
                )
            ) : (
                <div className="ct-status-wrap">
                    <button
                        type="button"
                        className="ct-pill"
                        style={pillStyle}
                        onClick={() => setOpenKey(openKey === subKey ? null : subKey)}
                    >
                        <span>{candidate.substatus}</span>
                        <IconChevronDown size={15} />
                    </button>

                    {openKey === subKey && subs.length > 0 && (
                        <div className="ct-menu">
                            {subs.map((sub) => (
                                <button
                                    type="button"
                                    key={sub}
                                    className="ct-menu-item"
                                    onClick={() => {
                                        onChangeSubstatus(candidate.id, sub);
                                        setOpenKey(null);
                                    }}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CandidatesTable({ candidates, setCandidates, statusFilter, vacancy }) {
    const [query, setQuery] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [selected, setSelected] = useState(() => new Set());
    const [openKey, setOpenKey] = useState(null);
    const [, setScheduleTick] = useState(0);

    const scheduleCandidate = (candidate) => {
        scheduleInterview(candidate, vacancy);
        setScheduleTick((value) => value + 1);
    };

    const cancelCandidate = (candidateId) => {
        cancelInterview(candidateId);
        setScheduleTick((value) => value + 1);
    };

    useEffect(() => {
        if (!openKey) {
            return;
        }

        const handler = (event) => {
            if (!event.target.closest(".ct-status-wrap")) {
                setOpenKey(null);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [openKey]);

    const rows = useMemo(() => {
        let list =
            statusFilter === "all"
                ? candidates
                : candidates.filter((candidate) => candidate.status === statusFilter);

        const search = query.trim().toLowerCase();
        if (search) {
            list = list.filter(
                (candidate) =>
                    candidate.name.toLowerCase().includes(search) ||
                    candidate.specialty.toLowerCase().includes(search)
            );
        }

        return [...list].sort((a, b) =>
            sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
    }, [candidates, statusFilter, query, sortAsc]);

    const allChecked = rows.length > 0 && rows.every((candidate) => selected.has(candidate.id));

    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allChecked) {
                rows.forEach((candidate) => next.delete(candidate.id));
            } else {
                rows.forEach((candidate) => next.add(candidate.id));
            }
            return next;
        });
    };

    const toggleOne = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const changeStatus = (id, status) => {
        setCandidates((prev) =>
            prev.map((candidate) =>
                candidate.id === id
                    ? {
                          ...candidate,
                          status,
                          substatus: (SUBSTATUSES[status] && SUBSTATUSES[status][0]) || null,
                      }
                    : candidate
            )
        );
    };

    const changeSubstatus = (id, substatus) => {
        setCandidates((prev) =>
            prev.map((candidate) =>
                candidate.id === id ? { ...candidate, substatus } : candidate
            )
        );
    };

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

                <button type="button" className="vac-btn">
                    <IconFilter size={18} />
                    Фильтры
                </button>

                <button type="button" className="vac-btn">
                    <IconEdit size={18} />
                    Редактировать
                </button>

                <button type="button" className="vac-btn vac-btn-primary">
                    <IconPlus size={18} />
                    Добавить кандидата
                </button>
            </div>

            <div className="ct-card">
                <table className="ct-table">
                    <thead>
                        <tr>
                            <th className="ct-col-check">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={toggleAll}
                                    aria-label="Выбрать всех"
                                />
                            </th>
                            <th>
                                <button
                                    type="button"
                                    className="ct-sort"
                                    onClick={() => setSortAsc((value) => !value)}
                                >
                                    Имя кандидата
                                    <span className={`ct-sort-icon ${sortAsc ? "" : "desc"}`}>
                                        <IconChevronDown size={16} />
                                    </span>
                                </button>
                            </th>
                            <th>Оценка</th>
                            <th>Специальность</th>
                            <th>Дата</th>
                            <th>Статус и подстатус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="ct-empty">
                                    Кандидаты не найдены
                                </td>
                            </tr>
                        ) : (
                            rows.map((candidate) => (
                                <tr key={candidate.id}>
                                    <td className="ct-col-check">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(candidate.id)}
                                            onChange={() => toggleOne(candidate.id)}
                                            aria-label={`Выбрать ${candidate.name}`}
                                        />
                                    </td>
                                    <td>
                                        <div className="ct-person">
                                            <span className="ct-avatar">
                                                {initials(candidate.name)}
                                            </span>
                                            <div>
                                                <div className="ct-person-name">
                                                    {candidate.name}
                                                </div>
                                                <div className="ct-person-city">
                                                    {candidate.city}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="ct-rating">
                                        {candidate.rating ? `${candidate.rating}/5` : "Нет"}
                                    </td>
                                    <td className="ct-specialty">{candidate.specialty}</td>
                                    <td className="ct-date">
                                        <div>{candidate.date}</div>
                                        <div className="ct-time">{candidate.time}</div>
                                    </td>
                                    <td>
                                        <StatusCell
                                            candidate={candidate}
                                            openKey={openKey}
                                            setOpenKey={setOpenKey}
                                            onChangeStatus={changeStatus}
                                            onChangeSubstatus={changeSubstatus}
                                            onSchedule={scheduleCandidate}
                                            onCancel={cancelCandidate}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
