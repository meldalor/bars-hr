namespace BarsHr.Api.DTOs.Skills;

public record UpdateSkillRequest(
    string? Name,
    string? Type,
    string? Description = null
);
