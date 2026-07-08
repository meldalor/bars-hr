using BarsHr.Api.Domain.Entities;
using BarsHr.Api.DTOs.Evaluations;

namespace BarsHr.Api.DTOs.Evaluations;

public static class EvaluationMappings
{
    public static EvaluationDto ToDto(this Evaluation e) => new(
        e.Id,
        e.InterviewId,
        e.CompetencyId,
        e.Competency?.Name ?? "",     
        e.Score,
        e.Comment,
        e.EvaluatedById,
        e.EvaluatedAt
    );

    public static Evaluation ToEntity(this CreateEvaluationRequest request, int currentUserId) => new()
    {
        InterviewId = request.InterviewId,
        CompetencyId = request.CompetencyId,
        Score = request.Score,
        Comment = request.Comment,
        EvaluatedById = currentUserId,
        EvaluatedAt = DateTime.UtcNow
    };

    public static void ApplyUpdate(this Evaluation evaluation, UpdateEvaluationRequest request)
    {
        evaluation.Score = request.Score;           
        evaluation.Comment = request.Comment;      
        evaluation.EvaluatedAt = DateTime.UtcNow;
    }
}