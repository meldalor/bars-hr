import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateProfile.css";

import { STATUSES } from "../../mocks/candidates.js";
import { fetchCandidate, archiveCandidate } from "../../api/candidates.js";
import { fetchApplications } from "../../api/applications.js";
import { apiGet } from "../../api/client.js";
import { formatDateTime } from "../../api/format.js";
import {
  downloadCandidateCard,
  downloadRejection,
  downloadInvitation,
  downloadOffer,
} from "../../api/documents.js";
import Modal from "../../components/ui/Modal/Modal.jsx";
import { IconArrowUpRight } from "../vacancies/icons.jsx";

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function ContactRow({ icon, children }) {
  return (
    <div className="cp-contact-row">
      <span className="cp-contact-icon">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
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
      .then(([loadedCandidate, loadedApplications, loadedInterviews]) => {
        if (cancelled) {
          return;
        }
        setCandidate(loadedCandidate);
        setApplications(loadedApplications);
        setInterviews(loadedInterviews);
        setLoadError("");
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

  const educationLines = useMemo(
    () => (candidate?.education ? candidate.education.split("\n").filter(Boolean) : []),
    [candidate]
  );
  const experienceLines = useMemo(
    () => (candidate?.previousWork ? candidate.previousWork.split("\n").filter(Boolean) : []),
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
              </div>
            </div>

            <div className="cp-hero-actions">
              <button
                type="button"
                className="cp-soft-btn"
                onClick={() => runDownload(() => downloadCandidateCard(candidate.id))}
              >
                Скачать карточку
              </button>
              <button
                type="button"
                className="cp-soft-btn"
                onClick={() => setConfirmArchive(true)}
              >
                В архив
              </button>
              <button
                type="button"
                className="cp-primary-btn"
                onClick={() => navigate(`/app/candidates/edit/${candidate.id}`)}
              >
                Изменить
              </button>
            </div>
            {docError && <div className="cp-doc-error">{docError}</div>}

            <div className="cp-contacts">
              {candidate.city && <ContactRow icon="⌖">{candidate.city}</ContactRow>}
              {candidate.phone && <ContactRow icon="☎">{candidate.phone}</ContactRow>}
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
            <h2>Образование</h2>
            {educationLines.length === 0 ? (
              <p className="cp-muted">Образование не заполнено</p>
            ) : (
              educationLines.map((line, index) => (
                <div className="cp-timeline-row" key={index}>
                  <div className="cp-row-title">{line}</div>
                </div>
              ))
            )}
          </section>

          <section className="cp-card">
            <h2>Опыт работы</h2>
            {experienceLines.length === 0 ? (
              <p className="cp-muted">Опыт работы не заполнен</p>
            ) : (
              experienceLines.map((line, index) => (
                <div className="cp-work-row" key={index}>
                  <div className="cp-row-title">{line}</div>
                </div>
              ))
            )}
          </section>
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
