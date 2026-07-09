using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Audit;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class AuditService : IAuditService
{
    private readonly BarsHrDbContext _context;

    public AuditService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogDto>> GetAsync(
        string? entityName = null,
        string? action = null,
        int? userId = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 50)
    {
        var query = _context.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityName))
            query = query.Where(a => a.EntityName == entityName);
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);
        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);
        if (from.HasValue)
            query = query.Where(a => a.Timestamp >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.Timestamp <= to.Value);

        return await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.Timestamp,
                a.UserId,
                a.User != null ? a.User.FullName : null,
                a.User != null ? a.User.Role : null,
                a.Action,
                a.EntityName,
                a.EntityId
            ))
            .ToListAsync();
    }
}
