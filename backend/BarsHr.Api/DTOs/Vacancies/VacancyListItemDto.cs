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
    DateTime CreatedAt,
    // нужны карточке списка на фронте: чипы навыков, отдел и дата правки
    string? Department,
    string? Skills,
    DateTime? UpdatedAt
);

