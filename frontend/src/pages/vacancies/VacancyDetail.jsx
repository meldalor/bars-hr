import "./vacancies.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { LANGUAGES, TAG_COLORS } from "../../mocks/vacancies.js";
import { fetchVacancy } from "../../api/vacancies.js";

import Navigation_Bar from "../../components/ui/Navigation_Bar/Navigation_Bar";
import VacancyDescription from "./VacancyDescription.jsx";

export default function VacancyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [vacancy, setVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [activeTab, setActiveTab] = useState(() =>
        location.state?.tab === "candidates" ? "candidates" : "description"
    );

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchVacancy(id)
            .then((data) => {
                if (!cancelled) {
                    setVacancy(data);
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

    if (loading || !vacancy) {
        return (
            <div className="vacancies">
                <button
                    type="button"
                    className="vac-back"
                    onClick={() => navigate("/app/vacancies")}
                >
                    ← Назад к вакансиям
                </button>
                <h1 className="vac-detail-title">
                    {loading ? "Загрузка…" : loadError || "Вакансия не найдена"}
                </h1>
            </div>
        );
    }

    const lang = LANGUAGES[vacancy.lang];

    const tabs = [
        { id: "description", label: "Описание" },
        { id: "candidates", label: "Кандидаты" },
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
                        items={tabs}
                        activeItem={activeTab}
                        onItemClick={setActiveTab}
                    />
                </div>
            </div>

            {activeTab === "description" ? (
                <VacancyDescription vacancy={vacancy} />
            ) : (
                <div className="vac-empty">
                    Список кандидатов по вакансии подключается на следующем шаге интеграции.
                </div>
            )}
        </div>
    );
}
