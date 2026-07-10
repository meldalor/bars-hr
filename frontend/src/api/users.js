import { apiGet, apiPut } from "./client.js";

// Пользователи для выпадающих списков (например, выбор интервьюера).
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
