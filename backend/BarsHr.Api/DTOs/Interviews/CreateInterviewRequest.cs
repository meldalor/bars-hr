using System.ComponentModel.DataAnnotations;

namespace BarsHr.Api.DTOs.Interviews;

public record CreateInterviewRequest(
    [Required]
    [Range(1, int.MaxValue)]
    int ApplicationId,

    [Required]
    DateTime ScheduledAt,

    string? Plan,
    int? InterviewerId
);