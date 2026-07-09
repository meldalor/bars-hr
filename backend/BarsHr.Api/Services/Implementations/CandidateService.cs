using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Candidates;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class CandidateService : ICandidateService
{
    private readonly BarsHrDbContext _context;

    public CandidateService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<CandidateListItemDto>> GetAllAsync(
        string? search = null, string? status = null, bool includeArchived = false,
        int page = 1, int pageSize = 20)
    {
        var query = _context.Candidates.AsNoTracking();

        if (!includeArchived)
            query = query.Where(c => !c.IsArchived);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.FullName.Contains(search) ||
                                     (c.City != null && c.City.Contains(search)));

        // статус живёт на отклике: фильтр — «есть отклик в этом статусе»
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Applications.Any(a => a.Status == status));

        // проекция в SQL, а не маппер: иначе EF затянет все отклики в память ради счётчиков
        return await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CandidateListItemDto(
                c.Id,
                c.FullName,
                c.City,
                c.Applications.Count,
                c.Applications.SelectMany(a => a.Interviews).Count(),
                c.CreatedAt,
                // сводный статус кандидата: берём самый «продвинутый» из откликов
                c.Applications.Any(a => a.Status == "Approved") ? "Approved"
                    : c.Applications.Any(a => a.Status == "Rejected") ? "Rejected"
                    : c.Applications.Any(a => a.Status == "Viewed") ? "Viewed"
                    : c.Applications.Any(a => a.Status == "New") ? "New"
                    : "Free",
                c.Skills,
                c.IsArchived
            ))
            .ToListAsync();
    }

    public async Task<CandidateDto?> GetByIdAsync(int id)
    {
        var candidate = await _context.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        return candidate?.ToDto();
    }

    public async Task<CandidateDto> CreateAsync(CreateCandidateRequest request, int currentUserId)
    {
        var candidate = request.ToEntity(currentUserId);

        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();

        return candidate.ToDto();
    }

    public async Task<CandidateDto?> UpdateAsync(int id, UpdateCandidateRequest request, int currentUserId)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return null;

        candidate.ApplyUpdate(request);
        await _context.SaveChangesAsync();

        return candidate.ToDto();
    }

    public async Task<bool> SetArchivedAsync(int id, bool archived)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return false;

        candidate.IsArchived = archived;
        candidate.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
