import "./InterviewsCard.css";

const interviews = [
    {
        id: 1,
        time: "09:30",
        candidate: "Иван Петров",
        vacancy: "iOS-разработчик",
    },
    {
        id: 2,
        time: "11:00",
        candidate: "Мария Смирнова",
        vacancy: "Product Manager",
    },
    {
        id: 3,
        time: "14:00",
        candidate: "Анна Морозова",
        vacancy: "Data Analyst",
    },
];

function InterviewsCard() {
    return (
        <section className="interviews-card">
            <h2 className="interviews-title">Ближайшие интервью</h2>

            <p className="interviews-date">Сегодня 7 июля</p>

            <div className="interviews-list">
                {interviews.map((interview) => (
                    <div
                        className="interview-item"
                        key={interview.id}
                    >
                        <div className="interview-time">
                            {interview.time}
                        </div>

                        <div className="interview-info">
                            <div className="interview-name">
                                {interview.candidate}
                            </div>

                            <div className="interview-vacancy">
                                {interview.vacancy}
                            </div>
                        </div>

                        <span className="interview-arrow">›</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default InterviewsCard;