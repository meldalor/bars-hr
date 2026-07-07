using BarsHr.Api.Data;
using BarsHr.Api.Domain.Entities;
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

    public async Task<List<CandidateListItemDto>> GetAllAsync(string? search = null, int page = 1, int pageSize = 20)
    {
        var query = _context.Candidates.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.FullName.Contains(search) || 
                                    (c.City != null && c.City.Contains(search)));
        }

        var candidates = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CandidateListItemDto(
                c.Id,
                c.FullName,
                c.City,
                c.Status,
                c.Interviews.Count,
                c.CreatedAt
            ))
            .ToListAsync();

        return candidates;
    }

    public async Task<CandidateDto?> GetByIdAsync(int id)
    {
        var candidate = await _context.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (candidate == null) return null;

        return new CandidateDto(
            candidate.Id,
            candidate.FullName,
            candidate.Phone,
            candidate.City,
            candidate.Education,
            candidate.PreviousWork,
            candidate.Skills,
            candidate.Status,
            candidate.IsArchived,
            candidate.CreatedAt
        );
    }

    public async Task<CandidateDto> CreateAsync(CreateCandidateRequest request, int currentUserId)
    {
        var candidate = new Candidate
        {
            FullName = request.FullName,
            Phone = request.Phone,
            City = request.City,
            Education = request.Education,
            PreviousWork = request.PreviousWork,
            Skills = request.Skills,
            Status = request.Status,
            CreatedById = currentUserId
        };

        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();

        return new CandidateDto(
            candidate.Id,
            candidate.FullName,
            candidate.Phone,
            candidate.City,
            candidate.Education,
            candidate.PreviousWork,
            candidate.Skills,
            candidate.Status,
            candidate.IsArchived,
            candidate.CreatedAt
        );
    }

    public async Task<CandidateDto?> UpdateAsync(int id, UpdateCandidateRequest request, int currentUserId)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return null;

        if (request.FullName != null) candidate.FullName = request.FullName;
        if (request.Phone != null) candidate.Phone = request.Phone;
        if (request.City != null) candidate.City = request.City;
        if (request.Education != null) candidate.Education = request.Education;
        if (request.PreviousWork != null) candidate.PreviousWork = request.PreviousWork;
        if (request.Skills != null) candidate.Skills = request.Skills;
        if (request.Status != null) candidate.Status = request.Status;
        if (request.IsArchived.HasValue) candidate.IsArchived = request.IsArchived.Value;

        candidate.UpdatedAt = DateTime.UtcNow;
        // candidate.UpdatedById = currentUserId; // раскомментируй, когда добавишь поле

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var candidate = await _context.Candidates.FindAsync(id);
        if (candidate == null) return false;

        _context.Candidates.Remove(candidate);
        await _context.SaveChangesAsync();
        return true;
    }
}