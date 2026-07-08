namespace BarsHr.Api.DTOs.Vacancies;

public record UpdateVacancyRequest(
    string? Title,
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
    string? Status,
    bool? IsArchived,
    string? Currency,
    int? PositionsCount
);