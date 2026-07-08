using BarsHr.Api.Data;
using BarsHr.Api.Domain.Entities;
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
            .Include(v => v.Competencies).ThenInclude(c => c.Skill)
            .FirstOrDefaultAsync(v => v.Id == id);

        return vacancy?.ToDto();
    }

    public async Task<VacancyDto> CreateAsync(CreateVacancyRequest request, int currentUserId)
    {
        var vacancy = request.ToEntity(currentUserId);

        if (request.Competencies is { Count: > 0 })
            vacancy.Competencies = await BuildCompetenciesAsync(request.Competencies);

        _context.Vacancies.Add(vacancy);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(vacancy.Id))!;
    }

    public async Task<VacancyDto?> UpdateAsync(int id, UpdateVacancyRequest request, int currentUserId)
    {
        var vacancy = await _context.Vacancies.FindAsync(id);
        if (vacancy == null) return null;

        vacancy.ApplyUpdate(request);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    // полная замена матрицы: фронт присылает желаемый набор навыков целиком
    public async Task<VacancyDto?> SetCompetenciesAsync(int id, List<CompetencyItem> items)
    {
        var vacancy = await _context.Vacancies
            .Include(v => v.Competencies).ThenInclude(c => c.Skill)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (vacancy == null) return null;

        items ??= new List<CompetencyItem>();
        await ValidateCompetencyItemsAsync(items);

        var targetSkillIds = items.Select(i => i.SkillId).ToHashSet();
        var currentBySkill = vacancy.Competencies.ToDictionary(c => c.SkillId);

        // убрать компетенции, которых нет в целевом наборе; с оценками — нельзя
        foreach (var comp in vacancy.Competencies.ToList())
        {
            if (targetSkillIds.Contains(comp.SkillId)) continue;

            if (await _context.Evaluations.AnyAsync(e => e.CompetencyId == comp.Id))
                throw new InvalidOperationException(
                    $"По компетенции «{comp.Skill?.Name ?? comp.SkillId.ToString()}» уже есть оценки, её нельзя убрать");

            _context.Competencies.Remove(comp);
        }

        // добавить новые, у существующих обновить потолок и вернуть в активные
        foreach (var item in items)
        {
            if (currentBySkill.TryGetValue(item.SkillId, out var existing))
            {
                existing.MaxScore = item.MaxScore;
                existing.IsActive = true;
            }
            else
            {
                _context.Competencies.Add(new Competency
                {
                    VacancyId = id,
                    SkillId = item.SkillId,
                    MaxScore = item.MaxScore,
                    IsActive = true
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
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

    private async Task<List<Competency>> BuildCompetenciesAsync(List<CompetencyItem> items)
    {
        await ValidateCompetencyItemsAsync(items);

        return items.Select(i => new Competency
        {
            SkillId = i.SkillId,
            MaxScore = i.MaxScore,
            IsActive = true
        }).ToList();
    }

    // навыки берутся только из пула: существуют, активны, без дублей в пачке
    private async Task ValidateCompetencyItemsAsync(List<CompetencyItem> items)
    {
        var skillIds = items.Select(i => i.SkillId).ToList();
        if (skillIds.Count != skillIds.Distinct().Count())
            throw new ArgumentException("В матрице есть повторяющиеся навыки");

        var skills = await _context.Skills
            .Where(s => skillIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id);

        foreach (var item in items)
        {
            if (!skills.TryGetValue(item.SkillId, out var skill))
                throw new ArgumentException($"Навык с id {item.SkillId} не найден в пуле");
            if (!skill.IsActive)
                throw new ArgumentException($"Навык «{skill.Name}» в архиве и не может быть добавлен");
            if (item.MaxScore < 1)
                throw new ArgumentException("Максимальный балл должен быть не меньше 1");
        }
    }
}