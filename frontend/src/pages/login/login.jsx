import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/ui/Input/Input.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import FloatingBadge from "../../components/landing/floating_badge.jsx";

import { authenticate } from "../../mocks/users.js";

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

const BADGES = [
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

export default function Login() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const trimmedLogin = login.trim();

        if (!trimmedLogin || !password) {
            setError("Введите логин и пароль");
            return;
        }

        setError("");
        setIsSubmitting(true);

        setTimeout(() => {
            const user = authenticate(trimmedLogin, password);

            if (!user) {
                setError("Неверный логин или пароль");
                setIsSubmitting(false);
                return;
            }

            const storage = remember ? localStorage : sessionStorage;
            storage.setItem("huntly_session", JSON.stringify(user));

            navigate("/app/overview");
        }, 600);
    };

    return (
        <div className="login">
            {BADGES.map((badge, index) => (
                <FloatingBadge
                    key={index}
                    icon={badge.icon}
                    text={badge.text}
                    style={badge.style}
                />
            ))}

            <button
                type="button"
                className="login-back"
                onClick={() => navigate("/")}
            >
                ← Назад
            </button>

            <div className="login-card">
                <div className="login-title">
                    <span className="login-text">
                        Вход
                        <span className="logo-star">✦</span>
                    </span>
                    <p className="login-subtitle">
                        Войдите в свою учётную запись<br />
                        для продолжения работы
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <label className="login-field">
                        <span className="login-field-label">Логин</span>
                        <Input
                            type="text"
                            placeholder="Введите логин"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            disabled={isSubmitting}
                        />
                    </label>

                    <label className="login-field">
                        <span className="login-field-label">Пароль</span>
                        <div className="login-password">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                disabled={isSubmitting}
                                className="login-password-input"
                            />
                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() => setShowPassword((value) => !value)}
                                disabled={isSubmitting}
                                aria-label={
                                    showPassword ? "Скрыть пароль" : "Показать пароль"
                                }
                            >
                                {showPassword ? "Скрыть" : "Показать"}
                            </button>
                        </div>
                    </label>

                    <div className="login-row">
                        <label className="login-remember">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(event) => setRemember(event.target.checked)}
                                disabled={isSubmitting}
                            />
                            <span>Запомнить меня</span>
                        </label>
                        <button type="button" className="login-link">
                            Забыли пароль?
                        </button>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <Button
                        type="submit"
                        className="login-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Входим…" : "Войти в систему →"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
