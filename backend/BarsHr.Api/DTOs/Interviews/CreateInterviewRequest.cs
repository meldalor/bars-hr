namespace BarsHr.Api.DTOs.Interviews;

public record CreateInterviewRequest(
    int ApplicationId,
    DateTime ScheduledAt,
    int? DurationMinutes,
    string? Plan,
    int? InterviewerId
);
