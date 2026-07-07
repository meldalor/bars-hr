import "./vacancies.css";
import { useNavigate } from "react-router-dom";

export default function VacancyCreate() {
    const navigate = useNavigate();

    return (
        <div className="vacancies">
            <button
                type="button"
                className="vac-back"
                onClick={() => navigate("/app/vacancies")}
            >
                ← Назад к вакансиям
            </button>

            <h1 className="vac-detail-title">Создание новой вакансии</h1>

            <div className="vac-placeholder">
                Форма создания вакансии — в разработке
            </div>
        </div>
    );
}
