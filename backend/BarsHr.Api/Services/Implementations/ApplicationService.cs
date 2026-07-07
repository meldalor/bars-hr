using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Applications;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class ApplicationService : IApplicationService
{
    private readonly BarsHrDbContext _context;

    public ApplicationService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<ApplicationDto>> GetAllAsync(int? candidateId = null, int? vacancyId = null)
    {
        var query = _context.Applications.AsNoTracking();

        if (candidateId.HasValue)
            query = query.Where(a => a.CandidateId == candidateId.Value);

        if (vacancyId.HasValue)
            query = query.Where(a => a.VacancyId == vacancyId.Value);

        // проекция в SQL: имена и счётчик без загрузки связанных сущностей в память
        return await query
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new ApplicationDto(
                a.Id,
                a.CandidateId,
                a.Candidate!.FullName,
                a.VacancyId,
                a.Vacancy!.Title,
                a.Status,
                a.Notes,
                a.AppliedAt,
                a.Interviews.Count
            ))
            .ToListAsync();
    }

    public async Task<ApplicationDto?> GetByIdAsync(int id)
    {
        var application = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Include(a => a.Vacancy)
            .Include(a => a.Interviews)
            .FirstOrDefaultAsync(a => a.Id == id);

        return application?.ToDto();
    }

    public async Task<ApplicationDto> CreateAsync(CreateApplicationRequest request, int currentUserId)
    {
        var candidateOk = await _context.Candidates
            .AnyAsync(c => c.Id == request.CandidateId && !c.IsArchived);
        if (!candidateOk)
            throw new ArgumentException("Кандидат не найден или в архиве");

        var vacancyOk = await _context.Vacancies
            .AnyAsync(v => v.Id == request.VacancyId && !v.IsArchived);
        if (!vacancyOk)
            throw new ArgumentException("Вакансия не найдена или в архиве");

        var duplicate = await _context.Applications
            .AnyAsync(a => a.CandidateId == request.CandidateId && a.VacancyId == request.VacancyId);
        if (duplicate)
            throw new InvalidOperationException("Отклик этого кандидата на эту вакансию уже существует");

        var application = request.ToEntity(currentUserId);
        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(application.Id))!;
    }
}
