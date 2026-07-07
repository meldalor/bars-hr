using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Candidates;

public static class CandidateMappings
{
    public static CandidateDto ToDto(this Candidate c) => new(
        c.Id,
        c.FullName,
        c.Phone,
        c.City,
        c.Education,
        c.PreviousWork,
        c.Skills,
        c.IsArchived,
        c.CreatedAt
    );

    public static Candidate ToEntity(this CreateCandidateRequest request, int currentUserId) => new()
    {
        FullName = Required(request.FullName, "ФИО"),
        Phone = request.Phone,
        City = request.City,
        Education = request.Education,
        PreviousWork = request.PreviousWork,
        Skills = request.Skills,
        CreatedById = currentUserId
    };

    // null в запросе означает «поле не менять» — частичное обновление
    public static void ApplyUpdate(this Candidate candidate, UpdateCandidateRequest request)
    {
        if (request.FullName != null) candidate.FullName = Required(request.FullName, "ФИО");
        if (request.Phone != null) candidate.Phone = request.Phone;
        if (request.City != null) candidate.City = request.City;
        if (request.Education != null) candidate.Education = request.Education;
        if (request.PreviousWork != null) candidate.PreviousWork = request.PreviousWork;
        if (request.Skills != null) candidate.Skills = request.Skills;
        if (request.IsArchived.HasValue) candidate.IsArchived = request.IsArchived.Value;
        candidate.UpdatedAt = DateTime.UtcNow;
    }

    private static string Required(string? value, string field) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException($"Поле «{field}» не может быть пустым")
            : value.Trim();
}
