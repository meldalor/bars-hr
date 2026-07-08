using System.Text.Json;
using BarsHr.Api.Data;
using BarsHr.Api.Domain;
using BarsHr.Api.Pdf;
using BarsHr.Api.Pdf.Documents;
using BarsHr.Api.Pdf.Models;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;

namespace BarsHr.Api.Services.Implementations;

public class DocumentService : IDocumentService
{
    private readonly BarsHrDbContext _context;

    public DocumentService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]?> GenerateRejectionAsync(int applicationId, int currentUserId)
    {
        var application = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Include(a => a.Vacancy)
            .Include(a => a.Interviews).ThenInclude(i => i.Decision)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
            return null;

        // фидбек берём из последнего решения по интервью отклика, иначе — из комментария к отклику
        var feedback = application.Interviews
            .Select(i => i.Decision)
            .Where(d => d != null && !string.IsNullOrWhiteSpace(d.Comment))
            .OrderByDescending(d => d!.MadeAt)
            .Select(d => d!.Comment)
            .FirstOrDefault()
            ?? application.Notes;

        var model = new RejectionModel(
            application.Candidate?.FullName ?? "—",
            application.Vacancy?.Title ?? "—",
            feedback,
            await GetHrNameAsync(currentUserId),
            DateTime.Now);

        return new RejectionDocument(model).GeneratePdf();
    }

    public async Task<byte[]?> GenerateInvitationAsync(int applicationId, int currentUserId)
    {
        var application = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Include(a => a.Vacancy)
            .Include(a => a.Interviews)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
            return null;

        // ближайшее предстоящее собеседование, иначе — последнее назначенное
        var scheduledAt = application.Interviews
            .Where(i => i.ScheduledAt >= DateTime.UtcNow)
            .OrderBy(i => i.ScheduledAt)
            .Select(i => (DateTime?)i.ScheduledAt)
            .FirstOrDefault()
            ?? application.Interviews
                .OrderByDescending(i => i.ScheduledAt)
                .Select(i => (DateTime?)i.ScheduledAt)
                .FirstOrDefault();

        var model = new InvitationModel(
            application.Candidate?.FullName ?? "—",
            application.Vacancy?.Title ?? "—",
            scheduledAt,
            await GetHrNameAsync(currentUserId),
            DateTime.Now);

        return new InvitationDocument(model).GeneratePdf();
    }

    public async Task<byte[]?> GenerateOfferAsync(int applicationId, int currentUserId)
    {
        var application = await _context.Applications
            .AsNoTracking()
            .Include(a => a.Candidate)
            .Include(a => a.Vacancy)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
            return null;

        var vacancy = application.Vacancy;
        var salary = vacancy == null
            ? null
            : PdfFormat.Salary(vacancy.SalaryMin, vacancy.SalaryMax, vacancy.Currency);

        var model = new OfferModel(
            application.Candidate?.FullName ?? "—",
            vacancy?.Title ?? "—",
            vacancy?.Department,
            salary,
            vacancy?.WorkFormat,
            vacancy?.Location,
            await GetHrNameAsync(currentUserId),
            DateTime.Now);

        return new OfferDocument(model).GeneratePdf();
    }

    public async Task<byte[]?> GenerateInterviewProtocolAsync(int interviewId)
    {
        var interview = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.Application)!.ThenInclude(a => a!.Candidate)
            .Include(i => i.Application)!.ThenInclude(a => a!.Vacancy)!
                .ThenInclude(v => v!.Competencies.Where(c => c.IsActive))!
                .ThenInclude(c => c.Skill)
            .Include(i => i.Interviewer)
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null)
            return null;

        var vacancyCompetencies = interview.Application?.Vacancy?.Competencies;
        var competencies = vacancyCompetencies == null
            ? new List<ProtocolCompetency>()
            : vacancyCompetencies
                .OrderBy(c => c.Skill!.Type)
                .ThenBy(c => c.Skill!.Name)
                .Select(c => new ProtocolCompetency(c.Skill!.Name, c.Skill.Type, c.MaxScore))
                .ToList();

        var model = new InterviewProtocolModel(
            interview.Application?.Candidate?.FullName ?? "—",
            interview.Application?.Vacancy?.Title ?? "—",
            interview.Interviewer?.FullName,
            interview.ScheduledAt,
            interview.Plan,
            InterviewDefaults.Questions,
            competencies);

        return new InterviewProtocolDocument(model).GeneratePdf();
    }

    public async Task<byte[]?> GenerateCandidateCardAsync(int candidateId)
    {
        var candidate = await _context.Candidates
            .AsNoTracking()
            .Include(c => c.Applications).ThenInclude(a => a.Vacancy)
            .FirstOrDefaultAsync(c => c.Id == candidateId);

        if (candidate == null)
            return null;

        var applications = candidate.Applications
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new CandidateApplication(a.Vacancy?.Title ?? "—", a.Status, a.AppliedAt))
            .ToList();

        var model = new CandidateCardModel(
            candidate.FullName,
            candidate.Phone,
            candidate.City,
            candidate.Education,
            candidate.PreviousWork,
            ParseSkills(candidate.Skills),
            applications);

        return new CandidateCardDocument(model).GeneratePdf();
    }

    // навыки хранятся в JSONB: обычно массив строк, но терпим и произвольный текст
    private static List<string> ParseSkills(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new List<string>();

        try
        {
            var skills = JsonSerializer.Deserialize<List<string>>(json);
            if (skills != null)
                return skills.Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
        }
        catch (JsonException)
        {
        }

        return new List<string> { json };
    }

    private async Task<string> GetHrNameAsync(int userId) =>
        await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.FullName)
            .FirstOrDefaultAsync()
        ?? "—";
}
