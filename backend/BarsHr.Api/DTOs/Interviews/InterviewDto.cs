using BarsHr.Api.DTOs.Evaluations;
using BarsHr.Api.DTOs.Decisions;

namespace BarsHr.Api.DTOs.Interviews;

public record InterviewDto(
    int Id,
    int ApplicationId,
    int CandidateId,
    string CandidateFullName,
    int VacancyId,
    string VacancyTitle,
    DateTime ScheduledAt,
    int DurationMinutes,
    string Status,
    string? Plan,
    decimal? OverallScore,
    string? GeneralNotes,
    int? InterviewerId,
    string? InterviewerName,
    IReadOnlyList<string> DefaultQuestions,
    List<EvaluationDto> Evaluations,
    DecisionDto? Decision
);
