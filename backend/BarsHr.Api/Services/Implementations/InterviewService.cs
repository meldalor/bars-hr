using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.DTOs.Evaluations;
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

    public async Task<InterviewDto?> GetByIdAsync(int id)
    {
        var interview = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Evaluations)
            .FirstOrDefaultAsync(i => i.Id == id);

        return interview?.ToDto();
    }

    public async Task<List<InterviewDto>> GetByApplicationIdAsync(int applicationId)
    {
        var interviews = await _context.Interviews
            .AsNoTracking()
            .Where(i => i.ApplicationId == applicationId)
            .Include(i => i.Evaluations)
            .OrderByDescending(i => i.ScheduledAt)
            .ToListAsync();

        return interviews.Select(i => i.ToDto()).ToList();
    }

    public async Task<InterviewDto> CreateAsync(CreateInterviewRequest request, int currentUserId)
    {
        var interview = request.ToEntity(currentUserId);

        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

        return interview.ToDto();
    }

    public async Task<InterviewDto?> UpdateAsync(int id, UpdateInterviewRequest request, int currentUserId)
    {
        var interview = await _context.Interviews.FindAsync(id);
        if (interview == null) return null;

        interview.ApplyUpdate(request);
        await _context.SaveChangesAsync();

        return interview.ToDto();
    }

    public async Task<EvaluationDto> AddEvaluationAsync(int interviewId, CreateEvaluationRequest request, int currentUserId)
    {
        var interview = await _context.Interviews.FindAsync(interviewId);
        if (interview == null)
            throw new ArgumentException("Собеседование не найдено");

        var evaluation = request.ToEntity(currentUserId);
        evaluation.InterviewId = interviewId;   

        _context.Evaluations.Add(evaluation);
        await _context.SaveChangesAsync();

        return evaluation.ToDto();
    }
}