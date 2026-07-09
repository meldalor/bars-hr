import "./vacancy_assessment.css";
import { useEffect, useMemo, useRef, useState } from "react";

import { fetchSkills, createSkill } from "../../api/skills.js";

const GROUPS = [
    { type: "Hard", title: "A. Hard Skills (технические навыки)" },
    { type: "Soft", title: "B. Soft Skills (личностные качества)" },
    { type: "CultureFit", title: "C. Culture Fit (соответствие команде)" },
];

const DEFAULT_PER_GROUP = 4;

function groupByType(pool) {
    const map = { Hard: [], Soft: [], CultureFit: [] };
    pool.forEach((skill) => {
        if (map[skill.type]) {
            map[skill.type].push(skill);
        }
    });
    return map;
}

function AddCustom({ type, onCreate }) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const confirm = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            return;
        }
        setBusy(true);
        setError("");
        try {
            await onCreate(trimmed, type);
            setName("");
            setAdding(false);
        } catch (createError) {
            setError(createError.message || "Не удалось добавить компетенцию");
        } finally {
            setBusy(false);
        }
    };

    const cancel = () => {
        setName("");
        setError("");
        setAdding(false);
    };

    if (!adding) {
        return (
            <button type="button" className="va-add-btn" onClick={() => setAdding(true)}>
                Добавить свою
            </button>
        );
    }

    return (
        <div className="va-add-form">
            <input
                className="va-add-input"
                placeholder="Название компетенции"
                value={name}
                autoFocus
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        confirm();
                    }
                }}
            />
            <button type="button" className="va-add-confirm" onClick={confirm} disabled={busy}>
                {busy ? "Добавление…" : "Добавить"}
            </button>
            <button type="button" className="va-add-cancel" onClick={cancel}>
                Отмена
            </button>
            {error && <span className="va-error-note">{error}</span>}
        </div>
    );
}

export default function CompetencyMatrix({ value, onChange, defaultFill = false }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const latest = useRef({ value, onChange, defaultFill });
    useEffect(() => {
        latest.current = { value, onChange, defaultFill };
    });

    useEffect(() => {
        let cancelled = false;
        fetchSkills()
            .then((pool) => {
                if (cancelled) {
                    return;
                }
                setSkills(pool);
                setError("");
                const { value: current, onChange: apply, defaultFill: fill } = latest.current;
                if (fill && Object.keys(current).length === 0) {
                    const grouped = groupByType(pool);
                    const preset = {};
                    GROUPS.forEach((group) => {
                        grouped[group.type].slice(0, DEFAULT_PER_GROUP).forEach((skill) => {
                            preset[skill.id] = 5;
                        });
                    });
                    if (Object.keys(preset).length > 0) {
                        apply(preset);
                    }
                }
            })
            .catch((loadError) => {
                if (!cancelled) {
                    setError(loadError.message || "Не удалось загрузить навыки");
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
    }, []);

    const grouped = useMemo(() => groupByType(skills), [skills]);

    const toggle = (skillId) => {
        const next = { ...value };
        if (skillId in next) {
            delete next[skillId];
        } else {
            next[skillId] = 5;
        }
        onChange(next);
    };

    const handleCreate = async (name, type) => {
        const created = await createSkill({ name, type });
        await fetchSkills().then((pool) => setSkills(pool));
        onChange({ ...value, [created.id]: 5 });
    };

    return (
        <div className="va-card">
            {error && <div className="va-error-note">{error}</div>}
            {loading ? (
                <div className="va-skill-desc">Загрузка навыков…</div>
            ) : (
                GROUPS.map((group) => (
                    <div className="va-group" key={group.type}>
                        <h4 className="va-group-title">{group.title}</h4>
                        {grouped[group.type].length === 0 ? (
                            <div className="va-skill-desc">В пуле пока нет навыков этой категории</div>
                        ) : (
                            grouped[group.type].map((skill) => (
                                <label className="va-skill" key={skill.id}>
                                    <div className="va-skill-body va-skill-check">
                                        <input
                                            type="checkbox"
                                            checked={skill.id in value}
                                            onChange={() => toggle(skill.id)}
                                        />
                                        <span className="va-skill-name">{skill.name}</span>
                                    </div>
                                </label>
                            ))
                        )}
                        <AddCustom type={group.type} onCreate={handleCreate} />
                    </div>
                ))
            )}
        </div>
    );
}
