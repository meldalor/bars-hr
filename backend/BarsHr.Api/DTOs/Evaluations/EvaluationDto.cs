namespace BarsHr.Api.DTOs.Evaluations;

public record EvaluationDto(
    int Id,
    int InterviewId,
    int CompetencyId,
    string CompetencyName,      
    int Score,
    string? Comment,
    int EvaluatedById,
    DateTime EvaluatedAt
);