using BarsHr.Api.Authorization;
using BarsHr.Api.Domain;
using BarsHr.Api.DTOs.Users;
using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDropdownDto>>> GetUsers()
    {
        var users = await _userService.GetUsersForDropdownAsync();
        return Ok(users);
    }

    [HttpGet("manage")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<ActionResult<List<UserAdminDto>>> GetAllForManagement()
    {
        var users = await _userService.GetAllForManagementAsync();
        return Ok(users);
    }

    [HttpPut("{id}/role")]
    [RequirePermission(Permissions.UsersManage)]
    public async Task<IActionResult> ChangeRole(int id, [FromBody] UpdateUserRoleRequest request)
    {
        if (id == User.GetUserId())
            return BadRequest(new { message = "Нельзя изменить собственную роль" });

        try
        {
            var found = await _userService.ChangeRoleAsync(id, request.Role);
            if (!found) return NotFound();
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
