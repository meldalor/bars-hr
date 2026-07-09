import "./vacancies.css";
import "./candidates_table.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    STATUSES,
    STATUS_ORDER,
    SUBSTATUSES,
    setCandidateSubstatus,
} from "../../mocks/candidates.js";
import {
    getMeetingForCandidate,
    cancelInterview,
    formatMeetingSlot,
} from "../../mocks/interviews.js";
import Modal from "../../components/ui/Modal/Modal.jsx";
import Pagination from "../../components/ui/Pagination/Pagination.jsx";
import {
    IconSearch,
    IconFilter,
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

const PAGE_SIZE = 20;

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
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [selected, setSelected] = useState(() => new Set());
    const [openKey, setOpenKey] = useState(null);
    const [, setScheduleTick] = useState(0);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [cityFilters, setCityFilters] = useState([]);
    const [specialtyFilters, setSpecialtyFilters] = useState([]);
    const [skillFilters, setSkillFilters] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [page, setPage] = useState(1);
    const filtersRef = useRef(null);

    const cities = useMemo(
        () =>
            [...new Set(candidates.map((candidate) => candidate.city))].sort((a, b) =>
                a.localeCompare(b, "ru")
            ),
        [candidates]
    );

    const specialties = useMemo(
        () =>
            [...new Set(candidates.map((candidate) => candidate.specialty))].sort((a, b) =>
                a.localeCompare(b, "ru")
            ),
        [candidates]
    );

    const skills = useMemo(
        () =>
            [...new Set(candidates.flatMap((candidate) => candidate.skills || []))].sort((a, b) =>
                a.localeCompare(b, "ru")
            ),
        [candidates]
    );

    const hasFilters =
        cityFilters.length > 0 || specialtyFilters.length > 0 || skillFilters.length > 0;

    const toggleFilterValue = (value, setter) => {
        setter((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    const deleteSelected = () => {
        setCandidates((prev) => prev.filter((candidate) => !selected.has(candidate.id)));
        setSelected(new Set());
        setConfirmDelete(false);
    };

    const scheduleCandidate = (candidate) => {
        navigate("/app/meetings", {
            state: {
                schedule: { candidateId: candidate.id, vacancyId: vacancy.id },
            },
        });
    };

    const cancelCandidate = (candidateId) => {
        cancelInterview(candidateId);
        setCandidateSubstatus(candidateId, "Интервью не назначено");
        setCandidates((prev) =>
            prev.map((candidate) =>
                candidate.id === candidateId
                    ? { ...candidate, substatus: "Интервью не назначено" }
                    : candidate
            )
        );
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

    useEffect(() => {
        if (!isFiltersOpen) {
            return;
        }

        const handler = (event) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setIsFiltersOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isFiltersOpen]);

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

        if (cityFilters.length > 0) {
            list = list.filter((candidate) => cityFilters.includes(candidate.city));
        }

        if (specialtyFilters.length > 0) {
            list = list.filter((candidate) => specialtyFilters.includes(candidate.specialty));
        }

        if (skillFilters.length > 0) {
            list = list.filter((candidate) =>
                skillFilters.some((skill) => (candidate.skills || []).includes(skill))
            );
        }

        return [...list].sort((a, b) =>
            sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
    }, [candidates, statusFilter, query, sortAsc, cityFilters, specialtyFilters, skillFilters]);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const allChecked =
        pageRows.length > 0 && pageRows.every((candidate) => selected.has(candidate.id));

    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allChecked) {
                pageRows.forEach((candidate) => next.delete(candidate.id));
            } else {
                pageRows.forEach((candidate) => next.add(candidate.id));
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

                <div className="ct-filter-wrap" ref={filtersRef}>
                    <button
                        type="button"
                        className={`vac-btn ${hasFilters ? "vac-btn-active" : ""}`}
                        onClick={() => setIsFiltersOpen((value) => !value)}
                    >
                        <IconFilter size={18} />
                        Фильтры
                    </button>

                    {isFiltersOpen && (
                        <div className="ct-filter-menu">
                            <div className="ct-filter-column">
                                <div className="ct-filter-title">Специальность</div>
                                {specialties.map((specialty) => (
                                    <label className="ct-check-row" key={specialty}>
                                        <input
                                            type="checkbox"
                                            checked={specialtyFilters.includes(specialty)}
                                            onChange={() =>
                                                toggleFilterValue(specialty, setSpecialtyFilters)
                                            }
                                        />
                                        <span>{specialty}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="ct-filter-column">
                                <div className="ct-filter-title">Город</div>
                                {cities.map((city) => (
                                    <label className="ct-check-row" key={city}>
                                        <input
                                            type="checkbox"
                                            checked={cityFilters.includes(city)}
                                            onChange={() => toggleFilterValue(city, setCityFilters)}
                                        />
                                        <span>{city}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="ct-filter-column">
                                <div className="ct-filter-title">Навыки</div>
                                {skills.map((skill) => (
                                    <label className="ct-check-row" key={skill}>
                                        <input
                                            type="checkbox"
                                            checked={skillFilters.includes(skill)}
                                            onChange={() => toggleFilterValue(skill, setSkillFilters)}
                                        />
                                        <span>{skill}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="ct-filter-clear"
                                onClick={() => {
                                    setCityFilters([]);
                                    setSpecialtyFilters([]);
                                    setSkillFilters([]);
                                }}
                            >
                                Очистить фильтры
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="vac-btn vac-btn-primary"
                    onClick={() => navigate("/app/candidates/create")}
                >
                    <IconPlus size={18} />
                    Добавить кандидата
                </button>

                {selected.size > 0 && (
                    <button
                        type="button"
                        className="vac-btn vac-btn-danger"
                        onClick={() => setConfirmDelete(true)}
                    >
                        Удалить ({selected.size})
                    </button>
                )}
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
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="ct-empty">
                                    Кандидаты не найдены
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((candidate) => (
                                <tr
                                    key={candidate.id}
                                    className="ct-row-clickable"
                                    onClick={() => navigate(`/app/candidates/${candidate.id}`)}
                                >
                                    <td
                                        className="ct-col-check"
                                        onClick={(event) => event.stopPropagation()}
                                    >
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
                                    <td onClick={(event) => event.stopPropagation()}>
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

            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

            <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
                <p className="ct-modal-title">
                    Удалить выбранных кандидатов ({selected.size}) из вакансии?
                </p>
                <div className="ct-modal-actions">
                    <button
                        type="button"
                        className="ct-modal-btn ghost"
                        onClick={() => setConfirmDelete(false)}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        className="ct-modal-btn danger"
                        onClick={deleteSelected}
                    >
                        Удалить
                    </button>
                </div>
            </Modal>
        </div>
    );
}
