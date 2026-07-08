namespace BarsHr.Api.DTOs.Decisions;

public record DecisionDto(
    int Id,
    int InterviewId,
    int MadeById,
    string MadeByName,
    string DecisionType,
    string? Comment,
    DateTime MadeAt
);