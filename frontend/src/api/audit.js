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

// человекочитаемое «Действие» по паре сущность+операция (как на макетах журнала)
const EVENT_LABELS = {
    "Interview:Created": "Запланировано интервью",
    "Interview:Updated": "Изменено интервью",
    "Interview:Deleted": "Встреча отменена",
    "Application:Created": "Кандидат добавлен на вакансию",
    "Application:Updated": "Изменен статус кандидата",
    "Application:Deleted": "Отклик удалён",
    "Decision:Created": "Принято решение",
    "Decision:Updated": "Изменено решение",
    "Candidate:Created": "Создан кандидат",
    "Candidate:Updated": "Обновлён кандидат",
    "Vacancy:Created": "Создана вакансия",
    "Vacancy:Updated": "Обновлена вакансия",
    "User:Created": "Добавлен пользователь",
    "User:Updated": "Обновлён пользователь",
    "Skill:Created": "Добавлен навык",
    "Skill:Updated": "Обновлён навык",
};

function actionLabel(dto) {
    return (
        EVENT_LABELS[`${dto.entityName}:${dto.action}`] ||
        `${ACTION_LABELS[dto.action] || dto.action}: ${ENTITY_LABELS[dto.entityName] || dto.entityName}`
    );
}

// запись аудита → строка таблицы «Журнал активности» (datetime, user, role, action, details)
function mapEntry(dto) {
    const date = new Date(dto.timestamp);
    return {
        id: String(dto.id),
        datetime: Number.isNaN(date.getTime()) ? "" : format(date, "dd.MM.yy HH:mm"),
        user: dto.userName || "Система",
        role: ROLE_LABELS[dto.userRole] || dto.userRole || "—",
        action: actionLabel(dto),
        details: dto.details || `${ENTITY_LABELS[dto.entityName] || dto.entityName} #${dto.entityId}`,
    };
}

// candidateId/vacancyId — журнал конкретного кандидата/вакансии; mine — только действия текущего пользователя
export async function fetchAudit({ entityName, candidateId, vacancyId, mine, pageSize = 200 } = {}) {
    const params = new URLSearchParams();
    if (entityName) {
        params.set("entityName", entityName);
    }
    if (candidateId) {
        params.set("candidateId", candidateId);
    }
    if (vacancyId) {
        params.set("vacancyId", vacancyId);
    }
    if (mine) {
        params.set("mine", "true");
    }
    params.set("pageSize", String(pageSize));
    const list = await apiGet(`/audit?${params.toString()}`);
    return list.map(mapEntry);
}
