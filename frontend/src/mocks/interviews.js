import { LANGUAGES, TAG_COLORS } from "./vacancies.js";

export const INTERVIEW_QUESTION_HINT =
    "Конкретные проекты, используемый стек (C#, .NET, Xamarin/MAUI), количество пользователей и роль в команде";

export const INTERVIEW_QUESTIONS = [
    "Расскажите о вашем опыте разработки мобильных приложений",
    "Какие архитектурные паттерны вы используете в своих проектах и почему?",
    "Как вы оптимизируете производительность мобильного приложения?",
    "Как вы работаете с состоянием приложения?",
    "Есть ли у вас опыт работы с CI/CD и автоматизацией тестирования?",
];

export const INTERVIEW_MATRIX = {
    hard: [
        { name: "Знание Java (базовые концепции)", description: "ООП, коллекции, исключения" },
        { name: "Алгоритмы и структуры данных", description: "Массивы, списки, карты, сложность" },
        { name: "SQL (базовый уровень)", description: "SELECT, JOIN, WHERE, GROUP BY" },
        { name: "Git (базовый уровень)", description: "Commit, push, pull, branch" },
        { name: "Spring (базовые знания)", description: "Spring Boot, REST, DI" },
    ],
    soft: [
        { name: "Обучаемость", description: "Способность быстро учиться" },
        { name: "Коммуникация", description: "Умение объяснять и слушать" },
        { name: "Решение проблем", description: "Логика и подход к задачам" },
        { name: "Реакция на фидбек", description: "Восприятие обратной связи" },
    ],
    culture: [
        { name: "Мотивация и интерес к работе", description: "Искренний интерес, а не зарплата" },
        { name: "Командный игрок", description: "Умение помогать и договариваться" },
        { name: "Ответственность", description: "Умение признавать ошибки" },
        { name: "Ценности компании", description: "Разделяет взгляды компании" },
    ],
};

export const MATRIX_GROUP_TITLES = {
    hard: "A. Hard Skills (технические навыки)",
    soft: "B. Soft Skills (личностные качества)",
    culture: "C. Culture Fit (соответствие команде)",
};

export const MEETINGS = [
    {
        id: 1,
        date: "2026-07-06",
        startTime: "09:30",
        endTime: "10:30",
        type: "pink",
        fullName: "Иван Петров",
        vacancy: "iOS-разработчик",
        role: "Junior-разработчик",
        tags: [
            { label: "Swift", color: "#6d28d9" },
            { label: "Опыт >2 лет", color: "#ef8f1c" },
            { label: "Full-time", color: "#5f9245" },
            { label: "Москва", color: "#c41e8f" },
        ],
        skills: ["Swift", "SwiftUI", "Знания Git", "Английский"],
        additionalInfo:
            "Уверенно владеет Swift и SwiftUI, есть опубликованные приложения в App Store и опыт работы с CoreData.",
    },
    {
        id: 2,
        date: "2026-07-07",
        startTime: "11:00",
        endTime: "12:00",
        type: "blue",
        fullName: "Мария Смирнова",
        vacancy: "Product Manager",
        role: "Middle Product Manager",
        tags: [
            { label: "Agile", color: "#1e40af" },
            { label: "Опыт >3 лет", color: "#ef8f1c" },
            { label: "Full-time", color: "#5f9245" },
            { label: "Санкт-Петербург", color: "#c41e8f" },
        ],
        skills: ["Аналитика", "Jira", "SQL", "Английский"],
        additionalInfo:
            "Запускала несколько продуктов с нуля, сильная в работе с метриками и приоритизации бэклога.",
    },
    {
        id: 3,
        date: "2026-07-08",
        startTime: "10:30",
        endTime: "11:30",
        type: "purple",
        fullName: "Дмитрий Соколов",
        vacancy: "Android-разработчик",
        role: "Middle-разработчик",
        tags: [
            { label: "Язык Kotlin", color: "#6d28d9" },
            { label: "Опыт >2 лет", color: "#ef8f1c" },
            { label: "Full-time", color: "#5f9245" },
            { label: "Казань", color: "#c41e8f" },
        ],
        skills: ["Язык Kotlin", "Jetpack Compose", "Знания Git", "Английский"],
        additionalInfo:
            "Хорошее знание Android SDK и Jetpack Compose, участвовал в проектах с высокой нагрузкой.",
    },
    {
        id: 4,
        date: "2026-07-09",
        startTime: "14:00",
        endTime: "15:00",
        type: "green",
        fullName: "Анна Морозова",
        vacancy: "Data Analyst",
        role: "Junior-аналитик",
        tags: [
            { label: "Язык Py", color: "#1e40af" },
            { label: "Опыт >1 года", color: "#ef8f1c" },
            { label: "Part-time", color: "#5f9245" },
            { label: "Удалёнка", color: "#c41e8f" },
        ],
        skills: ["Язык Py", "SQL", "Аналитика", "Английский"],
        additionalInfo:
            "Строит отчётность и дашборды, есть опыт A/B-тестирования и работы с большими выборками.",
    },
    {
        id: 5,
        date: "2026-07-10",
        startTime: "16:00",
        endTime: "17:00",
        type: "orange",
        fullName: "Кирилл Лебедев",
        vacancy: "DevOps-инженер",
        role: "Senior-инженер",
        tags: [
            { label: "Docker", color: "#6d28d9" },
            { label: "Опыт >3 лет", color: "#ef8f1c" },
            { label: "Full-time", color: "#5f9245" },
            { label: "Москва", color: "#c41e8f" },
        ],
        skills: ["Docker", "Kubernetes", "CI/CD", "Английский"],
        additionalInfo:
            "Выстраивал инфраструктуру с нуля, автоматизировал деплой и мониторинг в облаке.",
    },
];

