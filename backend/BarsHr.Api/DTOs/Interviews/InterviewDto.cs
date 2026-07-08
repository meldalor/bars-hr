using BarsHr.Api.DTOs.Evaluations;

namespace BarsHr.Api.DTOs.Interviews;

public record InterviewDto(
    int Id,
    int ApplicationId,
    int CandidateId,
    string CandidateFullName,
    int VacancyId,
    string VacancyTitle,
    DateTime ScheduledAt,
    string Status,
    string? Plan,
    decimal? OverallScore,
    string? GeneralNotes,
    int? InterviewerId,
    string? InterviewerName,
    List<EvaluationDto> Evaluations
);
