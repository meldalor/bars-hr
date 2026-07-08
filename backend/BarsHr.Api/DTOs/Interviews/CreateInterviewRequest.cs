namespace BarsHr.Api.DTOs.Interviews;

public record CreateInterviewRequest(
    int ApplicationId,
    DateTime ScheduledAt,
    string? Plan,
    int? InterviewerId
);
