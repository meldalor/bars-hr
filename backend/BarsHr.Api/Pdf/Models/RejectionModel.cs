namespace BarsHr.Api.Pdf.Models;

public record RejectionModel(
    string CandidateName,
    string VacancyTitle,
    string? Feedback,
    string HrName,
    DateTime Date);
