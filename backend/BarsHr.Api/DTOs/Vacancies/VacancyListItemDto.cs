namespace BarsHr.Api.DTOs.Vacancies;

public record VacancyListItemDto(
    int Id,
    string Title,
    string? Location,
    string? EmploymentType,
    string? ExperienceLevel,
    int? SalaryMin,
    int? SalaryMax,
    string Status,
    int ApplicationsCount,
    DateTime CreatedAt
);

