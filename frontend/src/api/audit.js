import { format } from "date-fns";
import { apiGet } from "./client.js";

const ROLE_LABELS = { Admin: "Администратор", HR: "HR-менеджер", DecisionMaker: "Согласующий" };
const ACTION_LABELS = { Created: "Создание", Updated: "Изменение", Deleted: "Удаление" };
const ENTITY_LABELS = {
    Candidate: "Кандидат",
    Vacancy: "Вакансия",
    Application: "Отклик",
    Interview: "Интервью",
    Evaluation: "Оценка",
    Decision: "Решение",
    User: "Пользователь",
    Skill: "Навык",
    Competency: "Компетенция",
};

// запись аудита → строка таблицы «Журнал активности» (datetime, user, role, action, details)
function mapEntry(dto) {
    const date = new Date(dto.timestamp);
    return {
        id: String(dto.id),
        datetime: Number.isNaN(date.getTime()) ? "" : format(date, "dd.MM.yy HH:mm"),
        user: dto.userName || "Система",
        role: ROLE_LABELS[dto.userRole] || dto.userRole || "—",
        action: ACTION_LABELS[dto.action] || dto.action,
        details: `${ENTITY_LABELS[dto.entityName] || dto.entityName} #${dto.entityId}`,
    };
}

export async function fetchAudit({ entityName, pageSize = 200 } = {}) {
    const params = new URLSearchParams();
    if (entityName) {
        params.set("entityName", entityName);
    }
    params.set("pageSize", String(pageSize));
    const list = await apiGet(`/audit?${params.toString()}`);
    return list.map(mapEntry);
}
