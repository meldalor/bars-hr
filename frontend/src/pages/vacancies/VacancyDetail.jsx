import "./vacancies.css";
import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { getVacancyById, LANGUAGES, TAG_COLORS } from "../../mocks/vacancies.js";
import { STATUS_ORDER, STATUSES, getCandidatesByVacancy } from "../../mocks/candidates.js";

import Navigation_Bar from "../../components/ui/Navigation_Bar/Navigation_Bar";
import CandidatesTable from "./CandidatesTable.jsx";
import VacancyDescription from "./VacancyDescription.jsx";
import { IconInfo } from "./icons.jsx";

export default function VacancyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const vacancy = getVacancyById(id);

    const [candidates, setCandidates] = useState(() => getCandidatesByVacancy(id));
    const [activeTab, setActiveTab] = useState(() => location.state?.tab || "description");

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

    if (!vacancy) {
        return (
            <div className="vacancies">
                <button
                    type="button"
                    className="vac-back"
                    onClick={() => navigate("/app/vacancies")}
                >
                    ← Назад к вакансиям
                </button>
                <h1 className="vac-detail-title">Вакансия не найдена</h1>
            </div>
        );
    }

    const lang = LANGUAGES[vacancy.lang];

    const statusTabs = [
        { id: "all", label: `Все ${counts.all}` },
        ...STATUS_ORDER.map((key) => ({
            id: key,
            label: `${STATUSES[key].label} ${counts[key]}`,
        })),
    ];

    return (
        <div className="vacancies">
            <button
                type="button"
                className="vac-back"
                onClick={() => navigate("/app/vacancies")}
            >
                ← Назад к вакансиям
            </button>

            <h1 className="vac-detail-title">{vacancy.title}</h1>

            <div className="vac-tags">
                {lang && (
                    <span
                        className="vac-tag"
                        style={{ backgroundColor: lang.color, color: lang.text }}
                    >
                        {lang.label}
                    </span>
                )}
                <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.experience }}>
                    {vacancy.experience}
                </span>
                <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.employment }}>
                    {vacancy.employment}
                </span>
                <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.city }}>
                    {vacancy.city}
                </span>
            </div>

            <div className="vd-tabs-row">
                <div className="vd-tabs">
                    <Navigation_Bar
                        items={statusTabs}
                        activeItem={activeTab === "description" ? "" : activeTab}
                        onItemClick={setActiveTab}
                    />
                </div>

                <button
                    type="button"
                    className={`vd-desc-btn ${activeTab === "description" ? "active" : ""}`}
                    onClick={() => setActiveTab("description")}
                >
                    <IconInfo size={16} />
                    Описание вакансии
                </button>
            </div>

            {activeTab === "description" ? (
                <VacancyDescription vacancy={vacancy} />
            ) : (
                <CandidatesTable
                    candidates={candidates}
                    setCandidates={setCandidates}
                    statusFilter={activeTab}
                    vacancy={vacancy}
                />
            )}
        </div>
    );
}
