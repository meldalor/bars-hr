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

// статус отклика на бэке ↔ ключ статусного словаря фронта (mocks/candidates STATUSES)
const STATUS_TO_KEY = {
    New: "in_progress",
    Testing: "testing",
    Interview: "interview",
    Pending: "pending",
    Offer: "offer",
    Approved: "accepted",
    Rejected: "rejected",
    Free: "free",
};

const KEY_TO_STATUS = {
    in_progress: "New",
    testing: "Testing",
    interview: "Interview",
    pending: "Pending",
    offer: "Offer",
    accepted: "Approved",
    rejected: "Rejected",
};

export function statusKey(backendStatus) {
    return STATUS_TO_KEY[backendStatus] ?? "free";
}

// ключ фронта → статус бэка (для смены статуса отклика)
export function backendStatus(key) {
    return KEY_TO_STATUS[key] ?? "New";
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

// образование/опыт хранятся на бэке JSON-массивами записей; легаси-строки превращаем в одну запись
function parseEntries(raw, emptyRow, legacyField) {
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((row, index) => ({
                ...emptyRow,
                ...Object.fromEntries(
                    Object.keys(emptyRow).map((key) => [key, typeof row?.[key] === "string" ? row[key] : ""])
                ),
                id: `row-${index}`,
            }));
        }
    } catch {
        // не JSON — старый плоский текст
    }
    return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => ({ ...emptyRow, [legacyField]: line, id: `row-${index}` }));
}

const EDUCATION_ROW = { level: "", institution: "", faculty: "", start: "", end: "" };
const EXPERIENCE_ROW = { company: "", position: "", start: "", end: "", info: "" };

export function parseEducationList(raw) {
    return parseEntries(raw, EDUCATION_ROW, "institution");
}

export function parseExperienceList(raw) {
    return parseEntries(raw, EXPERIENCE_ROW, "company");
}

// полная карточка кандидата (профиль)
export function mapCandidate(dto) {
    return {
        id: String(dto.id),
        fullName: dto.fullName,
        phone: dto.phone ?? "",
        city: dto.city ?? "",
        telegram: dto.telegram ?? "",
        specialty: dto.specialty ?? "",
        additionalInfo: dto.additionalInfo ?? "",
        education: parseEducationList(dto.education),
        experience: parseExperienceList(dto.previousWork),
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

// оставляем только записи, где заполнено хоть одно поле; служебный id формы отбрасываем
function cleanEntries(list, template) {
    return (list || [])
        .map((row) =>
            Object.fromEntries(Object.keys(template).map((key) => [key, (row?.[key] || "").trim()]))
        )
        .filter((row) => Object.values(row).some(Boolean));
}

// форма кандидата → тело запроса бэка; пустая строка означает «очистить поле» (null бэк не меняет)
export function buildCandidateRequest({ formData, education, experience }) {
    const fullName = [formData.lastName, formData.firstName, formData.middleName]
        .map((part) => (part || "").trim())
        .filter(Boolean)
        .join(" ");

    const educationRows = cleanEntries(education, EDUCATION_ROW);
    const experienceRows = cleanEntries(experience, EXPERIENCE_ROW);

    return {
        fullName,
        phone: (formData.phone || "").trim(),
        city: (formData.city || "").trim(),
        telegram: (formData.telegram || "").trim(),
        specialty: (formData.vacancy || "").trim(),
        additionalInfo: (formData.info || "").trim(),
        education: educationRows.length ? JSON.stringify(educationRows) : "",
        previousWork: experienceRows.length ? JSON.stringify(experienceRows) : "",
        skills: serializeSkills(formData.selectedSkills),
    };
}

export function archiveCandidate(id) {
    return apiPost(`/candidates/${id}/archive`);
}

export function restoreCandidate(id) {
    return apiPost(`/candidates/${id}/restore`);
}
