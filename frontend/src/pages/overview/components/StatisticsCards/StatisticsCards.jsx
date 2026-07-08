import "./StatisticsCards.css";
import { useNavigate } from "react-router-dom";

import freeIcon from "../../../../assets/overview/free.svg";
import workIcon from "../../../../assets/overview/work.svg";
import testingIcon from "../../../../assets/overview/testing.svg";
import pendingIcon from "../../../../assets/overview/pending.svg";
import interviewIcon from "../../../../assets/overview/interview.svg";
import offerIcon from "../../../../assets/overview/offer.svg";
import acceptedIcon from "../../../../assets/overview/accepted.svg";
import rejectedIcon from "../../../../assets/overview/rejected.svg";

const statistics = [
    {
        title: "Свободен",
        value: 67,
        change: "+20 за неделю",
        icon: freeIcon,
    },
    {
        title: "Тестирование",
        value: 40,
        change: "+12 за неделю",
        icon: testingIcon,
    },
    {
        title: "Ожидание решения",
        value: 16,
        change: "+5 за неделю",
        icon: pendingIcon,
    },
    {
        title: "Принят",
        value: 14,
        change: "+7 за неделю",
        icon: acceptedIcon,
    },
    {
        title: "В работе",
        value: 80,
        change: "+10 за неделю",
        icon: workIcon,
    },
    {
        title: "Интервью",
        value: 14,
        change: "-5 за неделю",
        icon: interviewIcon,
    },
    {
        title: "Оффер",
        value: 10,
        change: "+2 за неделю",
        icon: offerIcon,
    },
    {
        title: "Отказ",
        value: 6,
        change: "+2 за неделю",
        icon: rejectedIcon,
    },
];

function StatisticsCards() {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate("/app/candidates");
    };

    return (
        <div className="statistics-container">
            <section className="statistics-cards">
                {statistics.map((card) => (
                    <div
                        className="statistics-card"
                        key={card.title}
                        onClick={handleCardClick}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            src={card.icon}
                            alt={card.title}
                            className="statistics-icon"
                        />

                        <div className="statistics-info">
                            <h3>{card.title}</h3>

                            <span className="statistics-value">
                                {card.value}
                            </span>

                            <span className="statistics-change">
                                {card.change}
                            </span>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default StatisticsCards;