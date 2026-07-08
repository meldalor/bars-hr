using BarsHr.Api.Data;
using BarsHr.Api.Domain.Entities;
using BarsHr.Api.DTOs.Evaluations;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class EvaluationService : IEvaluationService
{
    private readonly BarsHrDbContext _context;
    private readonly IInterviewService _interviewService;

    public EvaluationService(BarsHrDbContext context, IInterviewService interviewService)
    {
        _context = context;
        _interviewService = interviewService;
    }

    public async Task<InterviewDto?> UpsertAsync(int interviewId, UpsertEvaluationsRequest request, int currentUserId)
    {
        var interview = await _context.Interviews
            .Include(i => i.Application)
            .Include(i => i.Evaluations)
            .FirstOrDefaultAsync(i => i.Id == interviewId);
        if (interview == null) return null;

        var duplicateIds = request.Evaluations
            .GroupBy(e => e.CompetencyId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();
        if (duplicateIds.Count > 0)
            throw new ArgumentException($"Компетенция указана дважды: {string.Join(", ", duplicateIds)}");

        // оценивать можно только по матрице вакансии, на которую откликнулся кандидат
        var matrix = await _context.Competencies
            .Where(c => c.VacancyId == interview.Application!.VacancyId && c.IsActive)
            .ToDictionaryAsync(c => c.Id);

        foreach (var item in request.Evaluations)
        {
            if (!matrix.TryGetValue(item.CompetencyId, out var competency))
                throw new ArgumentException($"Компетенция {item.CompetencyId} не входит в матрицу вакансии");

            if (item.Score < 1 || item.Score > competency.MaxScore)
                throw new ArgumentException(
                    $"Оценка по «{competency.Skill?.Name ?? "компетенции"}» должна быть от 1 до {competency.MaxScore}");

            var existing = interview.Evaluations.FirstOrDefault(e => e.CompetencyId == item.CompetencyId);
            if (existing != null)
            {
                existing.Score = item.Score;
                existing.Comment = item.Comment;
                existing.EvaluatedById = currentUserId;
                existing.EvaluatedAt = DateTime.UtcNow;
            }
            else
            {
                var evaluation = new Evaluation
                {
                    InterviewId = interview.Id,
                    CompetencyId = item.CompetencyId,
                    Score = item.Score,
                    Comment = item.Comment,
                    EvaluatedById = currentUserId
                };
                _context.Evaluations.Add(evaluation);
                interview.Evaluations.Add(evaluation);
            }
        }

        if (request.GeneralNotes != null)
            interview.GeneralNotes = request.GeneralNotes;

        interview.OverallScore = interview.Evaluations.Count > 0
            ? Math.Round((decimal)interview.Evaluations.Average(e => e.Score), 2)
            : null;
        interview.UpdatedAt = DateTime.UtcNow;
        interview.UpdatedById = currentUserId;

        await _context.SaveChangesAsync();

        return await _interviewService.GetByIdAsync(interviewId);
    }
}
