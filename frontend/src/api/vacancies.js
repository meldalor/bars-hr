import { apiGet, apiPost, apiPut } from "./client.js";
import { formatDateTime, splitLines, joinLines } from "./format.js";

const LANG_RULES = [
    { key: "csharp", re: /c#|\.net|dotnet|шарп/i },
    { key: "js", re: /\b(js|javascript|typescript|ts|react|node|vue|angular)\b/i },
    { key: "python", re: /python|\bpy\b|django|flask/i },
];

// язык-иконка выводится на клиенте из названия/навыков — на бэке такого поля нет
function deriveLang(...sources) {
    const text = sources.filter(Boolean).join(" ");
    for (const rule of LANG_RULES) {
        if (rule.re.test(text)) {
            return rule.key;
        }
    }
    return null;
}

// статус вакансии на бэке (Open/Closed) → вкладка списка на фронте
function statusToTab(status) {
    return status === "Open" ? "active" : "completed";
}

export function mapVacancyListItem(dto) {
    return {
        id: String(dto.id),
        title: dto.title,
        city: dto.location ?? "",
        employment: dto.employmentType ?? "",
        experience: dto.experienceLevel ?? "",
        salaryFrom: dto.salaryMin ?? 0,
        salaryTo: dto.salaryMax ?? 0,
        candidates: dto.applicationsCount ?? 0,
        status: statusToTab(dto.status),
        createdAt: formatDateTime(dto.createdAt),
        updatedAt: formatDateTime(dto.updatedAt ?? dto.createdAt),
        createdAtIso: dto.createdAt,
        requirements: splitLines(dto.skills),
        department: dto.department ?? "",
        lang: deriveLang(dto.title, dto.skills),
    };
}

export function mapVacancy(dto) {
    return {
        id: String(dto.id),
        title: dto.title,
        description: dto.description ?? "",
        responsibilities: splitLines(dto.responsibilities),
        requirements: splitLines(dto.skills),
        city: dto.location ?? "",
        employment: dto.employmentType ?? "",
        experience: dto.experienceLevel ?? "",
        format: dto.workFormat ?? "",
        department: dto.department || "—",
        salaryFrom: dto.salaryMin ?? 0,
        salaryTo: dto.salaryMax ?? 0,
        peopleCount: dto.positionsCount ?? 1,
        candidates: dto.applicationsCount ?? 0,
        status: statusToTab(dto.status),
        createdAt: formatDateTime(dto.createdAt),
        updatedAt: formatDateTime(dto.updatedAt ?? dto.createdAt),
        createdAtIso: dto.createdAt,
        lang: deriveLang(dto.title, dto.skills),
        competencies: dto.competencies ?? [],
        currency: dto.currency ?? "RUB",
    };
}

// форма фронта → тело запроса создания/правки вакансии
function toRequestBody(data) {
    return {
        title: data.title,
        description: data.description || null,
        responsibilities: joinLines(data.responsibilities) || null,
        skills: joinLines(data.requirements) || null,
        workFormat: data.format || null,
        location: data.city || null,
        employmentType: data.employment || null,
        experienceLevel: data.experience || null,
        salaryMin: data.salaryFrom ?? null,
        salaryMax: data.salaryTo ?? null,
        department: data.department || null,
        positionsCount: data.peopleCount ?? 1,
    };
}

export async function fetchVacancies() {
    const list = await apiGet("/vacancies");
    return list.map(mapVacancyListItem);
}

export async function fetchVacancy(id) {
    const dto = await apiGet(`/vacancies/${id}`);
    return mapVacancy(dto);
}

export async function createVacancy(data) {
    const dto = await apiPost("/vacancies", toRequestBody(data));
    return mapVacancy(dto);
}

export async function saveVacancy(id, data) {
    const dto = await apiPut(`/vacancies/${id}`, toRequestBody(data));
    return mapVacancy(dto);
}

export async function closeVacancy(id) {
    const dto = await apiPut(`/vacancies/${id}`, { status: "Closed" });
    return mapVacancy(dto);
}

// копия: читаем исходную вакансию и создаём новую с теми же полями
export async function duplicateVacancy(id) {
    const source = await fetchVacancy(id);
    return createVacancy({ ...source, title: `${source.title} (копия)` });
}

export async function setCompetencies(id, items) {
    const dto = await apiPut(`/vacancies/${id}/competencies`, items);
    return mapVacancy(dto);
}
