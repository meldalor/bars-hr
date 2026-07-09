namespace BarsHr.Api.DTOs.Applications;

public record UpdateApplicationStatusRequest(
    string Status,
    string? SubStatus
);
