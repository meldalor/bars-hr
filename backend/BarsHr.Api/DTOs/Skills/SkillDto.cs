namespace BarsHr.Api.DTOs.Skills;

public record SkillDto(
    int Id,
    string Name,
    string Type,
    bool IsActive
);
