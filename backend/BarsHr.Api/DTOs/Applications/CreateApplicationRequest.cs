namespace BarsHr.Api.DTOs.Applications;

public record CreateApplicationRequest(
    int CandidateId,
    int VacancyId,
    string? Notes
);
