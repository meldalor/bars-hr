// Хранилище сессии: JWT-токен, роль и имя пользователя.
// «Запомнить меня» решает, где живёт сессия — в localStorage (переживает
// закрытие вкладки) или sessionStorage (только на время вкладки).

const SESSION_KEY = "huntly_session";

export function getSession() {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setSession(session, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem(SESSION_KEY);
    storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
}

export function getToken() {
    return getSession()?.token ?? null;
}
