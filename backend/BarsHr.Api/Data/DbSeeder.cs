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
            // дефолтный пул компетенций — по макету «Этап 2: Матрица компетенций»
            var pool = new (string Type, string Name, string Description)[]
            {
                (SkillTypes.Hard, "Знание Java (базовые концепции)", "ООП, коллекции, исключения"),
                (SkillTypes.Hard, "Алгоритмы и структуры данных", "Массивы, списки, карты, сложность"),
                (SkillTypes.Hard, "SQL (базовый уровень)", "SELECT, JOIN, WHERE, GROUP BY"),
                (SkillTypes.Hard, "Git (базовый уровень)", "Commit, push, pull, branch"),
                (SkillTypes.Hard, "Spring (базовые знания)", "Spring Boot, REST, DI"),
                (SkillTypes.Soft, "Обучаемость", "Способность быстро учиться"),
                (SkillTypes.Soft, "Коммуникация", "Умение объяснять и слушать"),
                (SkillTypes.Soft, "Решение проблем", "Логика и подход к задачам"),
                (SkillTypes.Soft, "Реакция на фидбек", "Восприятие обратной связи"),
                (SkillTypes.CultureFit, "Мотивация и интерес к работе", "Искренний интерес, а не зарплата"),
                (SkillTypes.CultureFit, "Командный игрок", "Умение помогать и договариваться"),
                (SkillTypes.CultureFit, "Ответственность", "Умение признавать ошибки"),
                (SkillTypes.CultureFit, "Ценности компании", "Разделяет взгляды компании"),
            };

            foreach (var (type, name, description) in pool)
                context.Skills.Add(new Skill { Name = name, Type = type, Description = description });

            await context.SaveChangesAsync();
        }

        var adminId = await context.Users
            .Where(u => u.Login == "admin")
            .Select(u => u.Id)
            .FirstAsync();

        var javaSkill = await context.Skills.FirstAsync(s => s.Name == "Знание Java (базовые концепции)");
        var sqlSkill = await context.Skills.FirstAsync(s => s.Name == "SQL (базовый уровень)");
        var algoSkill = await context.Skills.FirstAsync(s => s.Name == "Алгоритмы и структуры данных");
        var gitSkill = await context.Skills.FirstAsync(s => s.Name == "Git (базовый уровень)");
        var springSkill = await context.Skills.FirstAsync(s => s.Name == "Spring (базовые знания)");
        var communicationSkill = await context.Skills.FirstAsync(s => s.Name == "Коммуникация");
        var teamworkSkill = await context.Skills.FirstAsync(s => s.Name == "Командный игрок");
        var responsibilitySkill = await context.Skills.FirstAsync(s => s.Name == "Ответственность");
        var valuesSkill = await context.Skills.FirstAsync(s => s.Name == "Ценности компании");

        static Competency Comp(int skillId) => new() { SkillId = skillId, MaxScore = 5, IsActive = true };

        if (!await context.Vacancies.AnyAsync(v => v.Title == "Junior .NET Developer"))
        {
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
                    Comp(javaSkill.Id),
                    Comp(sqlSkill.Id),
                    Comp(gitSkill.Id),
                    Comp(communicationSkill.Id)
                }
            });
        }

        if (!await context.Vacancies.AnyAsync(v => v.Title == "Middle .NET Developer"))
        {
            context.Vacancies.Add(new Vacancy
            {
                Title = "Middle .NET Developer",
                Description = "Проектирование и разработка сервисов на .NET, участие в архитектурных решениях.",
                Responsibilities = "Разработка и рефакторинг модулей\nПроектирование API\nМенторинг младших разработчиков\nКод-ревью",
                Requirements = "Уверенный C# и SQL\nОпыт с ORM и REST\nПонимание алгоритмов",
                Skills = "C#\nSQL\nАлгоритмы и структуры данных\nGit",
                WorkFormat = "Гибрид",
                Location = "Казань",
                EmploymentType = "Full-time",
                ExperienceLevel = "Опыт >1 года",
                SalaryMin = 120000,
                SalaryMax = 180000,
                Department = "Разработка",
                PositionsCount = 1,
                CreatedById = adminId,
                Competencies =
                {
                    Comp(javaSkill.Id),
                    Comp(sqlSkill.Id),
                    Comp(algoSkill.Id),
                    Comp(gitSkill.Id),
                    Comp(communicationSkill.Id),
                    Comp(teamworkSkill.Id)
                }
            });
        }

        if (!await context.Vacancies.AnyAsync(v => v.Title == "Senior .NET Developer"))
        {
            context.Vacancies.Add(new Vacancy
            {
                Title = "Senior .NET Developer",
                Description = "Ведущая разработка и архитектура высоконагруженных сервисов на .NET.",
                Responsibilities = "Проектирование архитектуры\nТехническое лидерство\nСложный рефакторинг\nМенторинг команды",
                Requirements = "Глубокий C# и SQL\nОпыт проектирования архитектуры\nОпыт highload\nЛидерские качества",
                Skills = "C#\nSQL\nАлгоритмы и структуры данных\nGit",
                WorkFormat = "Удалёнка",
                Location = "Москва",
                EmploymentType = "Full-time",
                ExperienceLevel = "Опыт >3 лет",
                SalaryMin = 220000,
                SalaryMax = 320000,
                Department = "Разработка",
                PositionsCount = 1,
                CreatedById = adminId,
                Competencies =
                {
                    Comp(javaSkill.Id),
                    Comp(sqlSkill.Id),
                    Comp(algoSkill.Id),
                    Comp(gitSkill.Id),
                    Comp(springSkill.Id),
                    Comp(communicationSkill.Id),
                    Comp(teamworkSkill.Id),
                    Comp(responsibilitySkill.Id),
                    Comp(valuesSkill.Id)
                }
            });
        }

        await context.SaveChangesAsync();

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
                    Telegram = "@arina_skv",
                    Specialty = "Backend-разработчик",
                    AdditionalInfo = "Готова к переезду, доступна с понедельника",
                    Education = """[{"level":"Бакалавриат","institution":"КФУ","faculty":"Прикладная математика","start":"01.09.2015","end":"30.06.2019"}]""",
                    PreviousWork = """[{"company":"ООО «Некст»","position":"Junior-разработчик","start":"01.07.2019","end":"01.07.2022","info":"Backend на C#, интеграции REST"}]""",
                    Skills = "[\"C#\",\"SQL\",\"Git\"]",
                    CreatedById = hrId
                },
                new Candidate
                {
                    FullName = "Петров Виктор Сергеевич",
                    Phone = "+7 (900) 111-22-33",
                    City = "Казань",
                    Telegram = "@victor_petrov",
                    Specialty = "Разработчик .NET",
                    Education = """[{"level":"Специалитет","institution":"КНИТУ-КАИ","faculty":"Информатика","start":"01.09.2014","end":"30.06.2019"}]""",
                    PreviousWork = """[{"company":"ООО «ТехноСофт»","position":"Разработчик","start":"01.08.2019","end":"01.03.2024","info":"Поддержка и развитие сервисов"}]""",
                    Skills = "[\"C#\",\"SQL\"]",
                    CreatedById = hrId
                },
                new Candidate
                {
                    FullName = "Иванова Анастасия Олеговна",
                    Phone = "+7 (901) 222-33-44",
                    City = "Москва",
                    Telegram = "@ivanova_an",
                    Specialty = "Веб-разработчик",
                    Education = """[{"level":"Магистратура","institution":"МГУ","faculty":"Прикладная математика и информатика","start":"01.09.2016","end":"30.06.2021"}]""",
                    PreviousWork = """[{"company":"Фриланс","position":"Веб-разработчик","start":"01.09.2021","end":"01.05.2024","info":""}]""",
                    Skills = "[\"SQL\",\"Коммуникация\"]",
                    CreatedById = hrId
                }
            };
            context.Candidates.AddRange(candidates);
            await context.SaveChangesAsync();

            var applications = candidates
                .Select(c => new Application
                {
                    CandidateId = c.Id,
                    VacancyId = vacancy.Id,
                    CreatedById = hrId,
                    Status = ApplicationStatuses.New,
                    SubStatus = ApplicationStatuses.DefaultSubStatus(ApplicationStatuses.New)
                })
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
            applications[0].SubStatus = "Интервью назначено";
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
            applications[0].Status = ApplicationStatuses.Approved;
            applications[0].SubStatus = null;

            // третий отклик — отклонён (для формы отказа с фидбеком)
            applications[2].Status = ApplicationStatuses.Rejected;
            applications[2].SubStatus = null;
            applications[2].Notes = "Недостаточно опыта с C# для текущей позиции";

            await context.SaveChangesAsync();
        }
    }
}