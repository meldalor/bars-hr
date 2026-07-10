import { apiGet } from "./client.js";

// Активные пользователи для выпадающих списков (например, выбор интервьюера).
export function fetchUsers() {
    return apiGet("/users");
}
