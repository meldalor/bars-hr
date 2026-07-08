using BarsHr.Api.DTOs.Users;

namespace BarsHr.Api.Services.Interfaces;

public interface IUserService
{
    Task<List<UserDropdownDto>> GetActiveUsersForDropdownAsync();
}