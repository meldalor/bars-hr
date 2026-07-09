namespace BarsHr.Api.Domain;

// воронка отклика (кандидат по конкретной вакансии). Значения совпадают со словарём статусов на фронте.
public static class ApplicationStatuses
{
    public const string New = "New";           // в работе
    public const string Testing = "Testing";   // тестовое задание
    public const string Interview = "Interview";
    public const string Offer = "Offer";
    public const string Approved = "Approved"; // принят
    public const string Rejected = "Rejected"; // отказ

    public static readonly string[] All = { New, Testing, Interview, Offer, Approved, Rejected };

    // допустимые подстатусы на каждый статус (пустой массив — подстатуса нет)
    public static readonly IReadOnlyDictionary<string, string[]> SubStatuses =
        new Dictionary<string, string[]>
        {
            [New] = new[] { "Назначен на вакансию", "Связь с кандидатом", "Ожидание ответа кандидата" },
            [Testing] = new[] { "ТЗ отправлено", "ТЗ на проверке" },
            [Interview] = new[] { "Интервью не назначено", "Интервью назначено" },
            [Offer] = new[] { "Ожидание ответа", "Оффер принят" },
            [Approved] = Array.Empty<string>(),
            [Rejected] = Array.Empty<string>(),
        };
}
