namespace BarsHr.Api.Pdf.Models;

public record InvitationModel(
    string CandidateName,
    string VacancyTitle,
    DateTime? ScheduledAt,
    string HrName,
    DateTime Date);
