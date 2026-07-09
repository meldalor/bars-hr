import { format } from "date-fns";
import { ru } from "date-fns/locale";

// ISO-дата бэка → «24 июня 14:30» для карточек и таблиц
export function formatDateTime(iso) {
    if (!iso) {
        return "";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return format(date, "d MMMM HH:mm", { locale: ru });
}

// многострочное текстовое поле бэка → массив строк (навыки, обязанности)
export function splitLines(text) {
    if (!text) {
        return [];
    }
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

// массив → многострочная строка для сохранения на бэк
export function joinLines(list) {
    return (list ?? [])
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join("\n");
}
