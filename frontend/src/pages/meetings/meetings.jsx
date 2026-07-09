import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

import { fetchInterviews, mapInterviewToMeeting } from "../../api/interviews.js";

function Meetings() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loadError, setLoadError] = useState("");
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

  useEffect(() => {
    let cancelled = false;
    fetchInterviews()
      .then((list) => {
        if (!cancelled) {
          setMeetings(list.map(mapInterviewToMeeting));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message || "Не удалось загрузить встречи");
        }
      });
    return () => {
      cancelled = true;
    };
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
      green: { bg: "#e8f5e9", text: "#2e7d32", border: "#c8e6c9" },
      blue: { bg: "#e3f2fd", text: "#1565c0", border: "#bbdefb" },
      pink: { bg: "#fce4ec", text: "#c62828", border: "#f8bbd0" },
      orange: { bg: "#fff3e0", text: "#e65100", border: "#ffe0b2" },
      purple: { bg: "#f3e5f5", text: "#6a1b9a", border: "#e1bee7" },
    };
    return colors[type] || colors.blue;
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
              <span className="month-label" style={{ textTransform: "capitalize" }}>
                {monthLabel}
              </span>
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
                        <div key={`${day.toISOString()}-${slot}`} className="grid-cell"></div>
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
                        className="meeting-card-absolute"
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
    </div>
  );
}

export default Meetings;
