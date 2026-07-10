using BarsHr.Api.Domain;
using BarsHr.Api.Domain.Entities;

namespace BarsHr.Api.DTOs.Skills;

public static class SkillMappings
{
    public static SkillDto ToDto(this Skill s) => new(
        s.Id,
        s.Name,
        s.Type,
        s.Description,
        s.IsActive
    );

    public static Skill ToEntity(this CreateSkillRequest request) => new()
    {
        Name = Required(request.Name, "Название навыка"),
        Type = ValidType(request.Type),
        Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
    };

    // null в запросе означает «поле не менять» — частичное обновление
    public static void ApplyUpdate(this Skill skill, UpdateSkillRequest request)
    {
        if (request.Name != null) skill.Name = Required(request.Name, "Название навыка");
        if (request.Type != null) skill.Type = ValidType(request.Type);
        if (request.Description != null)
            skill.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
    }

    private static string Required(string? value, string field) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException($"Поле «{field}» не может быть пустым")
            : value.Trim();

    private static string ValidType(string? type) =>
        SkillTypes.All.Contains(type)
            ? type!
            : throw new ArgumentException($"Тип навыка должен быть одним из: {string.Join(", ", SkillTypes.All)}");
}
