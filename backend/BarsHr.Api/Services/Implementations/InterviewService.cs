using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class InterviewService : IInterviewService
{
    private readonly BarsHrDbContext _context;

    public InterviewService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<InterviewListItemDto>> GetAllAsync(string? scope = null, int? candidateId = null)
    {
        var query = _context.Interviews.AsNoTracking();

        if (candidateId.HasValue)
            query = query.Where(i => i.Application!.CandidateId == candidateId.Value);

        var now = DateTime.UtcNow;
        query = scope switch
        {
            "upcoming" => query.Where(i => i.ScheduledAt >= now).OrderBy(i => i.ScheduledAt),
            "past" => query.Where(i => i.ScheduledAt < now).OrderByDescending(i => i.ScheduledAt),
            _ => query.OrderByDescending(i => i.ScheduledAt)
        };

        return await query
            .Select(i => new InterviewListItemDto(
                i.Id,
                i.ApplicationId,
                i.Application!.Candidate!.FullName,
                i.Application!.Vacancy!.Title,
                i.ScheduledAt,
                i.Status,
                i.Interviewer != null ? i.Interviewer.FullName : null
            ))
            .ToListAsync();
    }

    public async Task<InterviewDto?> GetByIdAsync(int id)
    {
        var interview = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application)!.ThenInclude(a => a!.Candidate)
            .Include(i => i.Application)!.ThenInclude(a => a!.Vacancy)
            .Include(i => i.Interviewer)
            .Include(i => i.Evaluations).ThenInclude(e => e.Competency)
            .FirstOrDefaultAsync(i => i.Id == id);

        return interview?.ToDto();
    }

    public async Task<InterviewDto> CreateAsync(CreateInterviewRequest request, int currentUserId)
    {
        var application = await _context.Applications
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);
        if (application == null)
            throw new ArgumentException("Отклик не найден");

        if (request.InterviewerId.HasValue)
        {
            var interviewerOk = await _context.Users
                .AnyAsync(u => u.Id == request.InterviewerId.Value && u.IsActive);
            if (!interviewerOk)
                throw new ArgumentException("Интервьюер не найден или заблокирован");
        }

        var interview = request.ToEntity(currentUserId);
        _context.Interviews.Add(interview);

        // назначенная встреча означает, что отклик просмотрен;
        // статусы дальше Viewed (Approved/Rejected) не откатываем
        if (application.Status == "New")
            application.Status = "Viewed";

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(interview.Id))!;
    }
}
