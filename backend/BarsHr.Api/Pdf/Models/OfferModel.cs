namespace BarsHr.Api.Pdf.Models;

public record OfferModel(
    string CandidateName,
    string Position,
    string? Department,
    string? Salary,
    string? WorkFormat,
    string? Location,
    string HrName,
    DateTime Date);
