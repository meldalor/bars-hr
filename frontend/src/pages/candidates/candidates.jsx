import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./candidates.css";

import {
  getAllCandidates,
  STATUSES,
  STATUS_ORDER,
} from "../../mocks/candidates.js";
import {
  IconSearch,
  IconFilter,
  IconEdit,
  IconPlus,
  IconChevronDown,
  IconUser,
  IconClock,
  IconFlask,
  IconPhone,
  IconMail,
  IconCheckCircle,
  IconXCircle,
} from "../vacancies/icons.jsx";

const PAGE_SIZE = 8;

const STATUS_ICONS = {
  free: IconUser,
  in_progress: IconClock,
  testing: IconFlask,
  interview: IconPhone,
  offer: IconMail,
  accepted: IconCheckCircle,
  rejected: IconXCircle,
};

const SORT_COLUMNS = [
  { key: "name", label: "Имя кандидата" },
  { key: "rating", label: "Оценка" },
  { key: "specialty", label: "Специальность" },
  { key: "date", label: "Дата" },
  { key: "status", label: "Статус и подстатус" },
];

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function parseCandidateDate(candidate) {
  const [day, month, year] = candidate.date.split(".").map(Number);
  const [hours, minutes] = candidate.time.split(":").map(Number);
  return new Date(2000 + year, month - 1, day, hours, minutes);
}

function compareCandidates(a, b, key) {
  if (key === "rating") {
    const aRating = a.rating ?? -1;
    const bRating = b.rating ?? -1;
    return aRating - bRating;
  }

  if (key === "date") {
    return parseCandidateDate(a) - parseCandidateDate(b);
  }

  if (key === "status") {
    const aStatus = `${STATUSES[a.status].label} ${a.substatus || ""}`;
    const bStatus = `${STATUSES[b.status].label} ${b.substatus || ""}`;
    return aStatus.localeCompare(bStatus, "ru", { sensitivity: "base" });
  }

  return String(a[key]).localeCompare(String(b[key]), "ru", {
    sensitivity: "base",
    numeric: true,
  });
}

