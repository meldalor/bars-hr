using System.Text.Json;
using BarsHr.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Security.Claims;

namespace BarsHr.Api.Data;

// пишет журнал изменений доменных сущностей в audit_logs.
// два прохода: собираем в SavingChanges, реальный id создаваемых записей берём в SavedChanges.
public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _http;
    private readonly List<Pending> _pending = new();

    // чувствительные поля в журнал не пишем
    private static readonly HashSet<string> SkipProps = new() { "PasswordHash" };

    public AuditSaveChangesInterceptor(IHttpContextAccessor http) => _http = http;

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        Collect(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        Collect(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        FlushSync(eventData.Context);
        return base.SavedChanges(eventData, result);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        await FlushAsync(eventData.Context, cancellationToken);
        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    private void Collect(DbContext? context)
    {
        _pending.Clear();
        if (context == null) return;

        var userId = ResolveUserId();
        var ip = _http.HttpContext?.Connection?.RemoteIpAddress?.ToString();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog) continue;
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted)) continue;

            var action = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Deleted => "Deleted",
                _ => "Updated"
            };

            _pending.Add(new Pending
            {
                Entry = entry,
                EntityName = entry.Entity.GetType().Name,
                Action = action,
                // id создаваемой записи станет известен после сохранения → отложим
                EntityId = entry.State == EntityState.Added ? null : KeyValue(entry),
                OldValues = action == "Created" ? null : Serialize(entry, original: true),
                NewValues = action == "Deleted" ? null : Serialize(entry, original: false),
                UserId = userId,
                Ip = ip
            });
        }
    }

    private void FlushSync(DbContext? context)
    {
        var logs = BuildLogs(context);
        if (logs == null) return;
        context!.Set<AuditLog>().AddRange(logs);
        context.SaveChanges();
    }

    private async Task FlushAsync(DbContext? context, CancellationToken ct)
    {
        var logs = BuildLogs(context);
        if (logs == null) return;
        context!.Set<AuditLog>().AddRange(logs);
        await context.SaveChangesAsync(ct);
    }

    private List<AuditLog>? BuildLogs(DbContext? context)
    {
        if (context == null || _pending.Count == 0) return null;

        var now = DateTime.UtcNow;
        var logs = _pending.Select(p => new AuditLog
        {
            EntityName = p.EntityName,
            EntityId = p.EntityId ?? KeyValue(p.Entry),
            Action = p.Action,
            OldValues = p.OldValues,
            NewValues = p.NewValues,
            UserId = p.UserId,
            IpAddress = p.Ip,
            Timestamp = now
        }).ToList();

        _pending.Clear();
        return logs;
    }

    private int? ResolveUserId()
    {
        var raw = _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var id) ? id : null;
    }

    private static int KeyValue(EntityEntry entry)
    {
        var key = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
        return key?.CurrentValue is int value ? value : 0;
    }

    private static string? Serialize(EntityEntry entry, bool original)
    {
        var data = new Dictionary<string, object?>();
        foreach (var prop in entry.Properties)
        {
            var name = prop.Metadata.Name;
            if (SkipProps.Contains(name)) continue;
            data[name] = original ? prop.OriginalValue : prop.CurrentValue;
        }
        return data.Count == 0 ? null : JsonSerializer.Serialize(data);
    }

    private sealed class Pending
    {
        public required EntityEntry Entry { get; init; }
        public required string EntityName { get; init; }
        public required string Action { get; init; }
        public int? EntityId { get; init; }
        public string? OldValues { get; init; }
        public string? NewValues { get; init; }
        public int? UserId { get; init; }
        public string? Ip { get; init; }
    }
}
