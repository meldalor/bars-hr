namespace BarsHr.Api.DTOs.Vacancies;
public record CreateVacancyRequest(
    string Title,
    string? Description,
    string? Responsibilities,
    string? Requirements,
    string? WorkFormat,
    string? Location,
    string? EmploymentType,
    string? ExperienceLevel,
    int? SalaryMin,
    int? SalaryMax,
    string? Department,
    string? Skills,
    string? Platforms,
    DateTime? ClosesAt,
    string Currency = "RUB",       
    int PositionsCount = 1
);