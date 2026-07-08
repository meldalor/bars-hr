namespace BarsHr.Api.DTOs.Vacancies;

public record VacancyDto(
    int Id,
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
    string Currency,
    int PositionsCount,
    string? Department,
    string? Skills,                 
    string? Platforms,              
    string Status,
    DateTime? ClosesAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    bool IsArchived,
    int CreatedById,
    string? CreatedByName,
    int ApplicationsCount,
    List<CompetencyDto> Competencies
);