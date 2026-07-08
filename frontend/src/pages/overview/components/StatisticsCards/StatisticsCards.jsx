import "./StatisticsCards.css";

import freeIcon from "../../../../assets/overview/free.svg";
import workIcon from "../../../../assets/overview/work.svg";
import testingIcon from "../../../../assets/overview/testing.svg";
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
        title: "В работе",
        value: 80,
        change: "+10 за неделю",
        icon: workIcon,
    },
    {
        title: "Тестирование",
        value: 40,
        change: "+12 за неделю",
        icon: testingIcon,
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
        title: "Принят",
        value: 14,
        change: "+7 за неделю",
        icon: acceptedIcon,
    },
    {
        title: "Отказ",
        value: 6,
        change: "+2 за неделю",
        icon: rejectedIcon,
    },
];

function StatisticsCards() {
    return (
        <section className="statistics-cards">
            {statistics.map((card) => (
                <div
                    className="statistics-card"
                    key={card.title}
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
    );
}

export default StatisticsCards;