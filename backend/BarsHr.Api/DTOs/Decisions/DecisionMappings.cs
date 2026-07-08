using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Decisions;

public static class DecisionMappings
{
    public static DecisionDto ToDto(this Decision d) => new(
        d.Id,
        d.InterviewId,
        d.MadeById,
        d.MadeBy?.FullName ?? string.Empty,
        d.DecisionType,
        d.Comment,
        d.MadeAt
    );

    public static Decision ToEntity(this CreateDecisionRequest request, int interviewId, int currentUserId) => new()
    {
        InterviewId = interviewId,
        MadeById = currentUserId,
        DecisionType = request.DecisionType,
        Comment = request.Comment,
        MadeAt = DateTime.UtcNow
    };
}