export function getMeetingById(id) {
    return MEETINGS.find((meeting) => String(meeting.id) === String(id)) || null;
}

const SLOT_MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const SCHEDULE_DAYS = [
    "2026-07-06",
    "2026-07-07",
    "2026-07-08",
    "2026-07-09",
    "2026-07-10",
];

const DAY_START = 8 * 60;
const DAY_END = 19 * 60;
const SLOT_LENGTH = 60;
const SLOT_STEP = 30;

function toMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function toTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function findFreeSlot() {
    for (const date of SCHEDULE_DAYS) {
        const dayMeetings = MEETINGS.filter((meeting) => meeting.date === date);

        for (let start = DAY_START; start + SLOT_LENGTH <= DAY_END; start += SLOT_STEP) {
            const end = start + SLOT_LENGTH;
            const busy = dayMeetings.some((meeting) => {
                const meetingStart = toMinutes(meeting.startTime);
                const meetingEnd = toMinutes(meeting.endTime);
                return start < meetingEnd && meetingStart < end;
            });

            if (!busy) {
                return { date, startTime: toTime(start), endTime: toTime(end) };
            }
        }
    }

    return null;
}

export function getMeetingForCandidate(candidateId) {
    return MEETINGS.find((meeting) => meeting.candidateId === candidateId) || null;
}

export function scheduleInterview(candidate, vacancy) {
    const slot = findFreeSlot();
    if (!slot) {
        return null;
    }

    const tags = [];
    const lang = LANGUAGES[vacancy.lang];
    if (lang) {
        tags.push({ label: lang.label, color: lang.color });
    }
    tags.push({ label: vacancy.experience, color: TAG_COLORS.experience });
    tags.push({ label: vacancy.employment, color: TAG_COLORS.employment });
    tags.push({ label: vacancy.city, color: TAG_COLORS.city });

    const meeting = {
        id: `s${Date.now()}`,
        candidateId: candidate.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: "pink",
        fullName: candidate.name,
        vacancy: vacancy.title,
        role: candidate.specialty,
        tags,
        skills: [...vacancy.requirements],
        additionalInfo: "",
    };

    MEETINGS.push(meeting);
    return meeting;
}

export function cancelInterview(candidateId) {
    for (let i = MEETINGS.length - 1; i >= 0; i -= 1) {
        if (MEETINGS[i].candidateId === candidateId) {
            MEETINGS.splice(i, 1);
        }
    }
}

export function formatMeetingSlot(meeting) {
    const parts = meeting.date.split("-").map(Number);
    const month = parts[1];
    const day = parts[2];
    return `${day} ${SLOT_MONTHS[month - 1]} ${meeting.startTime}-${meeting.endTime}`;
}

function cloneMatrix(matrix) {
    return {
        hard: matrix.hard.map((item) => ({ ...item })),
        soft: matrix.soft.map((item) => ({ ...item })),
        culture: matrix.culture.map((item) => ({ ...item })),
    };
}

function storageKey(id) {
    return `huntly_interview_${id}`;
}

export function getInterview(meeting) {
    const raw = meeting ? localStorage.getItem(storageKey(meeting.id)) : null;

    if (raw) {
        const saved = JSON.parse(raw);
        return {
            questions: saved.questions.map((question) => ({ ...question })),
            matrix: cloneMatrix(saved.matrix),
            skills: [...saved.skills],
            finalScore: saved.finalScore,
            finalComment: saved.finalComment,
        };
    }

    return {
        questions: INTERVIEW_QUESTIONS.map((text) => ({ text, rating: 0, comment: "" })),
        matrix: {
            hard: INTERVIEW_MATRIX.hard.map((item) => ({ ...item, rating: 0, comment: "" })),
            soft: INTERVIEW_MATRIX.soft.map((item) => ({ ...item, rating: 0, comment: "" })),
            culture: INTERVIEW_MATRIX.culture.map((item) => ({ ...item, rating: 0, comment: "" })),
        },
        skills: meeting ? [...meeting.skills] : [],
        finalScore: "",
        finalComment: "",
    };
}

export function saveInterview(id, result) {
    const data = {
        questions: result.questions.map((question) => ({ ...question })),
        matrix: cloneMatrix(result.matrix),
        skills: [...result.skills],
        finalScore: result.finalScore,
        finalComment: result.finalComment,
    };

    localStorage.setItem(storageKey(id), JSON.stringify(data));
}
