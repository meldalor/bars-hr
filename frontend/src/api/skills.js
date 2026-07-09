import { apiGet, apiPost } from "./client.js";

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

export function createSkill({ name, type }) {
    return apiPost("/skills", { name, type });
}

// мягкое удаление из пула: навык архивируется и пропадает из выбора у всех вакансий
export function archiveSkill(id) {
    return apiPost(`/skills/${id}/archive`);
}
