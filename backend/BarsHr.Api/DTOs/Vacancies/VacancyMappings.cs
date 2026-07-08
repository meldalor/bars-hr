using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Vacancies;

public static class VacancyMappings
{
    public static VacancyDto ToDto(this Vacancy v) => new(
        v.Id,
        v.Title,
        v.Description,
        v.Responsibilities,
        v.Requirements,
        v.WorkFormat,
        v.Location,
        v.EmploymentType,
        v.ExperienceLevel,
        v.SalaryMin,
        v.SalaryMax,
        v.Currency,
        v.PositionsCount,
        v.Department,
        v.Skills,
        v.Platforms,
        v.Status,
        v.ClosesAt,
        v.CreatedAt,
        v.UpdatedAt,
        v.IsArchived,
        v.CreatedById,
        v.CreatedBy?.FullName,
        v.Applications.Count
    );

    public static Vacancy ToEntity(this CreateVacancyRequest request, int currentUserId) => new()
    {
        Title = Required(request.Title, "Название вакансии"),
        Description = request.Description,
        Responsibilities = request.Responsibilities,
        Requirements = request.Requirements,
        WorkFormat = request.WorkFormat,
        Location = request.Location,
        EmploymentType = request.EmploymentType,
        ExperienceLevel = request.ExperienceLevel,
        SalaryMin = request.SalaryMin,
        SalaryMax = request.SalaryMax,
        Department = request.Department,
        Skills = request.Skills,
        Platforms = request.Platforms,
        ClosesAt = request.ClosesAt,
        Currency = request.Currency,
        PositionsCount = request.PositionsCount,
        Status = "Open",
        CreatedById = currentUserId,
        CreatedAt = DateTime.UtcNow
    };

    public static void ApplyUpdate(this Vacancy vacancy, UpdateVacancyRequest request)
    {
        if (request.Title != null)
            vacancy.Title = Required(request.Title, "Название вакансии");

        if (request.Description != null) vacancy.Description = request.Description;
        if (request.Responsibilities != null) vacancy.Responsibilities = request.Responsibilities;
        if (request.Requirements != null) vacancy.Requirements = request.Requirements;
        if (request.WorkFormat != null) vacancy.WorkFormat = request.WorkFormat;
        if (request.Location != null) vacancy.Location = request.Location;
        if (request.EmploymentType != null) vacancy.EmploymentType = request.EmploymentType;
        if (request.ExperienceLevel != null) vacancy.ExperienceLevel = request.ExperienceLevel;

        if (request.SalaryMin.HasValue) vacancy.SalaryMin = request.SalaryMin;
        if (request.SalaryMax.HasValue) vacancy.SalaryMax = request.SalaryMax;
        if (request.PositionsCount.HasValue) vacancy.PositionsCount = request.PositionsCount.Value;

        if (request.Department != null) vacancy.Department = request.Department;
        if (request.Skills != null) vacancy.Skills = request.Skills;
        if (request.Platforms != null) vacancy.Platforms = request.Platforms;

        if (request.ClosesAt.HasValue) vacancy.ClosesAt = request.ClosesAt;
        if (request.Status != null) vacancy.Status = request.Status;
        if (request.IsArchived.HasValue) vacancy.IsArchived = request.IsArchived.Value;
        if (request.Currency != null) vacancy.Currency = request.Currency;

        vacancy.UpdatedAt = DateTime.UtcNow;
    }

    private static string Required(string? value, string field) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException($"Поле «{field}» не может быть пустым")
            : value.Trim();
}