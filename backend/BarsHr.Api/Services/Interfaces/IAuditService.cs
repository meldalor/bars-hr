using BarsHr.Api.DTOs.Audit;

namespace BarsHr.Api.Services.Interfaces;

public interface IAuditService
{
    Task<List<AuditLogDto>> GetAsync(
        string? entityName = null,
        string? action = null,
        int? userId = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 50);
}
