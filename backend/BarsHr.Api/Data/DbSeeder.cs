using BarsHr.Api.Domain;
using BarsHr.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Data;

// идемпотентный сид: на чистой БД без него невозможно войти (register закрыт под админа)
public static class DbSeeder
{
    public static async Task SeedAsync(BarsHrDbContext context)
    {
        var users = new (string Login, string Password, string FullName, string Role)[]
        {
            ("admin", "Admin123!", "Администратор", Roles.Admin),
            ("hr", "Hr123456!", "HR-менеджер", Roles.HR),
            ("decision", "Decision123!", "Руководитель направления", Roles.DecisionMaker)
        };

        foreach (var (login, password, fullName, role) in users)
        {
            var existing = await context.Users.FirstOrDefaultAsync(u => u.Login == login);
            if (existing == null)
            {
                context.Users.Add(new User
                {
                    Login = login,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    FullName = fullName,
                    Role = role
                });
            }
            else if (existing.Role != role)
            {
                // ранний register заводил всех с ролью HR — выравниваем под сид
                existing.Role = role;
            }
        }

        await context.SaveChangesAsync();

        // демо-вакансия с матрицей компетенций — только на пустой БД, рабочие данные не трогаем
        if (!await context.Vacancies.AnyAsync())
        {
            var adminId = await context.Users
                .Where(u => u.Login == "admin")
                .Select(u => u.Id)
                .FirstAsync();

            context.Vacancies.Add(new Vacancy
            {
                Title = "Junior .NET Developer",
                Description = "Демо-вакансия для презентации",
                CreatedById = adminId,
                Competencies =
                {
                    new Competency { Name = "C# basics", Category = "Hard Skills" },
                    new Competency { Name = "SQL", Category = "Hard Skills" },
                    new Competency { Name = "Communication", Category = "Soft Skills" }
                }
            });

            await context.SaveChangesAsync();
        }
    }
}