function CandidateStatus({ candidate }) {
  const status = STATUSES[candidate.status];
  const StatusIcon = STATUS_ICONS[candidate.status];

  return (
    <div className="cand-status-cell">
      <span
        className="cand-status-pill"
        style={{ color: status.color, backgroundColor: status.bg }}
      >
        <StatusIcon size={15} />
        {status.label}
      </span>
      {candidate.substatus && (
        <span
          className="cand-status-pill cand-substatus-pill"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {candidate.substatus}
        </span>
      )}
    </div>
  );
}

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates] = useState(() => getAllCandidates());
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [selected, setSelected] = useState(() => new Set());
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [roleFilters, setRoleFilters] = useState([]);
  const [cityFilters, setCityFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filtersRef = useRef(null);

  const cities = useMemo(
    () => [...new Set(candidates.map((candidate) => candidate.city))].sort((a, b) => a.localeCompare(b, "ru")),
    [candidates]
  );

  const specialties = useMemo(
    () => [...new Set(candidates.map((candidate) => candidate.specialty))].sort((a, b) => a.localeCompare(b, "ru")),
    [candidates]
  );

  const counts = useMemo(() => {
    const result = { all: candidates.length };
    STATUS_ORDER.forEach((key) => {
      result[key] = 0;
    });
    candidates.forEach((candidate) => {
      result[candidate.status] += 1;
    });
    return result;
  }, [candidates]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return candidates
      .filter((candidate) => activeStatus === "all" || candidate.status === activeStatus)
      .filter((candidate) => roleFilters.length === 0 || roleFilters.includes(candidate.specialty))
      .filter((candidate) => cityFilters.length === 0 || cityFilters.includes(candidate.city))
      .filter((candidate) => {
        if (!search) {
          return true;
        }

        const searchSource = [
          candidate.name,
          candidate.fullName,
          candidate.city,
          candidate.specialty,
          candidate.date,
          candidate.time,
          candidate.rating ? `${candidate.rating}/5` : "Нет",
          STATUSES[candidate.status].label,
          candidate.substatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchSource.includes(search);
      })
      .sort((a, b) => {
        const result = compareCandidates(a, b, sort.key);
        return sort.direction === "asc" ? result : -result;
      });
  }, [activeStatus, candidates, cityFilters, query, roleFilters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allChecked = pageRows.length > 0 && pageRows.every((candidate) => selected.has(candidate.id));
  const hasFilters = roleFilters.length > 0 || cityFilters.length > 0;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const tabs = [
    { id: "all", label: `Все` },
    ...STATUS_ORDER.map((key) => ({ id: key, label: STATUSES[key].label })),
  ];

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

  const toggleFilterValue = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEditSelected = () => {
    const firstSelected = [...selected][0];
    if (firstSelected) {
      navigate(`/app/candidates/edit/${firstSelected}`);
    }
  };

  return (
    <div className="candidates-page">
      <h1 className="candidates-title">
        База кандидатов: <span>{candidates.length} человек</span>
      </h1>

      <div className="candidates-tabs">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={`candidates-tab ${activeStatus === tab.id ? "active" : ""}`}
            onClick={() => {
              setActiveStatus(tab.id);
              setCurrentPage(1);
            }}
          >
            {tab.label} {counts[tab.id]}
          </button>
        ))}
      </div>

      <div className="candidates-toolbar">
        <div className="candidates-search">
          <IconSearch size={20} />
          <input
            type="text"
            placeholder="Поиск по кандидатам"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="candidates-filter-wrap" ref={filtersRef}>
          <button
            type="button"
            className={`candidates-toolbar-btn ${hasFilters ? "active" : ""}`}
            onClick={() => setIsFiltersOpen((value) => !value)}
          >
            <IconFilter size={20} />
            Фильтры
          </button>

          {isFiltersOpen && (
            <div className="candidates-filter-menu">
              <div className="candidates-filter-column">
                <div className="candidates-filter-title">Специальность</div>
                {specialties.map((specialty) => (
                  <label className="candidates-check-row" key={specialty}>
                    <input
                      type="checkbox"
                      checked={roleFilters.includes(specialty)}
                      onChange={() => toggleFilterValue(specialty, setRoleFilters)}
                    />
                    <span>{specialty}</span>
                  </label>
                ))}
              </div>

              <div className="candidates-filter-column">
                <div className="candidates-filter-title">Город</div>
                {cities.map((city) => (
                  <label className="candidates-check-row" key={city}>
                    <input
                      type="checkbox"
                      checked={cityFilters.includes(city)}
                      onChange={() => toggleFilterValue(city, setCityFilters)}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="candidates-filter-clear"
                onClick={() => {
                  setRoleFilters([]);
                  setCityFilters([]);
                  setCurrentPage(1);
                }}
              >
                Очистить фильтры
              </button>
            </div>
          )}
        </div>

        <button type="button" className="candidates-toolbar-btn">
          Архив
        </button>

        <button
          type="button"
          className={`candidates-toolbar-btn ${selected.size > 0 ? "dark" : ""}`}
          onClick={handleEditSelected}
          disabled={selected.size === 0}
        >
          <IconEdit size={20} />
          Редактировать
        </button>

        <button
          type="button"
          className="candidates-toolbar-btn primary"
          onClick={() => navigate("/app/candidates/create")}
        >
          <IconPlus size={20} />
          Добавить кандидата
        </button>
      </div>

      <div className="candidates-table-card">
        <table className="candidates-table">
          <thead>
            <tr>
              <th className="candidates-check-col">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Выбрать кандидатов на странице"
                />
              </th>
              {SORT_COLUMNS.map((column) => (
                <th key={column.key}>
                  <button
                    type="button"
                    className="candidates-sort"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    <span
                      className={`candidates-sort-icon ${
                        sort.key === column.key ? "active" : ""
                      } ${sort.key === column.key && sort.direction === "asc" ? "asc" : ""}`}
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
                <td className="candidates-empty" colSpan={6}>
                  Кандидаты не найдены
                </td>
              </tr>
            ) : (
              pageRows.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="candidates-row"
                  onClick={() => navigate(`/app/candidates/${candidate.id}`)}
                >
                  <td
                    className="candidates-check-col"
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
                    <div className="candidate-person">
                      <span className="candidate-avatar">{initials(candidate.name)}</span>
                      <div>
                        <div className="candidate-name">{candidate.name}</div>
                        <div className="candidate-city">{candidate.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="candidate-rating">
                    {candidate.rating ? `${candidate.rating}/5` : "Нет"}
                  </td>
                  <td className="candidate-specialty">{candidate.specialty}</td>
                  <td className="candidate-date">
                    <div>{candidate.date}</div>
                    <span>{candidate.time}</span>
                  </td>
                  <td>
                    <CandidateStatus candidate={candidate} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="candidates-pagination">
        <span>
          Показано {pageRows.length} из {filtered.length}
        </span>
        <div className="candidates-pagination-actions">
          <button
            type="button"
            onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
          >
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
}
