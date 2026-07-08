using BarsHr.Api.Domain;
using BarsHr.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Data;

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
                existing.Role = role;
            }
        }

        await context.SaveChangesAsync();

        if (!await context.Skills.AnyAsync())
        {
            var hardSkills = new[] { "C#", "SQL", "Алгоритмы и структуры данных", "Git" };
            var softSkills = new[] { "Коммуникация", "Работа в команде", "Самостоятельность", "Обучаемость" };
            var cultureFitSkills = new[] { "Совпадение ценностей", "Гибкость", "Инициативность", "Клиентоориентированность" };

            foreach (var name in hardSkills)
                context.Skills.Add(new Skill { Name = name, Type = SkillTypes.Hard });

            foreach (var name in softSkills)
                context.Skills.Add(new Skill { Name = name, Type = SkillTypes.Soft });

            foreach (var name in cultureFitSkills)
                context.Skills.Add(new Skill { Name = name, Type = SkillTypes.CultureFit });

            await context.SaveChangesAsync();
        }

        if (!await context.Vacancies.AnyAsync())
        {
            var adminId = await context.Users
                .Where(u => u.Login == "admin")
                .Select(u => u.Id)
                .FirstAsync();

            var csharpSkill = await context.Skills.FirstAsync(s => s.Name == "C#");
            var sqlSkill = await context.Skills.FirstAsync(s => s.Name == "SQL");
            var communicationSkill = await context.Skills.FirstAsync(s => s.Name == "Коммуникация");

            context.Vacancies.Add(new Vacancy
            {
                Title = "Junior .NET Developer",
                Description = "Демо-вакансия для презентации",
                CreatedById = adminId,
                Competencies =
                {
                    new Competency { SkillId = csharpSkill.Id, MaxScore = 5, IsActive = true },
                    new Competency { SkillId = sqlSkill.Id, MaxScore = 5, IsActive = true },
                    new Competency { SkillId = communicationSkill.Id, MaxScore = 5, IsActive = true }
                }
            });

            await context.SaveChangesAsync();
        }
    }
}