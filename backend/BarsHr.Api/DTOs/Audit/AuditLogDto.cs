namespace BarsHr.Api.DTOs.Audit;

public record AuditLogDto(
    int Id,
    DateTime Timestamp,
    int? UserId,
    string? UserName,
    string? UserRole,
    string Action,
    string EntityName,
    int EntityId
);
