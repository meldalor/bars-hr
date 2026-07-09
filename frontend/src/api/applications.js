import { apiGet, apiPost, apiPut } from "./client.js";
import { formatDateShort } from "./format.js";
import { statusKey } from "./candidates.js";

export function mapApplication(dto) {
    return {
        id: String(dto.id),
        candidateId: String(dto.candidateId),
        candidateName: dto.candidateFullName,
        vacancyId: String(dto.vacancyId),
        vacancyTitle: dto.vacancyTitle,
        status: dto.status, // сырой статус бэка (New/Testing/Interview/Offer/Approved/Rejected)
        statusKey: statusKey(dto.status),
        subStatus: dto.subStatus ?? null,
        notes: dto.notes ?? "",
        appliedAt: formatDateShort(dto.appliedAt),
        interviewsCount: dto.interviewsCount ?? 0,
    };
}

// смена статуса/подстатуса отклика; status — сырой статус бэка
export async function updateApplicationStatus(id, { status, subStatus }) {
    const dto = await apiPut(`/applications/${id}/status`, {
        status,
        subStatus: subStatus || null,
    });
    return mapApplication(dto);
}

export async function fetchApplications({ candidateId, vacancyId } = {}) {
    const params = new URLSearchParams();
    if (candidateId) {
        params.set("candidateId", candidateId);
    }
    if (vacancyId) {
        params.set("vacancyId", vacancyId);
    }
    const qs = params.toString();
    const list = await apiGet(`/applications${qs ? `?${qs}` : ""}`);
    return list.map(mapApplication);
}

export async function createApplication({ candidateId, vacancyId, notes }) {
    const dto = await apiPost("/applications", {
        candidateId: Number(candidateId),
        vacancyId: Number(vacancyId),
        notes: notes || null,
    });
    return mapApplication(dto);
}
