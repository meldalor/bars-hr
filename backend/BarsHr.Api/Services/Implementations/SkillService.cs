using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Skills;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class SkillService : ISkillService
{
    private readonly BarsHrDbContext _context;

    public SkillService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<SkillDto>> GetAllAsync(string? type = null, bool includeInactive = false)
    {
        var query = _context.Skills.AsNoTracking();

        if (!includeInactive)
            query = query.Where(s => s.IsActive);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(s => s.Type == type);

        return await query
            .OrderBy(s => s.Type)
            .ThenBy(s => s.Name)
            .Select(s => new SkillDto(s.Id, s.Name, s.Type, s.Description, s.IsActive))
            .ToListAsync();
    }

    public async Task<SkillDto?> GetByIdAsync(int id)
    {
        var skill = await _context.Skills.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        return skill?.ToDto();
    }

    public async Task<SkillDto> CreateAsync(CreateSkillRequest request)
    {
        var skill = request.ToEntity();

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return skill.ToDto();
    }

    public async Task<SkillDto?> UpdateAsync(int id, UpdateSkillRequest request)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return null;

        skill.ApplyUpdate(request);
        await _context.SaveChangesAsync();

        return skill.ToDto();
    }

    // навык из пула нельзя удалить (FK Restrict от компетенций) — прячем архивацией
    public async Task<bool> SetActiveAsync(int id, bool active)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return false;

        skill.IsActive = active;
        await _context.SaveChangesAsync();
        return true;
    }
}
