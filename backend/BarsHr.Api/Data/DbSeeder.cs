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
                Description = "Разработка и поддержка внутренних сервисов на .NET.",
                Responsibilities = "Разработка новых модулей\nИсправление ошибок\nУчастие в код-ревью",
                Requirements = "Базовые знания C# и SQL\nЖелание учиться",
                Skills = "C#\nSQL\nGit",
                WorkFormat = "Офис",
                Location = "Казань",
                EmploymentType = "Full-time",
                ExperienceLevel = "Без опыта",
                SalaryMin = 60000,
                SalaryMax = 90000,
                Department = "Разработка",
                PositionsCount = 2,
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

        // демо-кандидаты, отклики, интервью и оценки: без них фронт и PDF-документы пустые
        if (!await context.Applications.AnyAsync())
        {
            var hrId = await context.Users.Where(u => u.Login == "hr").Select(u => u.Id).FirstAsync();
            var decisionId = await context.Users.Where(u => u.Login == "decision").Select(u => u.Id).FirstAsync();

            var vacancy = await context.Vacancies
                .Include(v => v.Competencies)
                .OrderBy(v => v.Id)
                .FirstAsync();

            var candidates = new[]
            {
                new Candidate
                {
                    FullName = "Скворцова Арина Владимировна",
                    Phone = "+7 (900) 123-45-67",
                    City = "Казань",
                    Education = "Бакалавриат, КФУ, Прикладная математика (2015 – 2019)",
                    PreviousWork = "ООО «Некст» — Junior-разработчик (2019 – 2022): backend на C#, интеграции REST",
                    Skills = "[\"C#\",\"SQL\",\"Git\"]",
                    CreatedById = hrId
                },
                new Candidate
                {
                    FullName = "Петров Виктор Сергеевич",
                    Phone = "+7 (900) 111-22-33",
                    City = "Казань",
                    Education = "Специалитет, КНИТУ-КАИ, Информатика (2014 – 2019)",
                    PreviousWork = "ООО «ТехноСофт» — разработчик (2019 – 2024): поддержка и развитие сервисов",
                    Skills = "[\"C#\",\"SQL\"]",
                    CreatedById = hrId
                },
                new Candidate
                {
                    FullName = "Иванова Анастасия Олеговна",
                    Phone = "+7 (901) 222-33-44",
                    City = "Москва",
                    Education = "Магистратура, МГУ, Прикладная математика и информатика (2016 – 2021)",
                    PreviousWork = "Фриланс — веб-разработка (2021 – 2024)",
                    Skills = "[\"SQL\",\"Коммуникация\"]",
                    CreatedById = hrId
                }
            };
            context.Candidates.AddRange(candidates);
            await context.SaveChangesAsync();

            var applications = candidates
                .Select(c => new Application { CandidateId = c.Id, VacancyId = vacancy.Id, CreatedById = hrId, Status = "New" })
                .ToArray();
            context.Applications.AddRange(applications);
            await context.SaveChangesAsync();

            var interview1 = new Interview
            {
                ApplicationId = applications[0].Id,
                ScheduledAt = DateTime.UtcNow.Date.AddHours(11),
                Plan = "Знакомство, опыт, живое кодирование, вопросы по SQL и Git",
                Status = "Scheduled",
                CreatedById = hrId,
                InterviewerId = hrId
            };
            var interview2 = new Interview
            {
                ApplicationId = applications[1].Id,
                ScheduledAt = DateTime.UtcNow.Date.AddDays(1).AddHours(14),
                Plan = "Техническое интервью по C# и базам данных",
                Status = "Scheduled",
                CreatedById = hrId,
                InterviewerId = hrId
            };
            context.Interviews.AddRange(interview1, interview2);
            applications[0].Status = ApplicationStatuses.Interview;
            applications[1].Status = ApplicationStatuses.Interview;
            applications[1].SubStatus = "Интервью назначено";
            await context.SaveChangesAsync();

            // оценки по матрице первого интервью + положительное решение (для оффера)
            var comps = vacancy.Competencies.Where(c => c.IsActive).ToList();
            var scores = new[] { 5, 4, 5 };
            for (var i = 0; i < comps.Count; i++)
            {
                context.Evaluations.Add(new Evaluation
                {
                    InterviewId = interview1.Id,
                    CompetencyId = comps[i].Id,
                    Score = Math.Min(scores[i % scores.Length], comps[i].MaxScore),
                    Comment = "Уверенный ответ",
                    EvaluatedById = hrId
                });
            }
            interview1.GeneralNotes = "Сильный кандидат, соответствует требованиям. Рекомендую к найму.";
            interview1.Status = "Completed";
            if (comps.Count > 0)
                interview1.OverallScore = Math.Round(
                    (decimal)comps.Select((c, i) => (double)Math.Min(scores[i % scores.Length], c.MaxScore)).Average(), 2);

            context.Decisions.Add(new Decision
            {
                InterviewId = interview1.Id,
                DecisionType = "Accepted",
                Comment = "Кандидат принят, готовим оффер",
                MadeById = decisionId
            });
            applications[0].Status = "Approved";

            // третий отклик — отклонён (для формы отказа с фидбеком)
            applications[2].Status = "Rejected";
            applications[2].Notes = "Недостаточно опыта с C# для текущей позиции";

            await context.SaveChangesAsync();
        }
    }
}