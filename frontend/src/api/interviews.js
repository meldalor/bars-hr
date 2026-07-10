import { format } from "date-fns";
import { apiGet, apiPost, apiPut } from "./client.js";

// цвет карточки в календаре по статусу интервью
function statusColor(status) {
    if (status === "Completed") {
        return "green";
    }
    if (status === "Rejected") {
        return "pink";
    }
    return "blue";
}

// интервью бэка → объект под сетку календаря (длительность по умолчанию 60 минут)
export function mapInterviewToMeeting(dto) {
    const start = new Date(dto.scheduledAt);
    const end = new Date(start.getTime() + 60 * 60000);
    return {
        id: String(dto.id),
        date: format(start, "yyyy-MM-dd"),
        startTime: format(start, "HH:mm"),
        endTime: format(end, "HH:mm"),
        type: statusColor(dto.status),
        fullName: dto.candidateFullName,
        vacancy: dto.vacancyTitle,
    };
}

// полная карточка интервью для страницы оценки
export function mapInterview(dto) {
    return {
        id: String(dto.id),
        applicationId: dto.applicationId,
        candidateId: dto.candidateId,
        candidateName: dto.candidateFullName,
        vacancyId: dto.vacancyId,
        vacancyTitle: dto.vacancyTitle,
        scheduledAt: dto.scheduledAt,
        status: dto.status,
        plan: dto.plan ?? "",
        overallScore: dto.overallScore,
        generalNotes: dto.generalNotes ?? "",
        interviewerName: dto.interviewerName ?? "",
        defaultQuestions: dto.defaultQuestions ?? [],
        evaluations: dto.evaluations ?? [],
        decision: dto.decision ?? null,
    };
}

export async function fetchInterviews({ scope, candidateId } = {}) {
    const params = new URLSearchParams();
    if (scope) {
        params.set("scope", scope);
    }
    if (candidateId) {
        params.set("candidateId", candidateId);
    }
    const qs = params.toString();
    const list = await apiGet(`/interviews${qs ? `?${qs}` : ""}`);
    return list;
}

export async function fetchInterview(id) {
    const dto = await apiGet(`/interviews/${id}`);
    return mapInterview(dto);
}

export async function createInterview({ applicationId, scheduledAt, plan, interviewerId }) {
    const dto = await apiPost("/interviews", {
        applicationId: Number(applicationId),
        scheduledAt,
        plan: plan || null,
        interviewerId: interviewerId ?? null,
    });
    return mapInterview(dto);
}

// сохранение матрицы оценок целиком + общий комментарий
export async function saveEvaluations(id, { evaluations, generalNotes }) {
    const dto = await apiPut(`/interviews/${id}/evaluations`, {
        evaluations,
        generalNotes: generalNotes || null,
    });
    return mapInterview(dto);
}

// итоговое решение (только DecisionMaker/Admin): Accepted | Rejected
export async function makeDecision(id, { decisionType, comment }) {
    return apiPost(`/interviews/${id}/decision`, {
        decisionType,
        comment: comment || null,
    });
}
