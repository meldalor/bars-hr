import "./vacancies.css";
import "./vacancy_assessment.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { LANGUAGES, TAG_COLORS } from "../../mocks/vacancies.js";
import { fetchVacancy, setCompetencies } from "../../api/vacancies.js";
import CompetencyMatrix from "./CompetencyMatrix.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";

export default function VacancyAssessment() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [vacancy, setVacancy] = useState(null);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [confirmSave, setConfirmSave] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchVacancy(id)
            .then((loadedVacancy) => {
                if (cancelled) {
                    return;
                }
                setVacancy(loadedVacancy);
                const preset = {};
                (loadedVacancy.competencies || []).forEach((competency) => {
                    preset[competency.skillId] = 5;
                });
                setSelected(preset);
                setLoadError("");
            })
            .catch((error) => {
                if (!cancelled) {
                    setLoadError(error.message || "Не удалось загрузить данные");
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

    const backToVacancy = () =>
        navigate(`/app/vacancies/${id}`, { state: { tab: "description" } });

    const doSave = async () => {
        const items = Object.keys(selected).map((skillId) => ({
            skillId: Number(skillId),
            maxScore: 5,
        }));

        setSaving(true);
        setSaveError("");

        try {
            await setCompetencies(id, items);
            setConfirmSave(false);
            navigate(`/app/vacancies/${id}`, { state: { tab: "description" } });
        } catch (error) {
            setConfirmSave(false);
            setSaveError(error.message || "Не удалось сохранить матрицу");
            setSaving(false);
        }
    };

    const lang = vacancy ? LANGUAGES[vacancy.lang] : null;

    return (
        <div className="vacancies">
            <button type="button" className="vac-back" onClick={backToVacancy}>
                ← Вернуться назад
            </button>

            {loading || !vacancy ? (
                <h1 className="vac-detail-title">
                    {loading ? "Загрузка…" : loadError || "Вакансия не найдена"}
                </h1>
            ) : (
                <>
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

                    <h2 className="va-subtitle">Матрица компетенций</h2>

                    <CompetencyMatrix value={selected} onChange={setSelected} />

                    {saveError && <div className="va-error-note">{saveError}</div>}

                    <div className="va-footer va-footer-end">
                        <button type="button" className="va-btn danger" onClick={backToVacancy}>
                            Отменить
                        </button>
                        <button
                            type="button"
                            className="va-btn primary"
                            onClick={() => setConfirmSave(true)}
                        >
                            Сохранить
                        </button>
                    </div>
                </>
            )}

            <Modal open={confirmSave} onClose={() => setConfirmSave(false)}>
                <p className="va-modal-title">Сохранить матрицу компетенций?</p>
                <div className="va-modal-actions">
                    <button
                        type="button"
                        className="va-btn ghost"
                        onClick={() => setConfirmSave(false)}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        className="va-btn primary"
                        onClick={doSave}
                        disabled={saving}
                    >
                        {saving ? "Сохранение…" : "Сохранить"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
