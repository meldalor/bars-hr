namespace BarsHr.Api.DTOs.Evaluations;

public record CreateEvaluationRequest(
    int InterviewId,
    int CompetencyId,
    int Score,
    string? Comment
);
