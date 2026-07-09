// Подсчёт общего стажа по записям опыта [{start, end}] (даты ДД.ММ.ГГГГ; пустой end — по сегодня)

function parseDate(value) {
    if (!value) {
        return null;
    }
    if (value.includes(".")) {
        const [d, m, y] = value.split(".");
        const date = new Date(`${y}-${m}-${d}`);
        return isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
}

function plural(count, one, few, many) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}

export function calculateTotalExperience(experienceList) {
    let totalMonths = 0;

    (experienceList || []).forEach((exp) => {
        const startDate = parseDate(exp.start);
        if (!startDate) {
            return;
        }
        const endDate = parseDate(exp.end) || new Date();
        if (startDate <= endDate) {
            totalMonths +=
                (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth());
        }
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    let result = "";
    if (years > 0) result += `${years} ${plural(years, "год", "года", "лет")}`;
    if (months > 0) result += ` ${months} ${plural(months, "месяц", "месяца", "месяцев")}`;
    if (!result) return "Опыт не указан";

    return result.trim();
}
