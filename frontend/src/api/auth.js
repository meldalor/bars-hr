import { apiPost } from "./client.js";
import { setSession } from "../auth/session.js";

// Вход: бэк отдаёт { token, role, fullName }; сохраняем как сессию.
export async function login(username, password, remember = true) {
    const data = await apiPost("/auth/login", { username, password });
    const session = {
        token: data.token,
        role: data.role,
        fullName: data.fullName,
    };
    setSession(session, remember);
    return session;
}
