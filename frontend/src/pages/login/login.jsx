import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/ui/Input/Input.jsx";
import Button from "../../components/ui/Button/Button.jsx";

import { authenticate } from "../../mocks/users.js";

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
