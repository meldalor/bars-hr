namespace BarsHr.Api.Pdf.Models;

public record CandidateCardModel(
    string FullName,
    string? Phone,
    string? City,
    string? Telegram,
    string? Specialty,
    string? AdditionalInfo,
    string? Education,
    string? PreviousWork,
    IReadOnlyList<string> Skills,
    IReadOnlyList<CandidateApplication> Applications);

public record CandidateApplication(string VacancyTitle, string Status, DateTime AppliedAt);
