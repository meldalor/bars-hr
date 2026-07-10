namespace BarsHr.Api.DTOs.Interviews;

public record InterviewListItemDto(
    int Id,
    int ApplicationId,
    string CandidateFullName,
    string VacancyTitle,
    DateTime ScheduledAt,
    int DurationMinutes,
    string Status,
    string? InterviewerName
);
