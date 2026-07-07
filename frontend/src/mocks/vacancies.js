export const LANGUAGES = {
    csharp: { code: "C#", label: "Язык C#", color: "#6d28d9", text: "#ffffff" },
    js: { code: "JS", label: "Язык JS", color: "#f0b90b", text: "#1a1a1a" },
    python: { code: "Py", label: "Язык Py", color: "#1e40af", text: "#ffffff" },
};

export const TAG_COLORS = {
    experience: "#ef8f1c",
    employment: "#5f9245",
    city: "#c41e8f",
};

export const VACANCIES = [
    {
        id: "1",
        lang: "csharp",
        title: "Junior-разработчик мобильных приложений",
        experience: "Опыт >3 лет",
        employment: "Full-time",
        city: "Казань",
        candidates: 14,
        salaryFrom: 100000,
        salaryTo: 150000,
        createdAt: "24 июня 14:30",
        updatedAt: "2 июля 16:45",
        status: "active",
        format: "Офис",
        department: "Разработка",
        peopleCount: 2,
        requirements: ["Язык C#", "Язык Kotlin", "Знания Git", "Английский"],
        description:
            "Мы ищем Junior-разработчика мобильных приложений для работы над нашими продуктами на платформе iOS и Android. Вы будете участвовать в разработке новых функций, исправлении ошибок и улучшении производительности приложений.",
        responsibilities: [
            "Разработка и поддержка мобильных приложений (iOS/Android)",
            "Участие в проектировании и реализации нового функционала",
            "Тестирование и отладка приложений",
            "Работа с API и интеграциями",
        ],
    },
    {
        id: "2",
        lang: "js",
        title: "Middle-разработчик мобильных приложений",
        experience: "Опыт >3 лет",
        employment: "Full-time",
        city: "Москва",
        candidates: 14,
        salaryFrom: 100000,
        salaryTo: 150000,
        createdAt: "24 июня 14:30",
        updatedAt: "2 июля 16:45",
        status: "active",
        format: "Гибрид",
        department: "Разработка",
        peopleCount: 1,
        requirements: ["Язык JS", "React", "Знания Git", "Английский"],
        description:
            "Ищем Middle-разработчика для развития кроссплатформенных мобильных приложений и участия в архитектурных решениях команды.",
        responsibilities: [
            "Разработка новых модулей мобильного приложения",
            "Ревью кода и менторство младших разработчиков",
            "Оптимизация производительности",
            "Взаимодействие с командой дизайна и продукта",
        ],
    },
    {
        id: "3",
        lang: "python",
        title: "Senior-разработчик мобильных приложений",
        experience: "Опыт >3 лет",
        employment: "Full-time",
        city: "Самара",
        candidates: 14,
        salaryFrom: 100000,
        salaryTo: 150000,
        createdAt: "24 июня 14:30",
        updatedAt: "2 июля 16:45",
        status: "active",
        format: "Удалёнка",
        department: "Разработка",
        peopleCount: 1,
        requirements: ["Язык Py", "SQL", "Docker", "Английский"],
        description:
            "Требуется Senior-разработчик для проектирования серверной части и сложных интеграций мобильной платформы.",
        responsibilities: [
            "Проектирование архитектуры сервисов",
            "Разработка и поддержка бэкенда",
            "Настройка CI/CD и инфраструктуры",
            "Техническое лидерство в команде",
        ],
    },
    {
        id: "4",
        lang: "js",
        title: "Junior-разработчик мобильных приложений",
        experience: "Опыт >3 лет",
        employment: "Full-time",
        city: "Москва",
        candidates: 14,
        salaryFrom: 100000,
        salaryTo: 150000,
        createdAt: "24 июня 14:30",
        updatedAt: "2 июля 16:45",
        status: "active",
        format: "Офис",
        department: "Разработка",
        peopleCount: 3,
        requirements: ["Язык JS", "React", "Знания Git"],
        description:
            "Junior-позиция для начинающего разработчика мобильных приложений с желанием расти внутри сильной команды.",
        responsibilities: [
            "Разработка интерфейсов мобильного приложения",
            "Исправление ошибок и доработка функционала",
            "Написание автотестов",
            "Участие в командных встречах",
        ],
    },
    {
        id: "5",
        lang: "csharp",
        title: "Middle-разработчик веб-приложений",
        experience: "Опыт >1 года",
        employment: "Full-time",
        city: "Санкт-Петербург",
        candidates: 9,
        salaryFrom: 150000,
        salaryTo: 220000,
        createdAt: "20 июня 12:10",
        updatedAt: "1 июля 09:20",
        status: "active",
        format: "Гибрид",
        department: "Разработка",
        peopleCount: 1,
        requirements: ["Язык C#", "SQL", "Знания Git", "Английский"],
        description:
            "Ищем Middle-разработчика веб-приложений для развития внутренних сервисов компании.",
        responsibilities: [
            "Разработка веб-сервисов на .NET",
            "Проектирование REST API",
            "Работа с базами данных",
            "Код-ревью",
        ],
    },
    {
        id: "6",
        lang: "python",
        title: "Аналитик данных",
        experience: "Опыт >1 года",
        employment: "Part-time",
        city: "Казань",
        candidates: 21,
        salaryFrom: 80000,
        salaryTo: 120000,
        createdAt: "10 мая 10:00",
        updatedAt: "18 июня 15:40",
        status: "completed",
        format: "Удалёнка",
        department: "Аналитика",
        peopleCount: 1,
        requirements: ["Язык Py", "SQL", "Аналитика"],
        description:
            "Аналитик данных для построения отчётности и поддержки продуктовых решений на основе данных.",
        responsibilities: [
            "Сбор и обработка данных",
            "Построение дашбордов и отчётов",
            "A/B-тестирование",
            "Взаимодействие с продуктовой командой",
        ],
    },
    {
        id: "7",
        lang: "js",
        title: "Frontend-разработчик",
        experience: "Опыт >3 лет",
        employment: "Full-time",
        city: "Москва",
        candidates: 17,
        salaryFrom: 180000,
        salaryTo: 250000,
        createdAt: "2 мая 09:15",
        updatedAt: "12 июня 18:05",
        status: "completed",
        format: "Гибрид",
        department: "Разработка",
        peopleCount: 2,
        requirements: ["Язык JS", "React", "TypeScript", "Знания Git"],
        description:
            "Frontend-разработчик для создания современных пользовательских интерфейсов веб-платформы.",
        responsibilities: [
            "Разработка интерфейсов на React",
            "Оптимизация производительности фронтенда",
            "Поддержка дизайн-системы",
            "Код-ревью",
        ],
    },
];

export function getVacancyById(id) {
    return VACANCIES.find((vacancy) => vacancy.id === id) || null;
}

export function formatSalary(from, to) {
    return `${Math.round(from / 1000)} - ${Math.round(to / 1000)} тыс.`;
}

export function plural(count, forms) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return forms[0];
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return forms[1];
    }

    return forms[2];
}
