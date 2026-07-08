using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Vacancies;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class VacancyService : IVacancyService
{
    private readonly BarsHrDbContext _context;

    public VacancyService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<VacancyListItemDto>> GetAllAsync(
        string? search = null,
        string? status = null,
        bool includeArchived = false,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.Vacancies.AsNoTracking();

        if (!includeArchived)
            query = query.Where(v => !v.IsArchived);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(v =>
                v.Title.Contains(search) ||
                (v.Location != null && v.Location.Contains(search)) ||
                (v.Department != null && v.Department.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(v => v.Status == status);

        return await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new VacancyListItemDto(
                v.Id,
                v.Title,
                v.Location,
                v.EmploymentType,
                v.ExperienceLevel,
                v.SalaryMin,
                v.SalaryMax,
                v.Status,
                v.Applications.Count,
                v.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<VacancyDto?> GetByIdAsync(int id)
    {
        var vacancy = await _context.Vacancies
            .AsNoTracking()
            .Include(v => v.CreatedBy)
            .Include(v => v.Applications)
            .FirstOrDefaultAsync(v => v.Id == id);

        return vacancy?.ToDto();
    }

    public async Task<VacancyDto> CreateAsync(CreateVacancyRequest request, int currentUserId)
    {
        var vacancy = request.ToEntity(currentUserId);

        _context.Vacancies.Add(vacancy);
        await _context.SaveChangesAsync();

        var created = await _context.Vacancies
            .AsNoTracking()
            .Include(v => v.CreatedBy)
            .Include(v => v.Applications)
            .FirstAsync(v => v.Id == vacancy.Id);

        return created.ToDto();
    }

    public async Task<VacancyDto?> UpdateAsync(int id, UpdateVacancyRequest request, int currentUserId)
    {
        var vacancy = await _context.Vacancies.FindAsync(id);
        if (vacancy == null) return null;

        vacancy.ApplyUpdate(request);
        await _context.SaveChangesAsync();

        // Перезагружаем для актуального ToDto
        var updated = await _context.Vacancies
            .AsNoTracking()
            .Include(v => v.CreatedBy)
            .Include(v => v.Applications)
            .FirstAsync(v => v.Id == id);

        return updated.ToDto();
    }

    public async Task<bool> SetArchivedAsync(int id, bool archived)
    {
        var vacancy = await _context.Vacancies.FindAsync(id);
        if (vacancy == null) return false;

        vacancy.IsArchived = archived;
        vacancy.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}