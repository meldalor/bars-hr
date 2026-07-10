// Общие валидаторы форм: даты ДД.ММ.ГГГГ, телефон по маске, положительные числа.
// Возвращают текст ошибки или null, если значение корректно (пустое значение — не ошибка).

const MIN_DATE = new Date(1960, 0, 1);

// «31.12.2020» → Date | null; принимается только существующая календарная дата
export function parseRuDate(value) {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((value || "").trim());
    if (!match) {
        return null;
    }
    const [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
        ? date
        : null;
}

export function dateError(value) {
    if (!value) {
        return null;
    }
    const date = parseRuDate(value);
    if (!date) return "Дата в формате ДД.ММ.ГГГГ";
    if (date > new Date()) return "Дата не может быть из будущего";
    if (date < MIN_DATE) return "Слишком старая дата";
    return null;
}

// пара дат периода: каждая корректна и конец не раньше начала
export function periodError(start, end) {
    const error = dateError(start) || dateError(end);
    if (error) {
        return error;
    }
    const startDate = parseRuDate(start);
    const endDate = parseRuDate(end);
    if (startDate && endDate && endDate < startDate) {
        return "Дата окончания раньше даты начала";
    }
    return null;
}

// телефон по маске +7 (000) 000-00-00 — либо пусто, либо введён полностью
export function phoneError(value) {
    if (!value) {
        return null;
    }
    return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value.trim())
        ? null
        : "Введите номер полностью";
}

// положительное целое: только цифры, без ведущего нуля
export function positiveIntError(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }
    return /^[1-9]\d*$/.test(String(value).trim())
        ? null
        : "Целое число, не может начинаться с нуля";
}
