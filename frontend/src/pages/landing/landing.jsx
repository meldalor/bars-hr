import "./landing.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";  

import FloatingBadge from "../../components/landing/floating_badge.jsx";
import Button from "../../components/ui/Button/Button.jsx";

import background from "../../assets/landing/background.png";

import pythonIcon from "../../assets/landing/python.png";
import javascriptIcon from "../../assets/landing/javascript.png";
import reactIcon from "../../assets/landing/react.png";
import dockerIcon from "../../assets/landing/docker.png";
import goIcon from "../../assets/landing/go.png";
import typescriptIcon from "../../assets/landing/typescript.png";
import sqlIcon from "../../assets/landing/sql.png";
import awsIcon from "../../assets/landing/aws.png";
import figmaIcon from "../../assets/landing/figma.png";
import jiraIcon from "../../assets/landing/jira.png";
import analyticsIcon from "../../assets/landing/analytics.png";
import uiuxIcon from "../../assets/landing/uiux.png";

export default function LandingPage() {
    const navigate = useNavigate();
    const [isLeaving, setIsLeaving] = useState(false);

    const badges = [
        { icon: pythonIcon, text: "Python", style: { top: "7%", left: "26%" } },
        { icon: reactIcon, text: "React", style: { top: "14%", left: "12%" } },
        { icon: sqlIcon, text: "SQL", style: { top: "29%", left: "5%" } },
        { icon: goIcon, text: "Go", style: { top: "48%", left: "7%" } },
        { icon: analyticsIcon, text: "Analytics", style: { top: "68%", left: "6%" } },
        { icon: javascriptIcon, text: "JavaScript", style: { top: "80%", left: "22%" } },

        { icon: dockerIcon, text: "Docker", style: { bottom: "80%", right: "16%" } },
        { icon: uiuxIcon, text: "UI/UX", style: { bottom: "70%", right: "6%" } },
        { icon: awsIcon, text: "AWS", style: { bottom: "52%", right: "5%" } },
        { icon: jiraIcon, text: "Jira", style: { bottom: "35%", right: "8%" } },
        { icon: figmaIcon, text: "Figma", style: { bottom: "20%", right: "13%" } },
        { icon: typescriptIcon, text: "TypeScript", style: { bottom: "9%", right: "24%" } },
    ];

    return (
        <div
            className={`landing ${isLeaving ? "landing-exit" : ""}`}
            style={{
                backgroundImage: `url(${background})`,
            }}
        >
            {badges.map((badge, index) => (
                <FloatingBadge
                    key={index}
                    icon={badge.icon}
                    text={badge.text}
                    style={badge.style}
                />
            ))}

            <main className="landing-content">
                <h1 className="landing-logo">
                    Huntly
                    <span className="logo-star">✦</span>
                </h1>

                <p className="landing-subtitle">
                    Современная ATS система
                    <br />
                    для эффективного подбора талантов
                </p>

                <Button
                    className="landing-button"
                    onClick={() => {
                        setIsLeaving(true);
                        setTimeout(() => {
                            navigate("/login");
                        }, 250);
                    }}
                >
                    Войти в систему →
                </Button>
            </main>

            <footer className="landing-footer">
                © 2026 Huntly. Все права защищены.
            </footer>
        </div>
    );
}