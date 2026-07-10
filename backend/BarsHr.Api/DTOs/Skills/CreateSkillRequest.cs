namespace BarsHr.Api.DTOs.Skills;

public record CreateSkillRequest(
    string Name,
    string Type,
    string? Description = null
);
