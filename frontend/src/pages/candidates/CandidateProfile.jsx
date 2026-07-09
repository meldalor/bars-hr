import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateProfile.css";

import { STATUSES } from "../../mocks/candidates.js";
import { fetchCandidate, archiveCandidate } from "../../api/candidates.js";
import { fetchApplications } from "../../api/applications.js";
import { fetchInterview } from "../../api/interviews.js";
import { apiGet } from "../../api/client.js";
import { formatDateTime } from "../../api/format.js";
import {
  downloadCandidateCard,
  downloadRejection,
  downloadInvitation,
  downloadOffer,
} from "../../api/documents.js";
import { calculateTotalExperience } from "../../utils/experience.js";
import Modal from "../../components/ui/Modal/Modal.jsx";
import { IconArrowUpRight } from "../vacancies/icons.jsx";

import locationIcon from "../../assets/candidate/location.svg";
import phoneIcon from "../../assets/candidate/phone.svg";
import telegramIcon from "../../assets/candidate/telegram.svg";
import editIcon from "../../assets/candidate/edit.svg";
import archiveIcon from "../../assets/candidate/archive.svg";
import educationIcon from "../../assets/candidate/education.svg";
import workIcon from "../../assets/candidate/work.svg";

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function ContactRow({ icon, alt, children }) {
  return (
    <div className="cp-contact-row">
      <img className="cp-contact-icon" src={icon} alt={alt} />
      <span>{children}</span>
    </div>
  );
}

