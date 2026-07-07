namespace BarsHr.Api.DTOs.Candidates;

public record UpdateCandidateRequest(
    string? FullName,
    string? Phone,
    string? City,
    string? Education,
    string? PreviousWork,
    string? Skills,
    string? Status,
    bool? IsArchived
);