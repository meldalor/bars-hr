import "./vacancies.css";
import "./vacancy_assessment.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { LANGUAGES, TAG_COLORS } from "../../mocks/vacancies.js";
import { fetchVacancy, setCompetencies } from "../../api/vacancies.js";
import { fetchSkills } from "../../api/skills.js";
import Modal from "../../components/ui/Modal/Modal.jsx";

// матрица собирается из пула навыков бэка; типы — Hard/Soft/CultureFit
const GROUPS = [
    { type: "Hard", title: "A. Hard Skills (технические навыки)" },
    { type: "Soft", title: "B. Soft Skills (личностные качества)" },
    { type: "CultureFit", title: "C. Culture Fit (соответствие команде)" },
];

export default function VacancyAssessment() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [vacancy, setVacancy] = useState(null);
    const [skills, setSkills] = useState([]);
    const [selected, setSelected] = useState({}); // skillId -> maxScore
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [confirmSave, setConfirmSave] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([fetchVacancy(id), fetchSkills()])
            .then(([loadedVacancy, pool]) => {
                if (cancelled) {
                    return;
                }
                setVacancy(loadedVacancy);
                setSkills(pool);
                const preset = {};
                (loadedVacancy.competencies || []).forEach((competency) => {
                    preset[competency.skillId] = competency.maxScore;
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

    const skillsByType = useMemo(() => {
        const map = { Hard: [], Soft: [], CultureFit: [] };
        skills.forEach((skill) => {
            if (map[skill.type]) {
                map[skill.type].push(skill);
            }
        });
        return map;
    }, [skills]);

    const backToVacancy = () =>
        navigate(`/app/vacancies/${id}`, { state: { tab: "description" } });

    const toggleSkill = (skillId) => {
        setSelected((prev) => {
            const next = { ...prev };
            if (skillId in next) {
                delete next[skillId];
            } else {
                next[skillId] = 5;
            }
            return next;
        });
    };

    const changeScore = (skillId, value) => {
        const score = Math.max(1, Math.min(100, Number(value) || 1));
        setSelected((prev) => ({ ...prev, [skillId]: score }));
    };

    const doSave = async () => {
        const items = Object.entries(selected).map(([skillId, maxScore]) => ({
            skillId: Number(skillId),
            maxScore,
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

                    <div className="va-card">
                        {GROUPS.map((group) => (
                            <div className="va-group" key={group.type}>
                                <h4 className="va-group-title">{group.title}</h4>

                                {skillsByType[group.type].length === 0 ? (
                                    <div className="va-skill-desc">
                                        В пуле нет навыков этой категории
                                    </div>
                                ) : (
                                    skillsByType[group.type].map((skill) => {
                                        const active = skill.id in selected;
                                        return (
                                            <label className="va-skill" key={skill.id}>
                                                <div className="va-skill-body">
                                                    <input
                                                        type="checkbox"
                                                        checked={active}
                                                        onChange={() => toggleSkill(skill.id)}
                                                    />
                                                    <span className="va-skill-name">{skill.name}</span>
                                                </div>
                                                {active && (
                                                    <span className="va-skill-score">
                                                        Макс. балл:
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={100}
                                                            className="va-input va-score-input"
                                                            value={selected[skill.id]}
                                                            onChange={(event) =>
                                                                changeScore(skill.id, event.target.value)
                                                            }
                                                        />
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        ))}

                        {saveError && <div className="va-error-note">{saveError}</div>}
                    </div>

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
