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

import { MEETINGS as MOCK_MEETINGS } from "../../mocks/interviews.js";

function Meetings() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMeeting = MOCK_MEETINGS.find((item) => item.id === location.state?.meetingId);

  const [meetings, setMeetings] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    initialMeeting
      ? startOfWeek(parseISO(initialMeeting.date), { weekStartsOn: 1 })
      : startOfWeek(new Date(2026, 6, 6), { weekStartsOn: 1 })
  );
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [selectedMeetingId, setSelectedMeetingId] = useState(initialMeeting?.id || null);
  const calendarBodyRef = useRef(null);

  const HOUR_START = 8;
  const HOUR_END = 19;
  const STEP_MINUTES = 30;
  const ROW_HEIGHT_PX = 40;
  const TIME_COLUMN_WIDTH = 52;

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

  const handleMeetingClick = (meeting) => {
    setSelectedMeetingId(meeting.id);
    navigate(`/app/meetings/${meeting.id}`);
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
                    <div key={`row-${index}`} style={{ display: "contents" }}>
                      <div className="grid-time-slot">
                        {index % 2 === 0 ? timeLabels[index / 2] : ""}
                      </div>
                      {weekDays.map((day) => (
                        <div
                          key={`${day.toISOString()}-${slot}`}
                          className="grid-cell"
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
                        onClick={() => handleMeetingClick(meeting)}
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