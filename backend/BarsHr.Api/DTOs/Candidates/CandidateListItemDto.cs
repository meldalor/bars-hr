namespace BarsHr.Api.DTOs.Candidates;

public record CandidateListItemDto(
    int Id,
    string FullName,
    string? City,
    string? Specialty,
    int ApplicationsCount,
    int InterviewsCount,
    DateTime CreatedAt,
    // для списка на фронте: статус/подстатус и оценка берутся из «определяющего» отклика
    string Status,
    string? SubStatus,
    decimal? Rating,
    string? Skills,
    bool IsArchived
);