// строка периода: длинное тире между датами, если заполнены обе
function periodLabel(start, end) {
  return [start, end].filter(Boolean).join(" — ");
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [docError, setDocError] = useState("");

  const runDownload = async (task) => {
    setDocError("");
    try {
      await task();
    } catch (error) {
      setDocError(error.message || "Не удалось скачать документ");
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchCandidate(id),
      fetchApplications({ candidateId: id }),
      apiGet(`/interviews?candidateId=${id}`),
    ])
      .then(async ([loadedCandidate, loadedApplications, loadedInterviews]) => {
        if (cancelled) {
          return;
        }
        setCandidate(loadedCandidate);
        setApplications(loadedApplications);
        setInterviews(loadedInterviews);
        setLoadError("");

        // оценки и комментарии HR лежат в деталях интервью — тянем их отдельно
        const details = await Promise.all(
          loadedInterviews.map((item) => fetchInterview(item.id).catch(() => null))
        );
        if (!cancelled) {
          setReviews(
            details.filter(
              (item) =>
                item && (item.generalNotes || item.decision?.comment || item.overallScore != null)
            )
          );
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message || "Не удалось загрузить кандидата");
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

  const nearestInterview = useMemo(() => {
    if (interviews.length === 0) {
      return null;
    }
    const now = Date.now();
    const upcoming = interviews
      .filter((item) => new Date(item.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    return upcoming[0] || interviews[0];
  }, [interviews]);

  const totalExperience = useMemo(
    () => calculateTotalExperience(candidate?.experience || []),
    [candidate]
  );

  const archiveCandidateAndLeave = async () => {
    await archiveCandidate(id);
    setConfirmArchive(false);
    navigate("/app/candidates");
  };

  if (loading || !candidate) {
    return (
      <div className="candidate-profile-page">
        <button type="button" className="cp-back" onClick={() => navigate("/app/candidates")}>
          ← Вернуться назад
        </button>
        <h1 className="cp-not-found">
          {loading ? "Загрузка…" : loadError || "Кандидат не найден"}
        </h1>
      </div>
    );
  }

  return (
    <div className="candidate-profile-page">
      <button type="button" className="cp-back" onClick={() => navigate("/app/candidates")}>
        ← Вернуться назад
      </button>

      <div className="cp-layout">
        <div className="cp-main-column">
          <section className="cp-card cp-hero-card">
            <div className="cp-hero-left">
              <span className="cp-avatar">{initials(candidate.fullName)}</span>
              <div>
                <h1>{candidate.fullName}</h1>
                {candidate.specialty && <div className="cp-specialty">{candidate.specialty}</div>}
              </div>
            </div>

            <div className="cp-hero-actions">
              <button
                type="button"
                className="cp-soft-btn"
                onClick={() => runDownload(() => downloadCandidateCard(candidate.id))}
              >
                Скачать резюме кандидата
              </button>
              <button
                type="button"
                className="cp-soft-btn"
                onClick={() => setConfirmArchive(true)}
              >
                <img className="cp-btn-icon" src={archiveIcon} alt="" />
                В архив
              </button>
              <button
                type="button"
                className="cp-primary-btn"
                onClick={() => navigate(`/app/candidates/edit/${candidate.id}`)}
              >
                <img className="cp-btn-icon" src={editIcon} alt="" />
                Изменить
              </button>
            </div>
            {docError && <div className="cp-doc-error">{docError}</div>}

            <div className="cp-contacts">
              {candidate.city && <ContactRow icon={locationIcon} alt="Город">{candidate.city}</ContactRow>}
              {candidate.phone && <ContactRow icon={phoneIcon} alt="Телефон">{candidate.phone}</ContactRow>}
              {candidate.telegram && <ContactRow icon={telegramIcon} alt="Телеграм">{candidate.telegram}</ContactRow>}
            </div>
          </section>

          <section className="cp-card cp-skills-card">
            <h2>Навыки</h2>
            <div className="cp-skills-list">
              {candidate.skills.length === 0 ? (
                <p className="cp-muted">Навыки не указаны</p>
              ) : (
                candidate.skills.map((skill) => (
                  <span key={skill} className="cp-skill">
                    {skill}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="cp-card">
            <h2 className="cp-section-title">
              <img className="cp-section-icon" src={educationIcon} alt="" />
              Образование
            </h2>
            {candidate.education.length === 0 ? (
              <p className="cp-muted">Образование не заполнено</p>
            ) : (
              candidate.education.map((edu) => (
                <div className="cp-timeline-row" key={edu.id}>
                  <div className="cp-row-main">
                    <div className="cp-row-title">
                      {[edu.level, edu.institution].filter(Boolean).join(", ") || "—"}
                    </div>
                    {edu.faculty && <div className="cp-row-sub">{edu.faculty}</div>}
                  </div>
                  {periodLabel(edu.start, edu.end) && (
                    <div className="cp-row-period">{periodLabel(edu.start, edu.end)}</div>
                  )}
                </div>
              ))
            )}
          </section>

          <section className="cp-card">
            <h2 className="cp-section-title">
              <img className="cp-section-icon" src={workIcon} alt="" />
              Опыт работы
              {totalExperience !== "Опыт не указан" && (
                <span className="cp-exp-total">Общий стаж: {totalExperience}</span>
              )}
            </h2>
            {candidate.experience.length === 0 ? (
              <p className="cp-muted">Опыт работы не заполнен</p>
            ) : (
              candidate.experience.map((exp) => (
                <div className="cp-timeline-row" key={exp.id}>
                  <div className="cp-row-main">
                    <div className="cp-row-title">
                      {[exp.company, exp.position].filter(Boolean).join(" — ") || "—"}
                    </div>
                    {exp.info && <div className="cp-row-sub">{exp.info}</div>}
                  </div>
                  {periodLabel(exp.start, exp.end) && (
                    <div className="cp-row-period">{periodLabel(exp.start, exp.end)}</div>
                  )}
                </div>
              ))
            )}
          </section>

          {candidate.additionalInfo && (
            <section className="cp-card">
              <h2>Дополнительная информация</h2>
              <p className="cp-additional-info">{candidate.additionalInfo}</p>
            </section>
          )}

          {reviews.length > 0 && (
            <section className="cp-card">
              <h2>Оценки и комментарии</h2>
              {reviews.map((review) => (
                <article className="cp-review" key={review.id}>
                  <div className="cp-review-head">
                    <span className="cp-review-author">{review.interviewerName || "HR-менеджер"}</span>
                    {review.overallScore != null && (
                      <span className="cp-review-score">{review.overallScore}</span>
                    )}
                  </div>
                  <div className="cp-review-meta">
                    {review.vacancyTitle} · {formatDateTime(review.scheduledAt)}
                  </div>
                  {review.generalNotes && <p className="cp-review-text">{review.generalNotes}</p>}
                  {review.decision?.comment && (
                    <p className="cp-review-text cp-review-decision">
                      Решение: {review.decision.comment}
                    </p>
                  )}
                </article>
              ))}
            </section>
          )}
        </div>

        <aside className="cp-side-column">
          {nearestInterview ? (
            <section className="cp-side-card cp-interview-card">
              <h2>{nearestInterview.vacancyTitle}</h2>
              <div className="cp-interview-date">{formatDateTime(nearestInterview.scheduledAt)}</div>
              <div className="cp-interview-actions">
                <button
                  type="button"
                  className="cp-primary-btn"
                  onClick={() => navigate(`/app/meetings/${nearestInterview.id}`)}
                >
                  Перейти
                </button>
              </div>
            </section>
          ) : (
            <section className="cp-side-card cp-empty-interview-card">
              <h2>Интервью не назначено</h2>
              <p>У кандидата нет запланированных встреч. Назначьте интервью из карточки вакансии или раздела встреч.</p>
              <button type="button" className="cp-primary-btn" onClick={() => navigate("/app/meetings")}>
                Назначить
              </button>
            </section>
          )}

          <section className="cp-side-card">
            <h2>Участвует в вакансиях</h2>
            <div className="cp-vacancy-list">
              {applications.length === 0 ? (
                <p className="cp-muted">Кандидат ещё не откликался на вакансии</p>
              ) : (
                applications.map((application) => {
                  const status = STATUSES[application.statusKey];
                  return (
                    <article className="cp-vacancy-card" key={application.id}>
                      <div className="cp-vacancy-head">
                        <h3>{application.vacancyTitle}</h3>
                        <button
                          type="button"
                          className="cp-vacancy-link"
                          aria-label="Открыть вакансию"
                          onClick={() => navigate(`/app/vacancies/${application.vacancyId}`)}
                        >
                          <IconArrowUpRight size={22} />
                        </button>
                      </div>
                      <div className="cp-vacancy-status-row">
                        <span
                          className="cp-status-pill"
                          style={{ color: status.color, backgroundColor: status.bg }}
                        >
                          {status.label}
                        </span>
                        <span className="cp-active-vacancy">Отклик от {application.appliedAt}</span>
                      </div>
                      <div className="cp-doc-buttons">
                        <button
                          type="button"
                          className="cp-doc-btn"
                          onClick={() => runDownload(() => downloadInvitation(application.id))}
                        >
                          Приглашение
                        </button>
                        <button
                          type="button"
                          className="cp-doc-btn"
                          onClick={() => runDownload(() => downloadOffer(application.id))}
                        >
                          Оффер
                        </button>
                        <button
                          type="button"
                          className="cp-doc-btn"
                          onClick={() => runDownload(() => downloadRejection(application.id))}
                        >
                          Отказ
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </aside>
      </div>

      <Modal open={confirmArchive} onClose={() => setConfirmArchive(false)}>
        <p className="cp-modal-title">Перенести кандидата {candidate.fullName} в архив?</p>
        <div className="cp-modal-actions">
          <button
            type="button"
            className="cp-ghost-btn"
            onClick={() => setConfirmArchive(false)}
          >
            Отмена
          </button>
          <button type="button" className="cp-danger-btn" onClick={archiveCandidateAndLeave}>
            В архив
          </button>
        </div>
      </Modal>
    </div>
  );
}
