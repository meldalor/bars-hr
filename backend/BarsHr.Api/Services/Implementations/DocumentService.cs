using BarsHr.Api.Data;
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

        var hrName = await _context.Users
            .Where(u => u.Id == currentUserId)
            .Select(u => u.FullName)
            .FirstOrDefaultAsync();

        var model = new RejectionModel(
            application.Candidate?.FullName ?? "—",
            application.Vacancy?.Title ?? "—",
            feedback,
            hrName ?? "—",
            DateTime.Now);

        return new RejectionDocument(model).GeneratePdf();
    }
}
