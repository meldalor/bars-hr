using BarsHr.Api.Domain.Entities;
using BarsHr.Api.DTOs.Evaluations;
using BarsHr.Api.DTOs.Decisions;

namespace BarsHr.Api.DTOs.Interviews;

public static class InterviewMappings
{
    public static InterviewDto ToDto(this Interview i) => new(
        i.Id,
        i.ApplicationId,
        i.Application?.CandidateId ?? 0,
        i.Application?.Candidate?.FullName ?? string.Empty,
        i.Application?.VacancyId ?? 0,
        i.Application?.Vacancy?.Title ?? string.Empty,
        i.ScheduledAt,
        i.Status,
        i.Plan,
        i.OverallScore,
        i.GeneralNotes,
        i.InterviewerId,
        i.Interviewer?.FullName,
        i.Evaluations.Select(e => e.ToDto()).ToList(),
        i.Decision?.ToDto()
    );

    public static Interview ToEntity(this CreateInterviewRequest r, int currentUserId) => new()
    {
        ApplicationId = r.ApplicationId,
        ScheduledAt = r.ScheduledAt,
        Plan = r.Plan,
        InterviewerId = r.InterviewerId,
        Status = "Scheduled",
        CreatedById = currentUserId
    };
}
