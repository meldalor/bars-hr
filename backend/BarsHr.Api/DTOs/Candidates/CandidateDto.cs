namespace BarsHr.Api.DTOs.Candidates;

public record CandidateDto(
    int Id,
    string FullName,
    string? Phone,
    string? City,
    string? Telegram,
    string? Specialty,
    string? AdditionalInfo,
    string? Education,
    string? PreviousWork,
    string? Skills,
    bool IsArchived,
    DateTime CreatedAt
);
