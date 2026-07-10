namespace BarsHr.Api.DTOs.Users;

public record UserAdminDto(
    int Id,
    string FullName,
    string Login,
    string? Email,
    string Role,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);
