namespace BarsHr.Api.DTOs.Interviews;

public record UpdateInterviewRequest(
    DateTime? ScheduledAt,
    string? Plan,
    string? Status,
    string? SubStatus,
    decimal? OverallScore,
    string? GeneralNotes,
    int? InterviewerId
);