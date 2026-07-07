namespace BarsHr.Api.DTOs.Candidates;

public record CandidateListItemDto(
    int Id,
    string FullName,
    string? City,
    int ApplicationsCount,
    int InterviewsCount,
    DateTime CreatedAt
);
