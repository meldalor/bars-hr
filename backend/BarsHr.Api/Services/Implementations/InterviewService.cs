using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.DTOs.Decisions;
using BarsHr.Api.Domain;
using BarsHr.Api.Domain.Entities;
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
                i.DurationMinutes,
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
            .Include(i => i.Evaluations).ThenInclude(e => e.Competency)!.ThenInclude(c => c!.Skill)
            .Include(i => i.Decision)!.ThenInclude(d => d!.MadeBy)
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
                .AnyAsync(u => u.Id == request.InterviewerId.Value);
            if (!interviewerOk)
                throw new ArgumentException("Интервьюер не найден");
        }

        var interview = request.ToEntity(currentUserId);
        _context.Interviews.Add(interview);

        // назначение интервью двигает отклик на стадию «Интервью» с подстатусом «Интервью назначено»
        if (application.Status is ApplicationStatuses.New or ApplicationStatuses.Testing or ApplicationStatuses.Interview)
        {
            application.Status = ApplicationStatuses.Interview;
            application.SubStatus = "Интервью назначено";
        }

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(interview.Id))!;
    }

    public async Task<InterviewDto?> UpdateAsync(int id, UpdateInterviewRequest request, int currentUserId)
    {
        var interview = await _context.Interviews.FirstOrDefaultAsync(i => i.Id == id);
        if (interview == null) return null;

        if (request.InterviewerId.HasValue)
        {
            var interviewerOk = await _context.Users
                .AnyAsync(u => u.Id == request.InterviewerId.Value);
            if (!interviewerOk)
                throw new ArgumentException("Интервьюер не найден");
            interview.InterviewerId = request.InterviewerId;
        }

        if (request.ScheduledAt.HasValue) interview.ScheduledAt = request.ScheduledAt.Value;
        if (request.DurationMinutes is > 0) interview.DurationMinutes = request.DurationMinutes.Value;
        if (request.Plan != null) interview.Plan = request.Plan;

        interview.UpdatedAt = DateTime.UtcNow;
        interview.UpdatedById = currentUserId;
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    // отмена = удаление, но только пока нет решения; каскад безопасен (оценок/решения нет)
    public async Task<bool> CancelAsync(int id, int currentUserId)
    {
        var interview = await _context.Interviews
            .Include(i => i.Application)
            .Include(i => i.Decision)
            .FirstOrDefaultAsync(i => i.Id == id);
        if (interview == null) return false;

        if (interview.Decision != null)
            throw new InvalidOperationException("Нельзя отменить интервью с вынесенным решением");

        // если других интервью не осталось — отклик остаётся на стадии «Интервью», но ждёт нового назначения
        if (interview.Application is { Status: ApplicationStatuses.Interview })
        {
            var hasOther = await _context.Interviews
                .AnyAsync(i => i.ApplicationId == interview.ApplicationId && i.Id != id);
            if (!hasOther)
                interview.Application.SubStatus = ApplicationStatuses.DefaultSubStatus(ApplicationStatuses.Interview);
        }

        _context.Interviews.Remove(interview);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<DecisionDto?> MakeDecisionAsync(
        int interviewId, 
        CreateDecisionRequest request, 
        int currentUserId)
    {
        if (!DecisionTypes.All.Contains(request.DecisionType))
            throw new ArgumentException(
                $"Тип решения должен быть одним из: {string.Join(", ", DecisionTypes.All)}");

        var interview = await _context.Interviews
            .Include(i => i.Application)
            .Include(i => i.Decision)
                .ThenInclude(d => d!.MadeBy)
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null)
            return null;

        Decision decision;

        if (interview.Decision == null)
        {
            decision = request.ToEntity(interviewId, currentUserId);
            _context.Decisions.Add(decision);
            interview.Decision = decision;
        }
        else
        {
            decision = interview.Decision;
            decision.DecisionType = request.DecisionType;
            decision.Comment = request.Comment;
            decision.MadeById = currentUserId;
            decision.MadeAt = DateTime.UtcNow;
        }

        interview.Status = request.DecisionType == DecisionTypes.Accepted ? "Completed" : "Rejected";
        interview.UpdatedAt = DateTime.UtcNow;

        // решение по интервью двигает статус отклика в финальный, подстатус у финальных пуст
        if (interview.Application != null)
        {
            interview.Application.Status = request.DecisionType == DecisionTypes.Accepted
                ? ApplicationStatuses.Approved
                : ApplicationStatuses.Rejected;
            interview.Application.SubStatus = null;
        }

        await _context.SaveChangesAsync();

        // перезагрузка с автором: у только что созданного решения nav MadeBy ещё не подтянут
        var saved = await _context.Decisions
            .AsNoTracking()
            .Include(d => d.MadeBy)
            .FirstAsync(d => d.Id == decision.Id);

        return saved.ToDto();
    }
}
