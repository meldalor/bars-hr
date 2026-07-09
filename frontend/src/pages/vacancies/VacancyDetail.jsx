import "./vacancies.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { LANGUAGES, TAG_COLORS } from "../../mocks/vacancies.js";
import { STATUSES, STATUS_ORDER } from "../../mocks/candidates.js";
import { fetchVacancy } from "../../api/vacancies.js";
import { fetchApplications } from "../../api/applications.js";

import Navigation_Bar from "../../components/ui/Navigation_Bar/Navigation_Bar";
import CandidatesTable from "./CandidatesTable.jsx";
import VacancyDescription from "./VacancyDescription.jsx";
import { IconInfo } from "./icons.jsx";

const CANDIDATE_STATUSES = STATUS_ORDER.filter((key) => key !== "free");

export default function VacancyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [vacancy, setVacancy] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [activeTab, setActiveTab] = useState(() => location.state?.tab || "description");

    const reloadApplications = useCallback(async () => {
        const list = await fetchApplications({ vacancyId: id });
        setApplications(list);
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([fetchVacancy(id), fetchApplications({ vacancyId: id })])
            .then(([loadedVacancy, loadedApplications]) => {
                if (!cancelled) {
                    setVacancy(loadedVacancy);
                    setApplications(loadedApplications);
                    setLoadError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setLoadError(error.message || "Не удалось загрузить вакансию");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const counts = useMemo(() => {
        const result = { all: applications.length };
        CANDIDATE_STATUSES.forEach((key) => {
            result[key] = 0;
        });
        applications.forEach((app) => {
            if (result[app.statusKey] !== undefined) {
                result[app.statusKey] += 1;
            }
        });
        return result;
    }, [applications]);

    if (loading || !vacancy) {
        return (
            <div className="vacancies">
                <button type="button" className="vac-back" onClick={() => navigate("/app/vacancies")}>
                    ← Назад к вакансиям
                </button>
                <h1 className="vac-detail-title">
                    {loading ? "Загрузка…" : loadError || "Вакансия не найдена"}
                </h1>
            </div>
        );
    }

    const lang = LANGUAGES[vacancy.lang];

    const statusTabs = [
        { id: "all", label: `Все ${counts.all}` },
        ...CANDIDATE_STATUSES.map((key) => ({ id: key, label: `${STATUSES[key].label} ${counts[key]}` })),
    ];

    return (
        <div className="vacancies">
            <button type="button" className="vac-back" onClick={() => navigate("/app/vacancies")}>
                ← Назад к вакансиям
            </button>

            <h1 className="vac-detail-title">{vacancy.title}</h1>

            <div className="vac-tags">
                {lang && (
                    <span className="vac-tag" style={{ backgroundColor: lang.color, color: lang.text }}>
                        {lang.label}
                    </span>
                )}
                <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.experience }}>{vacancy.experience}</span>
                <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.employment }}>{vacancy.employment}</span>
                <span className="vac-tag" style={{ backgroundColor: TAG_COLORS.city }}>{vacancy.city}</span>
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
                    applications={applications}
                    statusFilter={activeTab}
                    onChanged={reloadApplications}
                />
            )}
        </div>
    );
}
