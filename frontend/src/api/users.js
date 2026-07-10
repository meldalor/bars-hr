import { apiGet, apiPost, apiPut } from "./client.js";

// Активные пользователи для выпадающих списков (например, выбор интервьюера).
export function fetchUsers() {
    return apiGet("/users");
}

// Полный список пользователей для админки (Admin-only).
export function fetchManagedUsers() {
    return apiGet("/users/manage");
}

export function changeUserRole(id, role) {
    return apiPut(`/users/${id}/role`, { role });
}

export function setUserActive(id, active) {
    return apiPost(`/users/${id}/${active ? "activate" : "deactivate"}`);
}
