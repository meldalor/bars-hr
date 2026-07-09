namespace BarsHr.Api.Domain;

// воронка отклика (кандидат по конкретной вакансии). Значения совпадают со словарём статусов на фронте.
// Порядок пайплайна: New → Testing → Interview → Pending → Approved/Rejected → Offer (вручную после Approved)
public static class ApplicationStatuses
{
    public const string New = "New";           // в работе
    public const string Testing = "Testing";   // тестовое задание
    public const string Interview = "Interview";
    public const string Pending = "Pending";   // в ожидании решения (после «на согласование»)
    public const string Approved = "Approved"; // принят
    public const string Rejected = "Rejected"; // отказ
    public const string Offer = "Offer";

    public static readonly string[] All = { New, Testing, Interview, Pending, Approved, Rejected, Offer };

    // подстатус «Оффер принят» участвует в автозакрытии вакансии
    public const string OfferAccepted = "Принят";

    // допустимые подстатусы на каждый статус (пустой массив — подстатуса нет);
    // первый элемент — дефолтный, см. DefaultSubStatus
    public static readonly IReadOnlyDictionary<string, string[]> SubStatuses =
        new Dictionary<string, string[]>
        {
            [New] = new[] { "Назначен на вакансию", "Связь с кандидатом", "Ожидание ответа кандидата" },
            [Testing] = new[] { "ТЗ отправлено", "ТЗ на проверке", "ТЗ пройдено", "ТЗ не пройдено" },
            [Interview] = new[] { "Назначить интервью", "Интервью назначено" },
            [Pending] = Array.Empty<string>(),
            [Approved] = Array.Empty<string>(),
            [Rejected] = Array.Empty<string>(),
            [Offer] = new[] { "Не отправлен", "Отправлен", "Ожидание ответа", OfferAccepted, "Отказ" },
        };

    public static string? DefaultSubStatus(string status) =>
        SubStatuses.TryGetValue(status, out var subs) && subs.Length > 0 ? subs[0] : null;
}
