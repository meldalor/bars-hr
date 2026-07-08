namespace BarsHr.Api.DTOs.Evaluations;

public record UpdateEvaluationRequest(
    int Score,
    string? Comment
);
