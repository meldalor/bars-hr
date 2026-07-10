using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Applications;

public static class ApplicationMappings
{
    // требует загруженных Candidate и Vacancy (Include в запросе)
    public static ApplicationDto ToDto(this Application a) => new(
        a.Id,
        a.CandidateId,
        a.Candidate?.FullName ?? string.Empty,
        a.VacancyId,
        a.Vacancy?.Title ?? string.Empty,
        a.Status,
        a.SubStatus,
        a.Notes,
        a.AppliedAt,
        a.Interviews.Count
    );

    public static Application ToEntity(this CreateApplicationRequest r, int currentUserId) => new()
    {
        CandidateId = r.CandidateId,
        VacancyId = r.VacancyId,
        Notes = r.Notes,
        SubStatus = Domain.ApplicationStatuses.DefaultSubStatus(Domain.ApplicationStatuses.New),
        CreatedById = currentUserId
    };
}
