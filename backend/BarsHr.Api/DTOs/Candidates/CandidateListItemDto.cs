namespace BarsHr.Api.DTOs.Candidates;

public record CandidateListItemDto(
    int Id,
    string FullName,
    string? City,
    string Status,
    int InterviewsCount,
    DateTime CreatedAt
);