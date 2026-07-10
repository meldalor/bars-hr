using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Candidates;

public static class CandidateMappings
{
    public static CandidateDto ToDto(this Candidate c) => new(
        c.Id,
        c.FullName,
        c.Phone,
        c.City,
        c.Telegram,
        c.Specialty,
        c.AdditionalInfo,
        c.Education,
        c.PreviousWork,
        c.Skills,
        c.IsArchived,
        c.CreatedAt
    );

    public static Candidate ToEntity(this CreateCandidateRequest request, int currentUserId) => new()
    {
        FullName = Required(request.FullName, "ФИО"),
        Phone = Clean(request.Phone),
        City = Clean(request.City),
        Telegram = Clean(request.Telegram),
        Specialty = Clean(request.Specialty),
        AdditionalInfo = Clean(request.AdditionalInfo),
        Education = Clean(request.Education),
        PreviousWork = Clean(request.PreviousWork),
        Skills = request.Skills,
        CreatedById = currentUserId
    };

    // null в запросе означает «поле не менять»; пустая строка — «очистить» (частичное обновление)
    public static void ApplyUpdate(this Candidate candidate, UpdateCandidateRequest request)
    {
        if (request.FullName != null) candidate.FullName = Required(request.FullName, "ФИО");
        if (request.Phone != null) candidate.Phone = Clean(request.Phone);
        if (request.City != null) candidate.City = Clean(request.City);
        if (request.Telegram != null) candidate.Telegram = Clean(request.Telegram);
        if (request.Specialty != null) candidate.Specialty = Clean(request.Specialty);
        if (request.AdditionalInfo != null) candidate.AdditionalInfo = Clean(request.AdditionalInfo);
        if (request.Education != null) candidate.Education = Clean(request.Education);
        if (request.PreviousWork != null) candidate.PreviousWork = Clean(request.PreviousWork);
        if (request.Skills != null) candidate.Skills = request.Skills;
        if (request.IsArchived.HasValue) candidate.IsArchived = request.IsArchived.Value;
        candidate.UpdatedAt = DateTime.UtcNow;
    }

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string Required(string? value, string field) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException($"Поле «{field}» не может быть пустым")
            : value.Trim();
}
