import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import "./meetings.css";
import "./interview.css";

import {
  MEETINGS as MOCK_MEETINGS,
  getMeetingById,
  getMeetingForCandidate,
  saveInterviewSlot,
  updateMeetingTime,
  cancelInterview,
  removeMeeting,
  formatMeetingSlot,
  toMinutes,
  toTime,
  DAY_START,
  DAY_END,
} from "../../mocks/interviews.js";
import { getCandidateById, setCandidateSubstatus } from "../../mocks/candidates.js";
import { getVacancyById } from "../../mocks/vacancies.js";
import { IconCalendar } from "../vacancies/icons.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 мин" },
  { value: 30, label: "30 мин" },
  { value: 60, label: "1 час" },
  { value: 90, label: "1,5 часа" },
  { value: 120, label: "2 часа" },
];

function Meetings() {
  const location = useLocation();
  const navigate = useNavigate();

  const schedule = location.state?.schedule || null;
  const reschedule = location.state?.reschedule || null;

  const candidate = schedule ? getCandidateById(schedule.candidateId) : null;
  const vacancy = schedule ? getVacancyById(schedule.vacancyId) : null;
  const scheduling = Boolean((candidate && vacancy) || reschedule);

  const [meetings, setMeetings] = useState([]);
  const [picking, setPicking] = useState(() => {
    if (reschedule) return true;
    if (!schedule) return false;
    return !getMeetingForCandidate(schedule.candidateId);
  });
  const [scheduleError, setScheduleError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const existing = reschedule
      ? getMeetingById(reschedule.meetingId)
      : schedule
        ? getMeetingForCandidate(schedule.candidateId)
        : null;
    const base = existing ? parseISO(existing.date) : new Date(2026, 6, 6);
    return startOfWeek(base, { weekStartsOn: 1 });
  });
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [selectedMeetingId, setSelectedMeetingId] = useState(location.state?.meetingId || null);
  const calendarBodyRef = useRef(null);

  const HOUR_START = 8;
  const HOUR_END = 19;
  const STEP_MINUTES = 15;
  const ROW_HEIGHT_PX = 20;
  const TIME_COLUMN_WIDTH = 52;
  const SLOTS_PER_HOUR = 60 / STEP_MINUTES;

  useEffect(() => {
    setTimeout(() => {
      setMeetings(MOCK_MEETINGS);
    }, 300);
  }, []);

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  const timeLabels = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    timeLabels.push(`${String(h).padStart(2, "0")}:00`);
  }

  const gridSlots = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    for (let m = 0; m < 60; m += STEP_MINUTES) {
      gridSlots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  useEffect(() => {
    const updateTimeLine = () => {
      const now = new Date();
      const currentHour = getHours(now);
      const currentMinute = getMinutes(now);

      const minutesFromStart = (currentHour - HOUR_START) * 60 + currentMinute;
      const pixelsPerMinute = ROW_HEIGHT_PX / STEP_MINUTES;
      let position = minutesFromStart * pixelsPerMinute;

      const maxPosition = (HOUR_END - HOUR_START) * 60 * pixelsPerMinute;
      if (position > maxPosition) {
        position = maxPosition;
      }

      setCurrentTimePosition(Math.max(0, position));
    };

    updateTimeLine();
    const interval = setInterval(updateTimeLine, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (calendarBodyRef.current && currentTimePosition > 0) {
      calendarBodyRef.current.scrollTop = currentTimePosition - 150;
    }
  }, [currentTimePosition]);

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const getColorStyles = (type) => {
    const colors = {
      green: { bg: "#e8f5e9", text: "#2e7d32", border: "#c8e6c9" },
      blue: { bg: "#e3f2fd", text: "#1565c0", border: "#bbdefb" },
      pink: { bg: "#fce4ec", text: "#c62828", border: "#f8bbd0" },
      orange: { bg: "#fff3e0", text: "#e65100", border: "#ffe0b2" },
      purple: { bg: "#f3e5f5", text: "#6a1b9a", border: "#e1bee7" },
    };
    return colors[type] || colors.blue;
  };

  const handleMeetingClick = (id) => {
    if (picking) return;
    navigate(`/app/meetings/${id}`);
  };

  const currentMeeting = reschedule
    ? getMeetingById(reschedule.meetingId)
    : schedule
      ? getMeetingForCandidate(schedule.candidateId)
      : null;

  const panelName = schedule ? candidate.name : currentMeeting ? currentMeeting.fullName : "";
  const panelRole = schedule ? candidate.specialty : currentMeeting ? currentMeeting.role : "";
  const panelSkills = schedule ? vacancy.requirements : currentMeeting ? currentMeeting.skills : [];
  const panelTitle = reschedule ? "Изменение времени встречи" : "Назначение интервью";

  const applySlot = (date, startTime, durationMinutes) => {
    const result = reschedule
      ? updateMeetingTime(reschedule.meetingId, { date, startTime, durationMinutes })
      : saveInterviewSlot(candidate, vacancy, { date, startTime, durationMinutes });
    if (!result.ok) {
      setScheduleError("Это время пересекается с другой встречей");
      return false;
    }
    if (schedule) {
      setCandidateSubstatus(schedule.candidateId, "Интервью назначено");
    }
    setScheduleError("");
    setMeetings([...MOCK_MEETINGS]);
    return true;
  };

  const handleCellClick = (day, slot) => {
    if (!scheduling || !picking) return;
    const date = format(day, "yyyy-MM-dd");
    const duration = currentMeeting
      ? toMinutes(currentMeeting.endTime) - toMinutes(currentMeeting.startTime)
      : 60;
    if (toMinutes(slot) + duration > DAY_END) {
      setScheduleError("Интервью не помещается в рабочий день");
      return;
    }
    if (applySlot(date, slot, duration)) {
      setPicking(false);
    }
  };

  const shiftStart = (delta) => {
    if (!currentMeeting) return;
    const startMin = toMinutes(currentMeeting.startTime);
    const duration = toMinutes(currentMeeting.endTime) - startMin;
    const next = startMin + delta;
    if (next < DAY_START || next + duration > DAY_END) return;
    applySlot(currentMeeting.date, toTime(next), duration);
  };

  const setDuration = (minutes) => {
    if (!currentMeeting) return;
    const startMin = toMinutes(currentMeeting.startTime);
    if (startMin + minutes > DAY_END) {
      setScheduleError("Интервью не помещается в рабочий день");
      return;
    }
    applySlot(currentMeeting.date, currentMeeting.startTime, minutes);
  };

  const handleCancelMeeting = () => {
    if (reschedule) {
      if (currentMeeting && currentMeeting.candidateId) {
        setCandidateSubstatus(currentMeeting.candidateId, "Интервью не назначено");
      }
      removeMeeting(reschedule.meetingId);
      setMeetings([...MOCK_MEETINGS]);
      navigate("/app/meetings");
      return;
    }
    cancelInterview(schedule.candidateId);
    setCandidateSubstatus(schedule.candidateId, "Интервью не назначено");
    setMeetings([...MOCK_MEETINGS]);
    navigate(`/app/vacancies/${schedule.vacancyId}`);
  };

  const confirmCancelMeeting = () => {
    setConfirmCancel(false);
    handleCancelMeeting();
  };

  const monthLabel = format(currentWeekStart, "LLLL yyyy", { locale: ru });

  const getMeetingStyle = (meeting) => {
    const meetingDate = parseISO(meeting.date);
    const start = parseISO(`${meeting.date}T${meeting.startTime}`);
    const end = parseISO(`${meeting.date}T${meeting.endTime}`);

    const dayIndex = weekDays.findIndex((day) => isSameDay(day, meetingDate));
    if (dayIndex === -1) return null;

    const minutesFromStart = (getHours(start) - HOUR_START) * 60 + getMinutes(start);
    const minutesDuration = (getHours(end) - getHours(start)) * 60 + (getMinutes(end) - getMinutes(start));

    const topPx = minutesFromStart * (ROW_HEIGHT_PX / STEP_MINUTES);
    const heightPx = minutesDuration * (ROW_HEIGHT_PX / STEP_MINUTES);

    const totalWidth = `calc(100% - ${TIME_COLUMN_WIDTH}px)`;
    const columnWidth = `calc(${totalWidth} / 7)`;

    const leftPx = `calc(${TIME_COLUMN_WIDTH}px + ${dayIndex} * (${columnWidth}) + 3px)`;
    const widthPx = `calc(${columnWidth} - 6px)`;

    return {
      top: topPx,
      height: heightPx - 2,
      left: leftPx,
      width: widthPx,
    };
  };

  return (
    <div className="meetings-page">
      <div className="page-title-wrapper">
        <h1 className="page-title">
          <span className="title-main">Встречи:</span>
          <span className="title-sub">&nbsp;назначено {meetings.length} встреч</span>
        </h1>
      </div>

      <div className="meetings-layout-full">
        <div className="calendar-container-full">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="nav-arrow" onClick={handlePrevWeek}>{"<"}</button>
              <span className="month-label" style={{ textTransform: "capitalize" }}>
                {monthLabel}
              </span>
              <button className="nav-arrow" onClick={handleNextWeek}>{">"}</button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="grid-header-row">
              <div className="grid-time-header-cell"></div>
              {weekDays.map((day) => {
                const isTodayFlag = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`grid-header-cell ${isTodayFlag ? "today-header" : ""}`}
                  >
                    {format(day, "EEEE d MMM", { locale: ru })}
                  </div>
                );
              })}
            </div>

            <div className="grid-body-scroll" ref={calendarBodyRef}>
              <div className="grid-body-wrapper">
                <div className="grid-body">
                  {gridSlots.map((slot, index) => (
                    <div
                      key={`row-${index}`}
                      className={(index + 1) % SLOTS_PER_HOUR === 0 ? "grid-row-hour" : ""}
                      style={{ display: "contents" }}
                    >
                      <div className="grid-time-slot">
                        {index % SLOTS_PER_HOUR === 0 ? timeLabels[index / SLOTS_PER_HOUR] : ""}
                      </div>
                      {weekDays.map((day) => (
                        <div
                          key={`${day.toISOString()}-${slot}`}
                          className={`grid-cell${scheduling && picking ? " picking" : ""}`}
                          onClick={() => handleCellClick(day, slot)}
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="meetings-overlay">
                  {meetings.map((meeting) => {
                    const meetingDate = parseISO(meeting.date);

                    const isInWeek = isWithinInterval(meetingDate, {
                      start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }),
                      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
                    });

                    if (!isInWeek) return null;

                    const styles = getColorStyles(meeting.type);
                    const pos = getMeetingStyle(meeting);
                    if (!pos) return null;

                    return (
                      <button
                        type="button"
                        key={meeting.id}
                        className={`meeting-card-absolute ${
                          selectedMeetingId === meeting.id ? "meeting-card-absolute--selected" : ""
                        }`}
                        onClick={() => handleMeetingClick(meeting.id)}
                        style={{
                          top: `${pos.top}px`,
                          left: pos.left,
                          width: pos.width,
                          height: `${pos.height}px`,
                          backgroundColor: styles.bg,
                          borderLeft: `4px solid ${styles.text}`,
                        }}
                      >
                        <div className="meeting-time" style={{ color: styles.text }}>
                          {meeting.startTime} - {meeting.endTime}
                        </div>
                        <div className="meeting-name">{meeting.fullName}</div>
                        <div className="meeting-vacancy">{meeting.vacancy}</div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="current-time-line-absolute"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="current-time-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {scheduling && (
        <div className="schedule-panel">
          <div className="schedule-panel-title">{panelTitle}</div>

          {picking && (
            <div className="schedule-hint">
              Нажмите на нужную ячейку в таблице (шаг — 15 минут). Начало и
              длительность можно изменить ниже.
            </div>
          )}
          {scheduleError && <div className="schedule-error">{scheduleError}</div>}

          <div className="iv-candidate">
            <div className="iv-cand-head">
              <div className="iv-cand-avatar">{initials(panelName)}</div>
              <div>
                <div className="iv-cand-name">{panelName}</div>
                <div className="iv-cand-role">{panelRole}</div>
              </div>
            </div>

            <div className="iv-cand-label">Навыки</div>
            <div className="iv-chips">
              {panelSkills.map((skill) => (
                <span key={skill} className="iv-chip">
                  {skill}
                </span>
              ))}
            </div>

            {currentMeeting && (
              <div className="schedule-adjust">
                <div className="schedule-adjust-group">
                  <span className="schedule-adjust-label">Начало</span>
                  <button
                    type="button"
                    className="schedule-step"
                    onClick={() => shiftStart(-STEP_MINUTES)}
                  >
                    −
                  </button>
                  <span className="schedule-adjust-value">
                    {currentMeeting.startTime}
                  </span>
                  <button
                    type="button"
                    className="schedule-step"
                    onClick={() => shiftStart(STEP_MINUTES)}
                  >
                    +
                  </button>
                </div>
                <div className="schedule-adjust-group schedule-adjust-duration">
                  <span className="schedule-adjust-label">Длительность</span>
                  <div className="schedule-durations">
                    {DURATION_OPTIONS.map((option) => {
                      const duration =
                        toMinutes(currentMeeting.endTime) -
                        toMinutes(currentMeeting.startTime);
                      return (
                        <button
                          type="button"
                          key={option.value}
                          className={`schedule-duration${
                            duration === option.value ? " active" : ""
                          }`}
                          onClick={() => setDuration(option.value)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="schedule-actions">
              {currentMeeting && (
                <span className="schedule-slot-badge">
                  <IconCalendar size={16} />
                  {formatMeetingSlot(currentMeeting)}
                </span>
              )}
              <button
                type="button"
                className="schedule-btn cancel"
                onClick={() => setConfirmCancel(true)}
              >
                Отменить встречу
              </button>
              <button
                type="button"
                className="schedule-btn link"
                disabled={!currentMeeting}
              >
                Ссылка на встречу
              </button>
              <button
                type="button"
                className="schedule-btn change"
                onClick={() => {
                  setPicking(true);
                  setScheduleError("");
                }}
                disabled={!currentMeeting}
              >
                Изменить время
              </button>
            </div>
          </div>

          <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)}>
            <p className="iv-modal-title">
              Отменить встречу{panelName ? ` с ${panelName}` : ""}?
            </p>
            <div className="iv-modal-actions">
              <button
                type="button"
                className="iv-btn ghost"
                onClick={() => setConfirmCancel(false)}
              >
                Нет
              </button>
              <button
                type="button"
                className="iv-btn danger"
                onClick={confirmCancelMeeting}
              >
                Отменить встречу
              </button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Meetings;