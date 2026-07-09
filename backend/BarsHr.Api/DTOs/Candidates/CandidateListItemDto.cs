namespace BarsHr.Api.DTOs.Candidates;

public record CandidateListItemDto(
    int Id,
    string FullName,
    string? City,
    int ApplicationsCount,
    int InterviewsCount,
    DateTime CreatedAt,
    // для списка на фронте: статус выводится из откликов, навыки — чипы, архив — вкладка
    string Status,
    string? Skills,
    bool IsArchived
);
