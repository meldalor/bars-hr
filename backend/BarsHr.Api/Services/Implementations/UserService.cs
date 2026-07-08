using BarsHr.Api.Data;
using BarsHr.Api.DTOs.Users;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class UserService : IUserService
{
    private readonly BarsHrDbContext _context;

    public UserService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDropdownDto>> GetActiveUsersForDropdownAsync()
    {
        return await _context.Users

            .AsNoTracking()

            .Where(u => u.IsActive)

            .OrderBy(u => u.FullName)

            .Select(u => new UserDropdownDto(
                u.Id,

                u.FullName ?? u.Login,

                u.Role
            ))
            .ToListAsync();
    }
}