using BarsHr.Api.DTOs.Skills;

namespace BarsHr.Api.Services.Interfaces;

public interface ISkillService
{
    Task<List<SkillDto>> GetAllAsync(string? type = null, bool includeInactive = false);
    Task<SkillDto?> GetByIdAsync(int id);
    Task<SkillDto> CreateAsync(CreateSkillRequest request);
    Task<SkillDto?> UpdateAsync(int id, UpdateSkillRequest request);
    Task<bool> SetActiveAsync(int id, bool active);
}
