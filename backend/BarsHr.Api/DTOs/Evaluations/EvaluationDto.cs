namespace BarsHr.Api.DTOs.Evaluations;

public record EvaluationDto(
    int Id,
    int CompetencyId,
    string CompetencyName,
    int Score,
    int MaxScore,
    string? Comment,
    DateTime EvaluatedAt
);
