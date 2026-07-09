namespace BarsHr.Api.DTOs.Users;

public record UserAdminDto(
    int Id,
    string FullName,
    string Login,
    string? Email,
    string Role,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);
