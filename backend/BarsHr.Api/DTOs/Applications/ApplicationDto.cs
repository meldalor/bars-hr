namespace BarsHr.Api.DTOs.Applications;

public record ApplicationDto(
    int Id,
    int CandidateId,
    string CandidateFullName,
    int VacancyId,
    string VacancyTitle,
    string Status,
    string? Notes,
    DateTime AppliedAt,
    int InterviewsCount
);
