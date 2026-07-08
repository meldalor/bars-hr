namespace BarsHr.Api.Pdf.Models;

public record InterviewProtocolModel(
    string CandidateName,
    string VacancyTitle,
    string? InterviewerName,
    DateTime ScheduledAt,
    string? Plan,
    IReadOnlyList<string> Questions,
    IReadOnlyList<ProtocolCompetency> Competencies);

public record ProtocolCompetency(string SkillName, string SkillType, int MaxScore);
