namespace BarsHr.Api.DTOs.Decisions;

public record CreateDecisionRequest(
    string DecisionType,
    string? Comment
);