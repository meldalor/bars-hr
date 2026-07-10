namespace BarsHr.Api.DTOs.Candidates;

public record UpdateCandidateRequest(
    string? FullName,
    string? Phone,
    string? City,
    string? Telegram,
    string? Specialty,
    string? AdditionalInfo,
    string? Education,
    string? PreviousWork,
    string? Skills,
    bool? IsArchived
);
