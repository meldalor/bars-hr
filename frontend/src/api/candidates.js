import { apiGet, apiPost, apiPut } from "./client.js";
import { formatDateShort, formatTimeShort } from "./format.js";

// навыки хранятся на бэке JSON-строкой; терпимо разбираем и запасные варианты
export function parseSkills(raw) {
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item)).filter(Boolean);
        }
        return [String(parsed)].filter(Boolean);
    } catch {
        return raw
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
}

export function serializeSkills(list) {
    return JSON.stringify(list ?? []);
}

// статус отклика на бэке → ключ статусного словаря фронта (mocks/candidates STATUSES)
const STATUS_TO_KEY = {
    New: "in_progress",
    Viewed: "interview",
    Approved: "accepted",
    Rejected: "rejected",
    Free: "free",
};

export function statusKey(backendStatus) {
    return STATUS_TO_KEY[backendStatus] ?? "free";
}

// элемент списка кандидатов под таблицу candidates.jsx (богатые поля упрощены)
export function mapCandidateListItem(dto) {
    return {
        id: String(dto.id),
        name: dto.fullName,
        fullName: dto.fullName,
        city: dto.city ?? "",
        phone: "",
        rating: null,
        specialty: "",
        date: formatDateShort(dto.createdAt),
        time: formatTimeShort(dto.createdAt),
        status: statusKey(dto.status),
        substatus: null,
        skills: parseSkills(dto.skills),
        applicationsCount: dto.applicationsCount ?? 0,
        interviewsCount: dto.interviewsCount ?? 0,
        isArchived: Boolean(dto.isArchived),
    };
}

// полная карточка кандидата (профиль)
export function mapCandidate(dto) {
    return {
        id: String(dto.id),
        fullName: dto.fullName,
        phone: dto.phone ?? "",
        city: dto.city ?? "",
        education: dto.education ?? "",
        previousWork: dto.previousWork ?? "",
        skills: parseSkills(dto.skills),
        isArchived: Boolean(dto.isArchived),
        createdAt: dto.createdAt,
    };
}

// тянем всех (вместе с архивом), список сам делит на активных/архив на клиенте
export async function fetchCandidates() {
    const list = await apiGet("/candidates?includeArchived=true&pageSize=1000");
    return list.map(mapCandidateListItem);
}

export async function fetchCandidate(id) {
    const dto = await apiGet(`/candidates/${id}`);
    return mapCandidate(dto);
}

export async function createCandidate(body) {
    const dto = await apiPost("/candidates", body);
    return mapCandidate(dto);
}

export async function updateCandidate(id, body) {
    const dto = await apiPut(`/candidates/${id}`, body);
    return mapCandidate(dto);
}

// строку образования/опыта храним читаемым текстом (её же печатает PDF-карточка)
function formatEducationRow(row) {
    const head = [row.level, row.institution, row.faculty].map((v) => (v || "").trim()).filter(Boolean).join(", ");
    const period = [row.start, row.end].map((v) => (v || "").trim()).filter(Boolean).join(" – ");
    return period ? `${head} (${period})`.trim() : head;
}

function formatExperienceRow(row) {
    const head = [row.company, row.position].map((v) => (v || "").trim()).filter(Boolean).join(" — ");
    const period = [row.start, row.end].map((v) => (v || "").trim()).filter(Boolean).join(" – ");
    const line = period ? `${head} (${period})`.trim() : head;
    const info = (row.info || "").trim();
    return info ? `${line}${line ? ": " : ""}${info}` : line;
}

// форма кандидата (ФИО + образование/опыт списками) → тело запроса бэка (плоские поля)
export function buildCandidateRequest({ formData, education, experience }) {
    const fullName = [formData.lastName, formData.firstName, formData.middleName]
        .map((part) => (part || "").trim())
        .filter(Boolean)
        .join(" ");

    const educationText = (education || []).map(formatEducationRow).filter(Boolean).join("\n");
    const previousWorkText = (experience || []).map(formatExperienceRow).filter(Boolean).join("\n");

    return {
        fullName,
        phone: formData.phone || null,
        city: formData.city || null,
        education: educationText || null,
        previousWork: previousWorkText || null,
        skills: serializeSkills(formData.selectedSkills),
    };
}

export function archiveCandidate(id) {
    return apiPost(`/candidates/${id}/archive`);
}

export function restoreCandidate(id) {
    return apiPost(`/candidates/${id}/restore`);
}
