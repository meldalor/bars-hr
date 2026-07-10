using BarsHr.Api.Data;
using BarsHr.Api.Domain;
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

    public async Task<List<UserAdminDto>> GetAllForManagementAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.FullName)
            .Select(u => new UserAdminDto(
                u.Id,
                u.FullName ?? u.Login,
                u.Login,
                u.Email,
                u.Role,
                u.IsActive,
                u.LastLoginAt,
                u.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<bool> ChangeRoleAsync(int id, string role)
    {
        if (!Roles.All.Contains(role))
            throw new ArgumentException($"Роль должна быть одной из: {string.Join(", ", Roles.All)}");

        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.Role = role;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetActiveAsync(int id, bool active)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.IsActive = active;
        await _context.SaveChangesAsync();
        return true;
    }
}