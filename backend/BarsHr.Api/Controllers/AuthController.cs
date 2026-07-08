using BarsHr.Api.Data;
using BarsHr.Api.Domain;
using BarsHr.Api.Domain.Entities;
using BarsHr.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BarsHr.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly BarsHrDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(BarsHrDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // самостоятельной регистрации по ТЗ нет — пользователей заводит админ
        [Authorize(Roles = Roles.Admin)]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Логин и пароль обязательны");

            if (model.Password.Length < 6)
                return BadRequest("Пароль должен быть не менее 6 символов");

            if (!Roles.All.Contains(model.Role))
                return BadRequest($"Роль должна быть одной из: {string.Join(", ", Roles.All)}");

            if (await _context.Users.AnyAsync(u => u.Login == model.Username))
                return BadRequest("Пользователь уже существует");

            var user = new User
            {
                Login = model.Username,
                FullName = string.IsNullOrWhiteSpace(model.FullName) ? model.Username : model.FullName,
                Role = model.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Пользователь зарегистрирован!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Логин и пароль обязательны");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Username);

            // Ответ одинаковый для «нет пользователя» и «неверный пароль» —
            // чтобы перебором нельзя было выяснить существующие логины
            if (user == null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Неверный логин или пароль");

            var jwt = _config.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwt["Key"]!);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Login),
                // без claim'а роли [Authorize(Roles = ...)] работать не будет
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["LifetimeMinutes"] ?? "120")),
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256)
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = tokenString, role = user.Role, fullName = user.FullName });
        }
    }
}
