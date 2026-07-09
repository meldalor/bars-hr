import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateProfile.css";

import { getCandidateById, STATUSES } from "../../mocks/candidates.js";
import { getVacancyById, LANGUAGES, TAG_COLORS, formatSalary } from "../../mocks/vacancies.js";
import ActivityTable from "../overview/components/ActivityTable/ActivityTable.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";
import {
  IconArrowUpRight,
  IconUsers,
  IconRuble,
  IconCalendar,
  IconEdit,
  IconPrinter,
} from "../vacancies/icons.jsx";

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
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

function VacancyCard({ vacancy, candidate }) {
  const navigate = useNavigate();

  if (!vacancy) {
    return null;
  }

  const lang = LANGUAGES[vacancy.lang];
  const status = STATUSES[candidate.status];
  const isFinal = candidate.status === "accepted" || candidate.status === "rejected";

  return (
    <article className="cp-vacancy-card">
      <div className="cp-vacancy-head">
        <div
          className="cp-vacancy-icon"
          style={{ backgroundColor: lang?.color || "#16a34a", color: lang?.text || "#fff" }}
        >
          {lang?.code || "HR"}
        </div>
        <h3>{vacancy.title}</h3>
        <button
          type="button"
          className="cp-vacancy-link"
          aria-label="Открыть вакансию"
          onClick={() => navigate(`/app/vacancies/${vacancy.id}`)}
        >
          <IconArrowUpRight size={22} />
        </button>
      </div>

      <div className="cp-vacancy-tags">
        {vacancy.requirements.slice(0, 1).map((requirement) => (
          <span
            key={requirement}
            className="cp-vacancy-tag"
            style={{ backgroundColor: lang?.color || "#565b66", color: lang?.text || "#fff" }}
          >
            {requirement}
          </span>
        ))}
        <span className="cp-vacancy-tag" style={{ backgroundColor: TAG_COLORS.experience }}>
          {vacancy.experience}
        </span>
        <span className="cp-vacancy-tag" style={{ backgroundColor: TAG_COLORS.employment }}>
          {vacancy.employment}
        </span>
        <span className="cp-vacancy-tag" style={{ backgroundColor: TAG_COLORS.city }}>
          {vacancy.city}
        </span>
      </div>

      <div className="cp-vacancy-stats">
        <span>
          <IconUsers size={18} /> {vacancy.candidates} кандидатов
        </span>
        <span>
          <IconRuble size={18} /> {formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}
        </span>
        <span>
          <IconCalendar size={18} /> {vacancy.createdAt}
        </span>
        <span>
          <IconEdit size={18} /> {vacancy.updatedAt}
        </span>
      </div>

      <div className="cp-vacancy-status">
        <div className="cp-vacancy-status-label">Статус кандидата:</div>
        <div className="cp-vacancy-status-row">
          <span className="cp-status-pill" style={{ color: status.color, backgroundColor: status.bg }}>
            {status.label}
          </span>
          {candidate.substatus && (
            <span className="cp-status-pill" style={{ color: status.color, backgroundColor: status.bg }}>
              {candidate.substatus}
            </span>
          )}
          {isFinal && (
            <button type="button" className="cp-print-btn">
              <IconPrinter size={15} />
              Распечатать
            </button>
          )}
        </div>
        <span className="cp-active-vacancy">Вакансия активна</span>
      </div>
    </article>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidate = getCandidateById(id);

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmCancelInterview, setConfirmCancelInterview] = useState(false);
  const [interviewCancelled, setInterviewCancelled] = useState(false);

  const vacancies = useMemo(() => {
    if (!candidate) {
      return [];
    }
    return candidate.vacancyIds.map((vacancyId) => getVacancyById(vacancyId)).filter(Boolean);
  }, [candidate]);

  if (!candidate) {
    return (
      <div className="candidate-profile-page">
        <button type="button" className="cp-back" onClick={() => navigate("/app/candidates")}>
          ← Вернуться назад
        </button>
        <h1 className="cp-not-found">Кандидат не найден</h1>
      </div>
    );
  }

  const hasInterviews = candidate.interviews.length > 0 && !interviewCancelled;
  const nearestInterview = candidate.interviews[0];

  const archiveCandidate = () => {
    setConfirmArchive(false);
    navigate("/app/candidates");
  };

  const cancelInterview = () => {
    setConfirmCancelInterview(false);
    setInterviewCancelled(true);
  };

  return (
    <div className="candidate-profile-page">
      <button type="button" className="cp-back" onClick={() => navigate("/app/candidates")}>
        ← Вернуться назад
      </button>

      <div className="cp-layout">
        <div className="cp-main-column">
          <section className="cp-card cp-hero-card">
            <div className="cp-hero-left">
              <span className="cp-avatar">{initials(candidate.name)}</span>
              <div>
                <h1>{candidate.fullName}</h1>
                <p>{candidate.specialty.replace(" мобильных приложений", "")}</p>
              </div>
            </div>

            <div className="cp-hero-actions">
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

            <div className="cp-contacts">
              <ContactRow icon="⌖">{candidate.city}</ContactRow>
              <ContactRow icon="☎">{candidate.phone}</ContactRow>
              <ContactRow icon="✈">{candidate.telegram}</ContactRow>
            </div>

            <div className="cp-info-block">
              <div className="cp-info-title">Дополнительная информация:</div>
              <p>{candidate.info}</p>
            </div>
          </section>

          <section className="cp-card cp-skills-card">
            <h2>Навыки</h2>
            <div className="cp-skills-list">
              {candidate.skills.map((skill) => (
                <span key={skill} className="cp-skill">
                  {skill}
                </span>
              ))}
              <button type="button" className="cp-add-skill">+ Добавить</button>
            </div>
          </section>

          <section className="cp-card">
            <h2>Образование</h2>
            {candidate.education.length === 0 ? (
              <p className="cp-muted">Образование не заполнено</p>
            ) : (
              candidate.education.map((item) => (
                <div className="cp-timeline-row" key={item.id}>
                  <div>
                    <div className="cp-row-title">{item.institution}</div>
                    <div className="cp-row-subtitle">{item.direction}</div>
                  </div>
                  <span>{item.years}</span>
                </div>
              ))
            )}
          </section>

          <section className="cp-card">
            <h2>Опыт работы</h2>
            {candidate.experience.length === 0 ? (
              <p className="cp-muted">Опыт работы не заполнен</p>
            ) : (
              candidate.experience.map((item) => (
                <div className="cp-work-row" key={item.id}>
                  <div className="cp-timeline-row">
                    <div>
                      <div className="cp-row-title">{item.company}</div>
                      <div className="cp-row-subtitle">{item.position}</div>
                    </div>
                    <span>{item.years}</span>
                  </div>
                  <ul>
                    {item.description.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>

          <section className="cp-card">
            <h2>Оценки и комментарии</h2>
            {candidate.comments.length === 0 ? (
              <p className="cp-muted">Комментариев пока нет</p>
            ) : (
              candidate.comments.map((comment) => (
                <article className="cp-comment" key={comment.id}>
                  <div className="cp-comment-head">
                    <div className="cp-comment-author">
                      <span className="cp-comment-avatar">ПА</span>
                      <div>
                        <strong>{comment.author}</strong>
                        <span>{comment.role}</span>
                      </div>
                    </div>
                    <span>{comment.date}</span>
                  </div>
                  <div>{comment.vacancy}</div>
                  <div>Оценка: {comment.rating}</div>
                  <p>Комментарий: {comment.text}</p>
                </article>
              ))
            )}
          </section>
        </div>

        <aside className="cp-side-column">
          {hasInterviews && (
            <section className="cp-side-card cp-interview-card">
              <h2>{nearestInterview.title}</h2>
              <div className="cp-interview-date">{nearestInterview.date} {nearestInterview.time}</div>
              <div className="cp-interview-actions">
                <button
                  type="button"
                  className="cp-danger-btn"
                  onClick={() => setConfirmCancelInterview(true)}
                >
                  Отменить
                </button>
                <button
                  type="button"
                  className="cp-soft-btn"
                  onClick={() =>
                    navigate("/app/meetings", {
                      state: { reschedule: { meetingId: nearestInterview.id } },
                    })
                  }
                >
                  Изменить
                </button>
                <button
                  type="button"
                  className="cp-primary-btn"
                  onClick={() => navigate("/app/meetings", { state: { meetingId: nearestInterview.id } })}
                >
                  Перейти
                </button>
              </div>
            </section>
          )}

          {!hasInterviews && (
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
              {vacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} candidate={candidate} />
              ))}
            </div>
            <button type="button" className="cp-add-vacancy">Добавить</button>
          </section>
        </aside>
      </div>

      <ActivityTable />

      <Modal open={confirmArchive} onClose={() => setConfirmArchive(false)}>
        <p className="cp-modal-title">Перенести кандидата {candidate.name} в архив?</p>
        <div className="cp-modal-actions">
          <button
            type="button"
            className="cp-ghost-btn"
            onClick={() => setConfirmArchive(false)}
          >
            Отмена
          </button>
          <button type="button" className="cp-danger-btn" onClick={archiveCandidate}>
            В архив
          </button>
        </div>
      </Modal>

      <Modal
        open={confirmCancelInterview}
        onClose={() => setConfirmCancelInterview(false)}
      >
        <p className="cp-modal-title">Отменить назначенное интервью?</p>
        <div className="cp-modal-actions">
          <button
            type="button"
            className="cp-ghost-btn"
            onClick={() => setConfirmCancelInterview(false)}
          >
            Нет
          </button>
          <button type="button" className="cp-danger-btn" onClick={cancelInterview}>
            Отменить
          </button>
        </div>
      </Modal>
    </div>
  );
}
