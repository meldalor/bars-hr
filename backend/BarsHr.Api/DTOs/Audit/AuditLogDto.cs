namespace BarsHr.Api.DTOs.Audit;

public record AuditLogDto(
    int Id,
    DateTime Timestamp,
    int? UserId,
    string? UserName,
    string? UserRole,
    string Action,
    string EntityName,
    int EntityId,
    // человекочитаемые детали: «Иванова Алиса → Оффер», «Петров Виктор → 29.06.26 11:00»
    string? Details
);
