import "./StatisticsCards.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchCandidates } from "../../../../api/candidates.js";

import freeIcon from "../../../../assets/overview/free.svg";
import workIcon from "../../../../assets/overview/work.svg";
import testingIcon from "../../../../assets/overview/testing.svg";
import pendingIcon from "../../../../assets/overview/pending.svg";
import interviewIcon from "../../../../assets/overview/interview.svg";
import offerIcon from "../../../../assets/overview/offer.svg";
import acceptedIcon from "../../../../assets/overview/accepted.svg";
import rejectedIcon from "../../../../assets/overview/rejected.svg";

// статус кандидата на бэке выводится из откликов; карточки без данных покажут 0
const CARDS = [
    { title: "Свободен", statusKey: "free", icon: freeIcon },
    { title: "В работе", statusKey: "in_progress", icon: workIcon },
    { title: "Тестирование", statusKey: "testing", icon: testingIcon },
    { title: "Интервью", statusKey: "interview", icon: interviewIcon },
    { title: "Оффер", statusKey: "offer", icon: offerIcon },
    { title: "Ожидание решения", statusKey: "pending", icon: pendingIcon },
    { title: "Принят", statusKey: "accepted", icon: acceptedIcon },
    { title: "Отказ", statusKey: "rejected", icon: rejectedIcon },
];

function StatisticsCards() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({});

    useEffect(() => {
        let cancelled = false;
        fetchCandidates()
            .then((list) => {
                if (cancelled) {
                    return;
                }
                const next = {};
                list.forEach((candidate) => {
                    next[candidate.status] = (next[candidate.status] || 0) + 1;
                });
                setCounts(next);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="statistics-container">
            <section className="statistics-cards">
                {CARDS.map((card) => (
                    <div
                        className="statistics-card"
                        key={card.title}
                        onClick={() => navigate("/app/candidates")}
                        style={{ cursor: "pointer" }}
                    >
                        <img src={card.icon} alt={card.title} className="statistics-icon" />

                        <div className="statistics-info">
                            <h3>{card.title}</h3>
                            <span className="statistics-value">{counts[card.statusKey] || 0}</span>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default StatisticsCards;