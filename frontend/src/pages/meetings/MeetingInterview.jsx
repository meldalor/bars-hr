import "../vacancies/vacancies.css";
import "./interview.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchInterview, saveEvaluations, makeDecision, cancelInterview } from "../../api/interviews.js";
import { updateApplicationStatus } from "../../api/applications.js";
import { fetchVacancy } from "../../api/vacancies.js";
import { downloadInterviewProtocol, downloadCandidateCard } from "../../api/documents.js";
import { formatDateTime } from "../../api/format.js";
import { getSession } from "../../auth/session.js";
import { IconCalendar } from "../vacancies/icons.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";

const GROUPS = [
    { type: "Hard", title: "A. Hard Skills (технические навыки)" },
    { type: "Soft", title: "B. Soft Skills (личностные качества)" },
    { type: "CultureFit", title: "C. Culture Fit (соответствие команде)" },
];

const DECISION_LABELS = { Accepted: "Принят", Rejected: "Отклонён" };

function initials(name) {
    return (name || "")
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0] || "")
        .join("")
        .toUpperCase();
}

export default function MeetingInterview() {
    const navigate = useNavigate();
    const { id } = useParams();
    const session = getSession();
    const canDecide = session?.role === "DecisionMaker" || session?.role === "Admin";

    const [interview, setInterview] = useState(null);
    const [competencies, setCompetencies] = useState([]);
    const [scores, setScores] = useState({}); // competencyId -> { score, comment }
    const [generalNotes, setGeneralNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");
    const [decisionComment, setDecisionComment] = useState("");
    const [decisionError, setDecisionError] = useState("");
    const [confirm, setConfirm] = useState(null); // "Accepted" | "Rejected" | null
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [approvalSent, setApprovalSent] = useState(false);
    const [approvalError, setApprovalError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const loadedInterview = await fetchInterview(id);
                const vacancy = await fetchVacancy(loadedInterview.vacancyId);
                if (cancelled) {
                    return;
                }
                setInterview(loadedInterview);
                setCompetencies(vacancy.competencies || []);
                const preset = {};
                (loadedInterview.evaluations || []).forEach((evaluation) => {
                    preset[evaluation.competencyId] = {
                        score: String(evaluation.score),
                        comment: evaluation.comment ?? "",
                    };
                });
                setScores(preset);
                setGeneralNotes(loadedInterview.generalNotes || "");
                setLoadError("");
            } catch (error) {
                if (!cancelled) {
                    setLoadError(error.message || "Не удалось загрузить встречу");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const grouped = useMemo(() => {
        const map = { Hard: [], Soft: [], CultureFit: [] };
        competencies.forEach((competency) => {
            if (map[competency.skillType]) {
                map[competency.skillType].push(competency);
            }
        });
        return map;
    }, [competencies]);

    const setScore = (competencyId, maxScore, value) => {
        const raw = value === "" ? "" : String(Math.max(0, Math.min(maxScore, Number(value) || 0)));
        setScores((prev) => ({
            ...prev,
            [competencyId]: { score: raw, comment: prev[competencyId]?.comment ?? "" },
        }));
    };

    const setComment = (competencyId, comment) => {
        setScores((prev) => ({
            ...prev,
            [competencyId]: { score: prev[competencyId]?.score ?? "", comment },
        }));
    };

    const handleSave = async () => {
        const evaluations = Object.entries(scores)
            .map(([competencyId, value]) => ({
                competencyId: Number(competencyId),
                score: Number(value.score),
                comment: value.comment || null,
            }))
            .filter((item) => item.score >= 1);

        setSaving(true);
        setSaveError("");
        setSaveMessage("");
        try {
            const updated = await saveEvaluations(id, { evaluations, generalNotes });
            setInterview(updated);
            setSaveMessage("Оценки сохранены");
        } catch (error) {
            setSaveError(error.message || "Не удалось сохранить оценки");
        } finally {
            setSaving(false);
        }
    };

    const handleDecision = async () => {
        const decisionType = confirm;
        setConfirm(null);
        setDecisionError("");
        try {
            await makeDecision(id, { decisionType, comment: decisionComment });
            const refreshed = await fetchInterview(id);
            setInterview(refreshed);
        } catch (error) {
            setDecisionError(error.message || "Не удалось сохранить решение");
        }
    };

    // HR провёл собеседование → отклик уходит в статус «В ожидании» решения
    const handleSendForApproval = async () => {
        setApprovalError("");
        try {
            await updateApplicationStatus(interview.applicationId, { status: "Pending" });
            setApprovalSent(true);
        } catch (error) {
            setApprovalError(error.message || "Не удалось отправить на согласование");
        }
    };

    const handleCancelMeeting = async () => {
        setConfirmCancel(false);
        setCancelError("");
        try {
            await cancelInterview(id);
            navigate("/app/meetings");
        } catch (error) {
            setCancelError(error.message || "Не удалось отменить встречу");
        }
    };

    if (loading || !interview) {
        return (
            <div className="interview">
                <button type="button" className="vac-back" onClick={() => navigate("/app/meetings")}>
                    ← Вернуться назад
                </button>
                <h1 className="vac-detail-title">
                    {loading ? "Загрузка…" : loadError || "Встреча не найдена"}
                </h1>
            </div>
        );
    }

    const decision = interview.decision;

    return (
        <div className="interview">
            <button type="button" className="vac-back" onClick={() => navigate("/app/meetings")}>
                ← Вернуться назад
            </button>

            <div className="iv-subtitle">Оценка кандидата по интервью</div>
            <h1 className="vac-detail-title">{interview.vacancyTitle}</h1>

            <div className="iv-candidate">
                <div className="iv-cand-head">
                    <div className="iv-cand-avatar">{initials(interview.candidateName)}</div>
                    <div>
                        <div className="iv-cand-name">{interview.candidateName}</div>
                        <div className="iv-cand-role">
                            {interview.interviewerName ? `Интервьюер: ${interview.interviewerName}` : ""}
                        </div>
                    </div>
                </div>

                <div className="iv-cand-actions">
                    <span className="iv-slot-badge">
                        <IconCalendar size={16} />
                        {formatDateTime(interview.scheduledAt)}
                    </span>
                    <button
                        type="button"
                        className="iv-btn ghost"
                        onClick={() =>
                            navigate(
                                interview.candidateId
                                    ? `/app/candidates/${interview.candidateId}`
                                    : "/app/candidates"
                            )
                        }
                    >
                        Профиль кандидата
                    </button>
                    <button
                        type="button"
                        className="iv-btn primary"
                        onClick={() => downloadInterviewProtocol(id).catch(() => {})}
                    >
                        Скачать протокол
                    </button>
                    <button
                        type="button"
                        className="iv-btn ghost"
                        onClick={() =>
                            downloadCandidateCard(interview.candidateId).catch(() => {})
                        }
                    >
                        Скачать резюме кандидата
                    </button>
                    <button
                        type="button"
                        className="iv-btn primary"
                        onClick={() =>
                            navigate("/app/meetings", {
                                state: { reschedule: { meetingId: interview.id } },
                            })
                        }
                    >
                        Изменить время
                    </button>
                    {!decision && (
                        <button
                            type="button"
                            className="iv-btn danger"
                            onClick={() => setConfirmCancel(true)}
                        >
                            Отменить встречу
                        </button>
                    )}
                </div>
                {cancelError && <div className="schedule-error">{cancelError}</div>}
            </div>

            {interview.plan && (
                <div className="iv-card">
                    <h3 className="iv-step-title">План собеседования</h3>
                    <p style={{ whiteSpace: "pre-line" }}>{interview.plan}</p>
                </div>
            )}

            {interview.defaultQuestions.length > 0 && (
                <div className="iv-card">
                    <h3 className="iv-step-title">Обязательные вопросы</h3>
                    <ol>
                        {interview.defaultQuestions.map((question, index) => (
                            <li key={index} style={{ marginBottom: 6 }}>{question}</li>
                        ))}
                    </ol>
                </div>
            )}

            <div className="iv-card">
                <h3 className="iv-step-title">Матрица компетенций</h3>

                {competencies.length === 0 ? (
                    <p className="cp-muted">У вакансии не настроена матрица компетенций.</p>
                ) : (
                    GROUPS.map((group) =>
                        grouped[group.type].length === 0 ? null : (
                            <div className="iv-mgroup" key={group.type}>
                                <h4 className="iv-mgroup-title">{group.title}</h4>
                                <table className="iv-table">
                                    <thead>
                                        <tr>
                                            <th>Компетенция</th>
                                            <th className="iv-th-score">Балл</th>
                                            <th>Комментарий</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grouped[group.type].map((competency) => (
                                            <tr key={competency.id}>
                                                <td>
                                                    <div className="iv-comp-name">{competency.skillName}</div>
                                                    <div className="iv-comp-desc">
                                                        макс. {competency.maxScore}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="iv-stars" role="radiogroup">
                                                        {Array.from(
                                                            { length: competency.maxScore },
                                                            (_, i) => i + 1
                                                        ).map((value) => {
                                                            const current =
                                                                Number(scores[competency.id]?.score) || 0;
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={value}
                                                                    className={`iv-star${
                                                                        value <= current ? " active" : ""
                                                                    }`}
                                                                    aria-label={`Оценка ${value}`}
                                                                    onClick={() =>
                                                                        setScore(
                                                                            competency.id,
                                                                            competency.maxScore,
                                                                            value === current ? "" : value
                                                                        )
                                                                    }
                                                                >
                                                                    ★
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <textarea
                                                        className="iv-comp-comment"
                                                        rows={3}
                                                        placeholder="Написать..."
                                                        value={scores[competency.id]?.comment ?? ""}
                                                        onChange={(event) =>
                                                            setComment(competency.id, event.target.value)
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )
                )}

                <div className="iv-field-label">Общий комментарий</div>
                <div className="iv-textarea-wrap">
                    <textarea
                        className="iv-textarea"
                        maxLength={2000}
                        placeholder="Общее впечатление о кандидате..."
                        value={generalNotes}
                        onChange={(event) => setGeneralNotes(event.target.value)}
                    />
                    <span className="iv-counter">{generalNotes.length}/2000</span>
                </div>

                {saveError && <div className="schedule-error">{saveError}</div>}
                {saveMessage && <div className="iv-save-ok">{saveMessage}</div>}

                <div className="iv-footer iv-footer-end">
                    <button type="button" className="iv-btn primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Сохранение…" : "Сохранить оценки"}
                    </button>
                </div>
            </div>

            <div className="iv-card">
                <h3 className="iv-step-title">Итоговое решение</h3>

                {decision ? (
                    <div>
                        <p>
                            Решение: <b>{DECISION_LABELS[decision.decisionType] ?? decision.decisionType}</b>
                            {decision.madeByName ? ` — ${decision.madeByName}` : ""}
                        </p>
                        {decision.comment && <p>Комментарий: {decision.comment}</p>}
                    </div>
                ) : canDecide ? (
                    <>
                        <div className="iv-field-label">Комментарий к решению</div>
                        <div className="iv-textarea-wrap">
                            <textarea
                                className="iv-textarea"
                                maxLength={2000}
                                placeholder="Обоснование решения..."
                                value={decisionComment}
                                onChange={(event) => setDecisionComment(event.target.value)}
                            />
                        </div>
                        {decisionError && <div className="schedule-error">{decisionError}</div>}
                        <div className="iv-footer iv-footer-end">
                            <button type="button" className="iv-btn danger" onClick={() => setConfirm("Rejected")}>
                                Отклонить
                            </button>
                            <button type="button" className="iv-btn primary" onClick={() => setConfirm("Accepted")}>
                                Принять
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="cp-muted">Итоговое решение выносит руководитель направления.</p>
                        {approvalError && <div className="schedule-error">{approvalError}</div>}
                        {approvalSent && <div className="iv-save-ok">Кандидат отправлен на согласование</div>}
                        <div className="iv-footer iv-footer-end">
                            <button
                                type="button"
                                className="iv-btn primary"
                                onClick={handleSendForApproval}
                                disabled={approvalSent}
                            >
                                Отправить на согласование
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Modal open={confirm !== null} onClose={() => setConfirm(null)}>
                <p className="iv-modal-title">
                    {confirm === "Accepted" ? "Принять кандидата?" : "Отклонить кандидата?"}
                </p>
                <div className="iv-modal-actions">
                    <button type="button" className="iv-btn ghost" onClick={() => setConfirm(null)}>
                        Отмена
                    </button>
                    <button
                        type="button"
                        className={confirm === "Accepted" ? "iv-btn primary" : "iv-btn danger"}
                        onClick={handleDecision}
                    >
                        {confirm === "Accepted" ? "Принять" : "Отклонить"}
                    </button>
                </div>
            </Modal>

            <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)}>
                <p className="iv-modal-title">Отменить встречу с {interview.candidateName}?</p>
                <div className="iv-modal-actions">
                    <button type="button" className="iv-btn ghost" onClick={() => setConfirmCancel(false)}>
                        Нет
                    </button>
                    <button type="button" className="iv-btn danger" onClick={handleCancelMeeting}>
                        Отменить встречу
                    </button>
                </div>
            </Modal>
        </div>
    );
}
