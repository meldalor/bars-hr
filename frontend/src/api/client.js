// Единая обёртка над fetch: базовый URL, подстановка Bearer-токена,
// разбор ошибок бэка ({ message }) и выход на логин при 401.

import { getToken, clearSession } from "../auth/session.js";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5080/api";

function buildHeaders(hasBody) {
    const headers = {};
    if (hasBody) {
        headers["Content-Type"] = "application/json";
    }
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

// Общая проверка ответа: 401 → чистим сессию и уходим на логин; иначе
// бросаем сообщение бэка. На успехе возвращает сам Response.
async function ensureOk(response) {
    if (response.status === 401) {
        clearSession();
        if (window.location.pathname !== "/login") {
            window.location.assign("/login");
        }
        throw new Error("Сессия истекла, войдите заново");
    }

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;
        try {
            const data = await response.json();
            if (data?.message) {
                message = data.message;
            } else if (typeof data === "string") {
                message = data;
            }
        } catch {
            // тело не JSON — оставляем статусный текст
        }
        throw new Error(message);
    }

    return response;
}

async function request(path, { method = "GET", body } = {}) {
    const hasBody = body !== undefined;
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: buildHeaders(hasBody),
        body: hasBody ? JSON.stringify(body) : undefined,
    });

    await ensureOk(response);

    if (response.status === 204) {
        return null;
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export function apiGet(path) {
    return request(path, { method: "GET" });
}

export function apiPost(path, body) {
    return request(path, { method: "POST", body });
}

export function apiPut(path, body) {
    return request(path, { method: "PUT", body });
}

export function apiDelete(path) {
    return request(path, { method: "DELETE" });
}

// Скачивание файла (PDF): возвращает blob и имя из Content-Disposition.
export async function apiBlob(path) {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: buildHeaders(false),
    });

    await ensureOk(response);

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(disposition);
    const filename = match ? decodeURIComponent(match[1]) : "document.pdf";
    return { blob, filename };
}
