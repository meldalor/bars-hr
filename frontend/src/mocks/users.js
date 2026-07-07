export const MOCK_USERS = [
    {
        id: 1,
        email: "hr@huntly.io",
        password: "huntly2026",
        name: "Анна Смирнова",
        role: "HR-менеджер",
    },
    {
        id: 2,
        email: "admin@huntly.io",
        password: "admin123",
        name: "Дмитрий Волков",
        role: "Администратор",
    },
    {
        id: 3,
        email: "recruiter@huntly.io",
        password: "recruit123",
        name: "Мария Кузнецова",
        role: "Рекрутёр",
    },
];

export function authenticate(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    const match = MOCK_USERS.find(
        (user) =>
            user.email.toLowerCase() === normalizedEmail &&
            user.password === password
    );

    if (!match) {
        return null;
    }

    return {
        id: match.id,
        email: match.email,
        name: match.name,
        role: match.role,
    };
}
