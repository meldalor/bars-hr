using BarsHr.Api.DTOs.Evaluations;

namespace BarsHr.Api.DTOs.Interviews;

public record InterviewDto(
    int Id,
    int ApplicationId,
    DateTime ScheduledAt,
    string? Plan,
    string Status,
    string? SubStatus,
    decimal? OverallScore,
    string? GeneralNotes,
    List<EvaluationDto> Evaluations,  

    int CreatedById,
    DateTime CreatedAt,
    int? UpdatedById,
    DateTime? UpdatedAt,
    int? InterviewerId
);
