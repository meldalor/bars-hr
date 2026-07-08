import { useNavigate } from "react-router-dom";
import "./InterviewsCard.css";
import { getMeetings } from "../../../../mocks/meetings";

function InterviewsCard() {
    const navigate = useNavigate();
    const interviews = getMeetings().slice(0, 3);

    const openMeeting = (meeting) => {
        navigate("/app/meetings", { state: { meetingId: meeting.id } });
    };

    return (
        <section className="interviews-card">
            <h2 className="interviews-title">Ближайшие интервью</h2>

            <p className="interviews-date">Неделя 6–12 июля</p>

            <div className="interviews-list">
                {interviews.map((interview) => (
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
        </section>
    );
}

export default InterviewsCard;
