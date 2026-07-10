import { apiGet } from "./client.js";

// константный маппинг роль → права[] (только чтение, для чеклиста в админке)
export function fetchPermissions() {
    return apiGet("/permissions");
}
