namespace BarsHr.Api.DTOs.Interviews;

// перенос интервью: частичное обновление, null-поля не меняются
public record UpdateInterviewRequest(
    DateTime? ScheduledAt,
    string? Plan,
    int? InterviewerId
);
