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

        // компактная SQL-проекция; «определяющий» отклик выбирается уже в памяти
        var rows = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id,
                c.FullName,
                c.City,
                c.Specialty,
                c.CreatedAt,
                c.Skills,
                c.IsArchived,
                InterviewsCount = c.Applications.SelectMany(a => a.Interviews).Count(),
                Apps = c.Applications.Select(a => new
                {
                    a.Status,
                    a.SubStatus,
                    // последняя выставленная оценка по интервью этого отклика
                    Score = a.Interviews
                        .Where(i => i.OverallScore != null)
                        .OrderByDescending(i => i.ScheduledAt)
                        .Select(i => i.OverallScore)
                        .FirstOrDefault()
                }).ToList()
            })
            .ToListAsync();

        return rows.Select(row =>
        {
            // сводный статус кандидата: самый «продвинутый» из откликов, отказ — в последнюю очередь;
            // подстатус и оценка берутся из того же отклика, что определил статус
            var top = StatusPriority
                .Select(status => row.Apps
                    .Where(a => a.Status == status)
                    .OrderByDescending(a => a.Score.HasValue)
                    .FirstOrDefault())
                .FirstOrDefault(app => app != null);

            return new CandidateListItemDto(
                row.Id,
                row.FullName,
                row.City,
                row.Specialty,
                row.Apps.Count,
                row.InterviewsCount,
                row.CreatedAt,
                top?.Status ?? "Free",
                top?.SubStatus,
                top?.Score,
                row.Skills,
                row.IsArchived
            );
        }).ToList();
    }

    private static readonly string[] StatusPriority =
        { "Offer", "Approved", "Pending", "Interview", "Testing", "New", "Rejected" };

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
