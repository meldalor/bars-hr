namespace BarsHr.Api.DTOs.Users;

public record UserDropdownDto(
    int Id,
    string FullName,
    string Role
);