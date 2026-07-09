import { apiGet } from "./client.js";

// Пул навыков. type: "Hard" | "Soft" | "CultureFit"; includeInactive — с архивными.
export function fetchSkills({ type, includeInactive = false } = {}) {
    const params = new URLSearchParams();
    if (type) {
        params.set("type", type);
    }
    if (includeInactive) {
        params.set("includeInactive", "true");
    }
    const qs = params.toString();
    return apiGet(`/skills${qs ? `?${qs}` : ""}`);
}
