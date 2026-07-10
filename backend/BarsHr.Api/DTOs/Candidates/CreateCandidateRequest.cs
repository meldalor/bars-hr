using System.ComponentModel.DataAnnotations;

namespace BarsHr.Api.DTOs.Candidates;

public record CreateCandidateRequest(
    [Required, MaxLength(200)]
    string FullName,

    string? Phone,
    string? City,
    string? Telegram,
    string? Specialty,
    string? AdditionalInfo,
    string? Education,
    string? PreviousWork,
    string? Skills
);
