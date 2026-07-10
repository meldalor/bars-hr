import { useState, useEffect, useMemo, useRef } from "react";
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
  fetchInterviews,
  mapInterviewToMeeting,
  createInterview,
  updateInterview,
  cancelInterview,
} from "../../api/interviews.js";
import { fetchApplications } from "../../api/applications.js";
import { fetchCandidate } from "../../api/candidates.js";
import { IconCalendar } from "../vacancies/icons.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";
import MeetingTimeModal from "./MeetingTimeModal.jsx";

function Meetings() {
  const navigate = useNavigate();
  const location = useLocation();

  const schedule = location.state?.schedule || null;      // { candidateId, vacancyId }
  const reschedule = location.state?.reschedule || null;   // { meetingId }
  const scheduling = Boolean(schedule || reschedule);

  const [meetings, setMeetings] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [panelName, setPanelName] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [picking, setPicking] = useState(Boolean(schedule) || Boolean(reschedule));
  const [scheduleError, setScheduleError] = useState("");
  const [editTime, setEditTime] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const calendarBodyRef = useRef(null);

  const HOUR_START = 8;
  const HOUR_END = 19;
  const STEP_MINUTES = 15;
  const ROW_HEIGHT_PX = 20;
  const TIME_COLUMN_WIDTH = 52;
  const SLOTS_PER_HOUR = 60 / STEP_MINUTES;
  const DAY_END = HOUR_END * 60;

  const loadMeetings = () =>
    fetchInterviews()
      .then((list) => {
        setMeetings(list.map(mapInterviewToMeeting));
        setLoadError("");
      })
      .catch((error) => setLoadError(error.message || "Не удалось загрузить встречи"));

  useEffect(() => {
    loadMeetings();
  }, []);

  // подготовка панели назначения: имя кандидата + отклик (нужен applicationId для POST)
  useEffect(() => {
    let cancelled = false;
    if (!schedule) {
      return undefined;
    }
    Promise.all([
      fetchCandidate(schedule.candidateId),
      fetchApplications({ candidateId: schedule.candidateId, vacancyId: schedule.vacancyId }),
    ])
      .then(([candidate, applications]) => {
        if (cancelled) {
          return;
        }
        setPanelName(candidate.fullName);
        if (applications[0]) {
          setApplicationId(applications[0].id);
        } else {
          setScheduleError("У кандидата нет отклика на эту вакансию");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setScheduleError(error.message || "Не удалось подготовить назначение");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [schedule]);

  const currentMeeting = useMemo(
    () => (reschedule ? meetings.find((m) => m.id === String(reschedule.meetingId)) || null : null),
    [reschedule, meetings]
  );

  useEffect(() => {
    if (currentMeeting) {
      setPanelName(currentMeeting.fullName);
    }
  }, [currentMeeting]);

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
      const minutesFromStart = (getHours(now) - HOUR_START) * 60 + getMinutes(now);
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
      green: { bg: "#e8f5e9", text: "#2e7d32" },
      blue: { bg: "#e3f2fd", text: "#1565c0" },
      pink: { bg: "#fce4ec", text: "#c62828" },
      orange: { bg: "#fff3e0", text: "#e65100" },
      purple: { bg: "#f3e5f5", text: "#6a1b9a" },
    };
    return colors[type] || colors.blue;
  };

  // ISO-инстант для выбранного дня + слота (локальное wall-clock, корректный round-trip)
  const slotToIso = (day, slot) => {
    const [h, m] = slot.split(":").map(Number);
    const dt = new Date(day);
    dt.setHours(h, m, 0, 0);
    return dt.toISOString();
  };

  const slotMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const handleCellClick = async (day, slot) => {
    if (!scheduling || !picking) {
      return;
    }
    const start = slotMinutes(slot);

    if (reschedule) {
      const duration = currentMeeting
        ? slotMinutes(currentMeeting.endTime) - slotMinutes(currentMeeting.startTime)
        : 60;
      if (start + duration > DAY_END) {
        setScheduleError("Встреча не помещается в рабочий день");
        return;
      }
      setScheduleError("");
      try {
        await updateInterview(reschedule.meetingId, { scheduledAt: slotToIso(day, slot) });
        await loadMeetings();
        setPicking(false);
      } catch (error) {
        setScheduleError(error.message || "Не удалось перенести встречу");
      }
      return;
    }

    if (!applicationId) {
      setScheduleError("Нет отклика для назначения интервью");
      return;
    }
    if (start + 60 > DAY_END) {
      setScheduleError("Интервью не помещается в рабочий день");
      return;
    }
    setScheduleError("");
    try {
      await createInterview({ applicationId, scheduledAt: slotToIso(day, slot) });
      await loadMeetings();
      setPicking(false);
    } catch (error) {
      setScheduleError(error.message || "Не удалось назначить интервью");
    }
  };

  const handleRescheduleSaved = async ({ date, startTime, durationMinutes }) => {
    setScheduleError("");
    try {
      await updateInterview(reschedule.meetingId, {
        scheduledAt: slotToIso(parseISO(date), startTime),
        durationMinutes,
      });
      await loadMeetings();
      setEditTime(false);
    } catch (error) {
      setScheduleError(error.message || "Не удалось перенести встречу");
    }
  };

  const handleCancelMeeting = async () => {
    setConfirmCancel(false);
    try {
      await cancelInterview(reschedule.meetingId);
      navigate("/app/meetings");
      await loadMeetings();
    } catch (error) {
      setScheduleError(error.message || "Не удалось отменить встречу");
    }
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
    return { top: topPx, height: heightPx - 2, left: leftPx, width: widthPx };
  };

  return (
    <div className="meetings-page">
      <h1 className="overview-title">
        Встречи: <span className="overview-title-count">назначено {meetings.length} встреч</span>
      </h1>
      {loadError && <div className="schedule-error">{loadError}</div>}

      <div className="meetings-layout-full">
        <div className="calendar-container-full">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="nav-arrow" onClick={handlePrevWeek}>{"<"}</button>
              <span className="month-label" style={{ textTransform: "capitalize" }}>{monthLabel}</span>
              <button className="nav-arrow" onClick={handleNextWeek}>{">"}</button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="grid-header-row">
              <div className="grid-time-header-cell"></div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`grid-header-cell ${isToday(day) ? "today-header" : ""}`}
                >
                  {format(day, "EEEE d MMM", { locale: ru }).replace(/^./, (char) => char.toUpperCase())}
                </div>
              ))}
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
                    const isInWeek = isWithinInterval(parseISO(meeting.date), {
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
                          currentMeeting && currentMeeting.id === meeting.id ? "meeting-card-absolute--selected" : ""
                        }`}
                        onClick={() => navigate(`/app/meetings/${meeting.id}`)}
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

                <div className="current-time-line-absolute" style={{ top: `${currentTimePosition}px` }}>
                  <div className="current-time-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {scheduling && (
        <div className="schedule-panel">
          <div className="schedule-panel-title">
            {reschedule ? "Изменение времени встречи" : "Назначение интервью"}
          </div>

          {picking && (
            <div className="schedule-hint">
              {reschedule
                ? "Нажмите на ячейку в таблице — встреча перенесётся на это время."
                : "Нажмите на ячейку в таблице — интервью назначится на это время (по умолчанию 1 час)."}
            </div>
          )}
          {scheduleError && <div className="schedule-error">{scheduleError}</div>}

          <div className="iv-candidate">
            <div className="iv-cand-head">
              <div className="iv-cand-name">{panelName}</div>
            </div>

            {reschedule && currentMeeting && (
              <div className="schedule-actions">
                <span className="schedule-slot-badge">
                  <IconCalendar size={16} />
                  {currentMeeting.startTime}
                </span>
                <button type="button" className="schedule-btn change" onClick={() => setEditTime(true)}>
                  Изменить время
                </button>
                <button type="button" className="schedule-btn cancel" onClick={() => setConfirmCancel(true)}>
                  Отменить встречу
                </button>
              </div>
            )}
          </div>

          {reschedule && (
            <MeetingTimeModal
              open={editTime}
              meeting={currentMeeting}
              onClose={() => setEditTime(false)}
              onSaved={handleRescheduleSaved}
            />
          )}

          <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)}>
            <p className="iv-modal-title">Отменить встречу{panelName ? ` с ${panelName}` : ""}?</p>
            <div className="iv-modal-actions">
              <button type="button" className="iv-btn ghost" onClick={() => setConfirmCancel(false)}>Нет</button>
              <button type="button" className="iv-btn danger" onClick={handleCancelMeeting}>Отменить встречу</button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Meetings;
