using BarsHr.Api.Domain.Entities;
using BarsHr.Api.DTOs.Evaluations;

namespace BarsHr.Api.DTOs.Interviews;

public static class InterviewMappings
{
    public static InterviewDto ToDto(this Interview interview) => new(
        interview.Id,
        interview.ApplicationId,
        interview.ScheduledAt,
        interview.Plan,
        interview.Status,
        interview.SubStatus,
        interview.OverallScore,
        interview.GeneralNotes,
        interview.Evaluations.Select(e => e.ToDto()).ToList(),   // ← вложенный маппинг
        interview.CreatedById,
        interview.CreatedAt,
        interview.UpdatedById,
        interview.UpdatedAt,
        interview.InterviewerId
    );

    public static Interview ToEntity(this CreateInterviewRequest request, int currentUserId) => new()
    {
        ApplicationId = request.ApplicationId,
        ScheduledAt = DateTime.SpecifyKind(request.ScheduledAt, DateTimeKind.Utc),
        Plan = request.Plan,
        Status = "New",                    
        CreatedById = currentUserId,
        CreatedAt = DateTime.UtcNow
    };

    public static void ApplyUpdate(this Interview interview, UpdateInterviewRequest request)
    {
        if (request.ScheduledAt.HasValue)
            interview.ScheduledAt = request.ScheduledAt.Value;

        if (request.Plan != null)
            interview.Plan = request.Plan;

        if (request.Status != null)
            interview.Status = request.Status;

        if (request.SubStatus != null)
            interview.SubStatus = request.SubStatus;

        if (request.OverallScore.HasValue)
            interview.OverallScore = request.OverallScore;

        if (request.GeneralNotes != null)
            interview.GeneralNotes = request.GeneralNotes;

        if (request.InterviewerId.HasValue)
            interview.InterviewerId = request.InterviewerId;

        interview.UpdatedAt = DateTime.UtcNow;
    }
}