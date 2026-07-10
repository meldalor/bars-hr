using BarsHr.Api.DTOs.Users;

namespace BarsHr.Api.Services.Interfaces;

public interface IUserService
{
    Task<List<UserDropdownDto>> GetUsersForDropdownAsync();
    Task<List<UserAdminDto>> GetAllForManagementAsync();
    Task<bool> ChangeRoleAsync(int id, string role);
}
