import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewsCard.css";
import { fetchInterviews, mapInterviewToMeeting } from "../../../../api/interviews.js";

const MAX_INTERVIEWS = 2; // ИЗМЕНЕНО: теперь максимум 2

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayLabel(date) {
    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const diffDays = Math.round((target - today) / 86400000);

    const dayMonth = date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
    });

    if (diffDays === 0) return `Сегодня ${dayMonth}`;
    if (diffDays === 1) return `Завтра ${dayMonth}`;
    return dayMonth;
}

function groupByDay(interviews) {
    const groups = [];

    interviews.forEach((interview) => {
        const date = new Date(interview.date);
        const label = formatDayLabel(date);
        const lastGroup = groups[groups.length - 1];

        if (lastGroup && lastGroup.label === label) {
            lastGroup.items.push(interview);
        } else {
            groups.push({ label, items: [interview] });
        }
    });

    return groups;
}

function InterviewsCard() {
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        let cancelled = false;
        const today = startOfDay(new Date());
        fetchInterviews({ scope: "upcoming" })
            .then((list) => {
                if (cancelled) {
                    return;
                }
                const interviews = list
                    .map(mapInterviewToMeeting)
                    .filter((meeting) => startOfDay(new Date(meeting.date)) >= today)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, MAX_INTERVIEWS);
                setGroups(groupByDay(interviews));
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const openMeeting = (meeting) => {
        navigate(`/app/meetings/${meeting.id}`);
    };

    return (
        <section className="interviews-card">
            <h2 className="interviews-title">Ближайшие интервью</h2>

            {groups.map((group) => (
                <div className="interviews-group" key={group.label}>
                    <p className="interviews-date">{group.label}</p>

                    <div className="interviews-list">
                        {group.items.map((interview) => (
                            <button
                                type="button"
                                className="interview-item"
                                key={interview.id}
                                onClick={() => openMeeting(interview)}
                            >
                                <div className="interview-time">{interview.startTime}</div>

                                <div className="interview-info">
                                    <div className="interview-name">{interview.fullName}</div>

                                    <div className="interview-vacancy">{interview.vacancy}</div>
                                </div>

                                <span className="interview-arrow">›</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default InterviewsCard;