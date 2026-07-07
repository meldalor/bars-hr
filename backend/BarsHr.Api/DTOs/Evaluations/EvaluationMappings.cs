using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Evaluations;

public static class EvaluationMappings
{
    // требует загруженной Competency (Include в запросе)
    public static EvaluationDto ToDto(this Evaluation e) => new(
        e.Id,
        e.CompetencyId,
        e.Competency?.Name ?? string.Empty,
        e.Score,
        e.Competency?.MaxScore ?? 5,
        e.Comment,
        e.EvaluatedAt
    );
}
