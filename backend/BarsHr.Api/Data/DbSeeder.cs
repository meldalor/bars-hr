using System.Text.Json;
using BarsHr.Api.Domain;
using BarsHr.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Data;

public static class DbSeeder
{
    private enum Profile
    {
        NewContact,
        NewWait,
        TestSent,
        TestReview,
        InterviewScheduled,
        Pending,
        Approved,
        Offer,
        OfferAccepted,
        RejectAfterTest,
        RejectAfterInterview
    }

    public static async Task SeedAsync(BarsHrDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        var now = DateTime.UtcNow;
        var audits = new List<AuditLog>();

        void Log(string entity, int entityId, string action, int userId, DateTime ts, object? newValues, object? oldValues = null)
        {
            audits.Add(new AuditLog
            {
                EntityName = entity,
                EntityId = entityId,
                Action = action,
                NewValues = newValues is null ? null : JsonSerializer.Serialize(newValues),
                OldValues = oldValues is null ? null : JsonSerializer.Serialize(oldValues),
                UserId = userId,
                Timestamp = ts
            });
        }

        static DateTime AtHour(DateTime day, int hour, int minute = 0) =>
            new(day.Year, day.Month, day.Day, Math.Clamp(hour, 0, 23), Math.Clamp(minute, 0, 59), 0, DateTimeKind.Utc);

        var admin = new User
        {
            Login = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FullName = "Соколов Дмитрий Андреевич",
            Role = Roles.Admin,
            CreatedAt = now.AddDays(-78)
        };
        var hr = new User
        {
            Login = "hr",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Hr123456!"),
            FullName = "Морозова Елена Викторовна",
            Role = Roles.HR,
            CreatedAt = now.AddDays(-77)
        };
        var decisionMaker = new User
        {
            Login = "decision",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Decision123!"),
            FullName = "Ковалёв Игорь Николаевич",
            Role = Roles.DecisionMaker,
            CreatedAt = now.AddDays(-76)
        };
        context.Users.AddRange(admin, hr, decisionMaker);
        await context.SaveChangesAsync();

        Log("User", hr.Id, "Created", admin.Id, hr.CreatedAt, new { hr.FullName, hr.Login });
        Log("User", decisionMaker.Id, "Created", admin.Id, decisionMaker.CreatedAt, new { decisionMaker.FullName, decisionMaker.Login });

        var skillDefs = new (string Type, string Name, string Description)[]
        {
            (SkillTypes.Hard, "C# / .NET", "Синтаксис, ООП, LINQ, async/await"),
            (SkillTypes.Hard, "SQL", "Запросы, JOIN, индексы, транзакции"),
            (SkillTypes.Hard, "Git", "Ветвление, merge, pull request"),
            (SkillTypes.Hard, "Алгоритмы и структуры данных", "Сложность, коллекции, поиск и сортировка"),
            (SkillTypes.Soft, "Коммуникация", "Ясно объясняет и слушает собеседника"),
            (SkillTypes.Soft, "Работа в команде", "Взаимодействие и взаимопомощь в команде"),
            (SkillTypes.Soft, "Обучаемость", "Быстро осваивает новые технологии"),
            (SkillTypes.Soft, "Решение проблем", "Логика и системный подход к задачам"),
            (SkillTypes.CultureFit, "Ответственность", "Доводит задачи до результата"),
            (SkillTypes.CultureFit, "Ценности компании", "Разделяет подход и культуру команды")
        };
        var skills = skillDefs
            .Select(d => new Skill { Name = d.Name, Type = d.Type, Description = d.Description, IsActive = true })
            .ToList();
        context.Skills.AddRange(skills);
        await context.SaveChangesAsync();

        var byName = skills.ToDictionary(s => s.Name);
        var skillsBaseTs = now.AddDays(-72);
        for (var i = 0; i < skills.Count; i++)
            Log("Skill", skills[i].Id, "Created", admin.Id, skillsBaseTs.AddMinutes(i * 3), new { skills[i].Name });

        var core = new[] { "Коммуникация", "Работа в команде", "Обучаемость", "Ответственность", "Решение проблем" };
        List<Competency> Comps(params string[] tech) =>
            core.Concat(tech).Distinct()
                .Select(name => new Competency { SkillId = byName[name].Id, MaxScore = 5, IsActive = true })
                .ToList();

        Profile[] ActiveSlots(int vi) => new[]
        {
            Profile.NewContact, Profile.NewWait, Profile.TestSent, Profile.TestReview,
            Profile.InterviewScheduled, Profile.InterviewScheduled, Profile.Pending, Profile.Approved,
            Profile.Offer, vi % 2 == 0 ? Profile.RejectAfterInterview : Profile.RejectAfterTest
        };
        var closedSlots = new[]
        {
            Profile.OfferAccepted, Profile.Approved, Profile.Pending,
            Profile.RejectAfterInterview, Profile.RejectAfterInterview,
            Profile.RejectAfterTest, Profile.RejectAfterTest, Profile.RejectAfterTest,
            Profile.TestReview, Profile.NewWait
        };

        var vacancyPlans = new List<(Vacancy V, bool Closed, DateTime? ClosedAt, Profile[] Slots)>();
        var activeIndex = 0;

        Vacancy MakeVacancy(string title, string dept, string location, string workFormat, string exp,
            int sMin, int sMax, int positions, string desc, string resp, string req, string skillsText,
            int createdDaysAgo, string[] tech) => new()
        {
            Title = title,
            Description = desc,
            Responsibilities = resp,
            Requirements = req,
            Skills = skillsText,
            WorkFormat = workFormat,
            Location = location,
            EmploymentType = "Full-time",
            ExperienceLevel = exp,
            SalaryMin = sMin,
            SalaryMax = sMax,
            Department = dept,
            PositionsCount = positions,
            CreatedById = admin.Id,
            CreatedAt = AtHour(now.AddDays(-createdDaysAgo), 10),
            Status = "Open",
            Competencies = Comps(tech)
        };

        void AddActive(Vacancy v)
        {
            vacancyPlans.Add((v, false, null, ActiveSlots(activeIndex)));
            activeIndex++;
        }

        void AddClosed(Vacancy v, int closedDaysAgo)
        {
            vacancyPlans.Add((v, true, AtHour(now.AddDays(-closedDaysAgo), 16), closedSlots));
        }

        AddActive(MakeVacancy(
            "Junior .NET-разработчик", "Разработка", "Казань", "Офис", "Без опыта",
            60000, 90000, 2,
            "Разработка и поддержка внутренних сервисов на .NET под руководством наставника.",
            "Разработка новых модулей\nИсправление ошибок\nУчастие в код-ревью",
            "Базовые знания C# и SQL\nПонимание ООП\nЖелание учиться",
            "C# / .NET\nSQL\nGit", 58, new[] { "C# / .NET", "SQL", "Git" }));

        AddActive(MakeVacancy(
            "Middle .NET-разработчик", "Разработка", "Казань", "Гибрид", "Опыт от 1 года",
            120000, 180000, 1,
            "Проектирование и разработка сервисов на .NET, участие в архитектурных решениях.",
            "Разработка и рефакторинг модулей\nПроектирование API\nКод-ревью",
            "Уверенный C# и SQL\nОпыт с ORM и REST\nПонимание алгоритмов",
            "C# / .NET\nSQL\nАлгоритмы и структуры данных\nGit", 54,
            new[] { "C# / .NET", "SQL", "Git", "Алгоритмы и структуры данных" }));

        AddActive(MakeVacancy(
            "Senior .NET-разработчик", "Разработка", "Москва", "Удалёнка", "Опыт от 3 лет",
            220000, 320000, 1,
            "Ведущая разработка и архитектура высоконагруженных сервисов на .NET.",
            "Проектирование архитектуры\nТехническое лидерство\nМенторинг команды",
            "Глубокий C# и SQL\nОпыт проектирования архитектуры\nОпыт highload",
            "C# / .NET\nSQL\nАлгоритмы и структуры данных\nGit", 50,
            new[] { "C# / .NET", "SQL", "Алгоритмы и структуры данных", "Git" }));

        AddActive(MakeVacancy(
            "Frontend-разработчик (React)", "Разработка", "Казань", "Гибрид", "Опыт от 1 года",
            130000, 190000, 1,
            "Разработка пользовательских интерфейсов веб-приложения на React.",
            "Вёрстка и разработка компонентов\nИнтеграция с REST API\nКод-ревью",
            "Уверенный JavaScript и React\nЗнание HTML/CSS\nОпыт с Git",
            "JavaScript\nReact\nTypeScript\nGit", 46, new[] { "Git", "Алгоритмы и структуры данных" }));

        AddActive(MakeVacancy(
            "QA-инженер", "Тестирование", "Казань", "Офис", "Опыт от 1 года",
            90000, 140000, 1,
            "Ручное и частично автоматизированное тестирование продуктов компании.",
            "Написание тест-кейсов\nПроверка релизов\nОформление багов",
            "Опыт ручного тестирования\nЗнание SQL\nВнимательность",
            "Тест-кейсы\nSQL\nPostman\nGit", 42, new[] { "SQL", "Git" }));

        AddActive(MakeVacancy(
            "Системный аналитик", "Аналитика", "Москва", "Удалёнка", "Опыт от 2 лет",
            150000, 210000, 1,
            "Сбор требований, постановка задач разработке, описание процессов.",
            "Сбор и анализ требований\nОписание процессов (BPMN/UML)\nПостановка задач",
            "Опыт системного анализа\nBPMN и UML\nБазовый SQL",
            "BPMN\nUML\nSQL\nПостановка задач", 38, new[] { "SQL" }));

        AddActive(MakeVacancy(
            "DevOps-инженер", "Инфраструктура", "Москва", "Удалёнка", "Опыт от 3 лет",
            200000, 280000, 1,
            "Построение и поддержка CI/CD, контейнеризация и мониторинг сервисов.",
            "Настройка CI/CD\nКонтейнеризация (Docker)\nМониторинг и алерты",
            "Опыт с Docker и Linux\nCI/CD пайплайны\nСкриптинг",
            "Docker\nCI/CD\nLinux\nGit", 32, new[] { "Git", "SQL" }));

        AddActive(MakeVacancy(
            "UX/UI-дизайнер", "Дизайн", "Казань", "Гибрид", "Опыт от 1 года",
            110000, 160000, 1,
            "Проектирование интерфейсов и пользовательских сценариев продукта.",
            "Проектирование макетов в Figma\nUX-исследования\nПрототипирование",
            "Портфолио\nОпыт в Figma\nПонимание UX-принципов",
            "Figma\nUX-исследования\nПрототипирование", 28, Array.Empty<string>()));

        AddClosed(MakeVacancy(
            "Технический писатель", "Документация", "Казань", "Удалёнка", "Опыт от 1 года",
            90000, 130000, 1,
            "Подготовка и поддержка технической документации продуктов.",
            "Написание документации\nПоддержка базы знаний\nРабота с разработкой",
            "Грамотная письменная речь\nОпыт с Markdown\nВнимание к деталям",
            "Технические тексты\nMarkdown\nGit", 72, new[] { "Git" }), 18);

        AddClosed(MakeVacancy(
            "Продуктовый аналитик", "Аналитика", "Москва", "Гибрид", "Опыт от 2 лет",
            140000, 200000, 1,
            "Анализ продуктовых метрик, гипотез и результатов экспериментов.",
            "Анализ метрик продукта\nПодготовка отчётов\nA/B-тесты",
            "Опыт продуктовой аналитики\nУверенный SQL\nСтатистика",
            "Аналитика продукта\nSQL\nA/B-тесты", 68, new[] { "SQL" }), 14);

        context.Vacancies.AddRange(vacancyPlans.Select(p => p.V));
        await context.SaveChangesAsync();

        foreach (var plan in vacancyPlans)
            Log("Vacancy", plan.V.Id, "Created", admin.Id, plan.V.CreatedAt, new { plan.V.Title });

        var surnames = new (string M, string F)[]
        {
            ("Иванов", "Иванова"), ("Смирнов", "Смирнова"), ("Кузнецов", "Кузнецова"), ("Попов", "Попова"),
            ("Волков", "Волкова"), ("Лебедев", "Лебедева"), ("Козлов", "Козлова"), ("Новиков", "Новикова"),
            ("Алексеев", "Алексеева"), ("Егоров", "Егорова"), ("Павлов", "Павлова"), ("Никитин", "Никитина"),
            ("Орлов", "Орлова"), ("Андреев", "Андреева"), ("Макаров", "Макарова"), ("Никифоров", "Никифорова"),
            ("Захаров", "Захарова"), ("Зайцев", "Зайцева"), ("Соловьёв", "Соловьёва"), ("Борисов", "Борисова"),
            ("Яковлев", "Яковлева"), ("Григорьев", "Григорьева"), ("Романов", "Романова"), ("Воробьёв", "Воробьёва"),
            ("Сергеев", "Сергеева"), ("Кузьмин", "Кузьмина"), ("Фролов", "Фролова"), ("Беляев", "Беляева"),
            ("Тарасов", "Тарасова"), ("Белов", "Белова"), ("Комаров", "Комарова"), ("Гусев", "Гусева")
        };
        var maleNames = new[]
        {
            "Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей", "Артём", "Илья",
            "Кирилл", "Михаил", "Никита", "Егор", "Роман", "Владимир", "Павел", "Денис",
            "Антон", "Тимофей", "Олег", "Виктор"
        };
        var maleParts = new[]
        {
            "Александрович", "Дмитриевич", "Сергеевич", "Андреевич", "Алексеевич", "Михайлович",
            "Иванович", "Николаевич", "Павлович", "Викторович", "Олегович", "Романович",
            "Максимович", "Егорович", "Денисович"
        };
        var femaleNames = new[]
        {
            "Анна", "Мария", "Елена", "Ольга", "Наталья", "Ирина", "Екатерина", "Татьяна",
            "Юлия", "Светлана", "Дарья", "Анастасия", "Ксения", "Виктория", "Полина", "Алина",
            "Марина", "Вероника", "София", "Валентина"
        };
        var femaleParts = new[]
        {
            "Александровна", "Дмитриевна", "Сергеевна", "Андреевна", "Алексеевна", "Михайловна",
            "Ивановна", "Николаевна", "Павловна", "Викторовна", "Олеговна", "Романовна",
            "Максимовна", "Егоровна", "Денисовна"
        };

        var used = new HashSet<string> { admin.FullName!, hr.FullName!, decisionMaker.FullName! };
        var names = new List<string>();
        for (var i = 0; names.Count < 100; i++)
        {
            var sur = surnames[(i * 7) % surnames.Length];
            string full;
            if (i % 2 == 0)
                full = $"{sur.M} {maleNames[(i * 3) % maleNames.Length]} {maleParts[(i * 11) % maleParts.Length]}";
            else
                full = $"{sur.F} {femaleNames[(i * 3) % femaleNames.Length]} {femaleParts[(i * 11) % femaleParts.Length]}";

            if (used.Add(full))
                names.Add(full);
        }

        var universities = new[] { "КФУ", "КНИТУ-КАИ", "МГУ", "МФТИ", "ИТМО", "ВШЭ", "СПбГУ", "УрФУ" };
        var companies = new[]
        {
            "ООО «Некст»", "ООО «ТехноСофт»", "ООО «Дата Лаб»", "Фриланс",
            "ООО «Веб Про»", "ООО «Софт Лайн»", "ООО «Диджитал»", "ООО «Про Код»"
        };

        static (string Status, string? Sub)[] BuildSteps(Profile p)
        {
            var contact = (ApplicationStatuses.New, (string?)"Связь с кандидатом");
            var wait = (ApplicationStatuses.New, (string?)"Ожидание ответа кандидата");
            var testSent = (ApplicationStatuses.Testing, (string?)"ТЗ отправлено");
            var testReview = (ApplicationStatuses.Testing, (string?)"ТЗ на проверке");
            var testPassed = (ApplicationStatuses.Testing, (string?)"ТЗ пройдено");
            var testFailed = (ApplicationStatuses.Testing, (string?)"ТЗ не пройдено");
            var ivNeed = (ApplicationStatuses.Interview, (string?)"Назначить интервью");
            var ivSet = (ApplicationStatuses.Interview, (string?)"Интервью назначено");
            var pending = (ApplicationStatuses.Pending, (string?)null);
            var approved = (ApplicationStatuses.Approved, (string?)null);
            var rejected = (ApplicationStatuses.Rejected, (string?)null);
            var offerNot = (ApplicationStatuses.Offer, (string?)"Не отправлен");
            var offerSent = (ApplicationStatuses.Offer, (string?)"Отправлен");
            var offerWait = (ApplicationStatuses.Offer, (string?)"Ожидание ответа");
            var offerAccepted = (ApplicationStatuses.Offer, (string?)ApplicationStatuses.OfferAccepted);

            return p switch
            {
                Profile.NewContact => new[] { contact },
                Profile.NewWait => new[] { contact, wait },
                Profile.TestSent => new[] { contact, testSent },
                Profile.TestReview => new[] { contact, testSent, testReview },
                Profile.InterviewScheduled => new[] { contact, testSent, testPassed, ivNeed, ivSet },
                Profile.Pending => new[] { contact, testSent, testPassed, ivNeed, ivSet, pending },
                Profile.Approved => new[] { contact, testSent, testPassed, ivNeed, ivSet, pending, approved },
                Profile.Offer => new[] { contact, testSent, testPassed, ivNeed, ivSet, pending, approved, offerNot, offerSent },
                Profile.OfferAccepted => new[] { contact, testSent, testPassed, ivNeed, ivSet, pending, approved, offerNot, offerSent, offerWait, offerAccepted },
                Profile.RejectAfterTest => new[] { contact, testSent, testFailed, rejected },
                Profile.RejectAfterInterview => new[] { contact, testSent, testPassed, ivNeed, ivSet, pending, rejected },
                _ => Array.Empty<(string, string?)>()
            };
        }

        static int ScoreFor(Profile p, int compIndex) => Math.Clamp(p switch
        {
            Profile.Approved or Profile.Offer or Profile.OfferAccepted => 5 - compIndex % 2,
            Profile.Pending => 4 - compIndex % 2,
            Profile.RejectAfterInterview => 2 + compIndex % 2,
            _ => 3
        }, 1, 5);

        static string NotesFor(Profile p) => p switch
        {
            Profile.Approved or Profile.Offer or Profile.OfferAccepted => "Сильный кандидат, соответствует требованиям. Рекомендуем к найму.",
            Profile.Pending => "Хорошее впечатление, ожидаем итогового решения.",
            Profile.RejectAfterInterview => "Недостаточный уровень по ключевым компетенциям.",
            _ => ""
        };

        async Task ProcessApplicationAsync(Vacancy vacancy, List<Competency> vacComps, string fullName, int slot, Profile profile, int personNo)
        {
            var steps = BuildSteps(profile);
            var hasInterview = profile is Profile.InterviewScheduled or Profile.Pending or Profile.Approved
                or Profile.Offer or Profile.OfferAccepted or Profile.RejectAfterInterview;
            var interviewCompleted = hasInterview && profile != Profile.InterviewScheduled;
            string? decisionType = profile switch
            {
                Profile.Approved or Profile.Offer or Profile.OfferAccepted => DecisionTypes.Accepted,
                Profile.RejectAfterInterview => DecisionTypes.Rejected,
                _ => null
            };

            var applyHour = 9 + personNo % 9;
            var applyMinute = (personNo * 17) % 60;
            var tApply = profile == Profile.InterviewScheduled
                ? AtHour(now.AddDays(-(8 + personNo % 4)), applyHour, applyMinute)
                : AtHour(vacancy.CreatedAt.AddDays(2 + slot + personNo % 3), applyHour, applyMinute);
            var tCreate = tApply.AddHours(-1 - personNo % 3).AddMinutes(-(personNo * 7) % 60);

            var stepTimes = new DateTime[steps.Length];
            var cursor = tApply;
            for (var k = 0; k < steps.Length; k++)
            {
                cursor = cursor.AddHours(20 + (k % 3) * 5);
                stepTimes[k] = cursor;
            }

            var ivSetIndex = Array.FindIndex(steps, s => s.Status == ApplicationStatuses.Interview && s.Sub == "Интервью назначено");
            var pendingIndex = Array.FindIndex(steps, s => s.Status == ApplicationStatuses.Pending);

            DateTime? ivScheduledAt = null;
            DateTime? ivCreatedAt = null;
            if (hasInterview)
            {
                var setT = stepTimes[ivSetIndex];
                ivCreatedAt = setT;
                ivScheduledAt = interviewCompleted
                    ? AtHour(setT.AddDays(2), 10 + personNo % 8, (personNo * 7) % 60)
                    : AtHour(now.AddDays(1 + personNo % 5), 10 + personNo % 7, (personNo * 11) % 60);
            }

            DateTime? decisionAt = decisionType != null && interviewCompleted
                ? stepTimes[pendingIndex].AddHours(6)
                : null;

            var finalStatus = steps[^1].Status;
            var finalSub = steps[^1].Sub;

            var candidate = new Candidate
            {
                FullName = fullName,
                Phone = $"+7 (9{personNo % 100:00}) {personNo % 900 + 100:000}-{personNo % 90 + 10:00}-{personNo * 7 % 90 + 10:00}",
                City = vacancy.Location,
                Telegram = $"@user{personNo}",
                Specialty = vacancy.Title,
                Skills = JsonSerializer.Serialize(vacancy.Skills!.Split('\n', StringSplitOptions.RemoveEmptyEntries)),
                Education = JsonSerializer.Serialize(new[]
                {
                    new { level = "Бакалавриат", institution = universities[personNo % universities.Length], faculty = "Информатика и вычислительная техника", start = "01.09.2015", end = "30.06.2019" }
                }),
                PreviousWork = JsonSerializer.Serialize(new[]
                {
                    new { company = companies[personNo % companies.Length], position = "Специалист", start = "01.08.2019", end = "01.06.2024", info = "" }
                }),
                CreatedById = hr.Id,
                CreatedAt = tCreate
            };

            var application = new Application
            {
                Candidate = candidate,
                VacancyId = vacancy.Id,
                CreatedById = hr.Id,
                AppliedAt = tApply,
                CreatedAt = tApply,
                Status = finalStatus,
                SubStatus = finalSub,
                UpdatedById = hr.Id,
                UpdatedAt = stepTimes[^1]
            };
            context.Applications.Add(application);

            Interview? interview = null;
            Decision? decision = null;
            if (hasInterview)
            {
                interview = new Interview
                {
                    Application = application,
                    ScheduledAt = ivScheduledAt!.Value,
                    DurationMinutes = 60,
                    Plan = "Знакомство, опыт, живое кодирование, вопросы по стеку",
                    Status = interviewCompleted ? "Completed" : "Scheduled",
                    CreatedById = hr.Id,
                    InterviewerId = hr.Id,
                    CreatedAt = ivCreatedAt!.Value
                };

                if (interviewCompleted)
                {
                    var evals = new List<Evaluation>();
                    for (var c = 0; c < vacComps.Count; c++)
                    {
                        evals.Add(new Evaluation
                        {
                            Interview = interview,
                            Competency = vacComps[c],
                            Score = ScoreFor(profile, c),
                            Comment = "",
                            EvaluatedById = hr.Id,
                            EvaluatedAt = ivScheduledAt.Value.AddHours(1)
                        });
                    }
                    interview.Evaluations = evals;
                    if (evals.Count > 0)
                        interview.OverallScore = Math.Round((decimal)evals.Average(e => e.Score), 2);
                    interview.GeneralNotes = NotesFor(profile);
                }
                context.Interviews.Add(interview);

                if (decisionType != null)
                {
                    decision = new Decision
                    {
                        Interview = interview,
                        MadeById = decisionMaker.Id,
                        DecisionType = decisionType,
                        Comment = decisionType == DecisionTypes.Accepted
                            ? "Кандидат соответствует требованиям, согласовано."
                            : "Кандидат не подходит по итогам интервью.",
                        MadeAt = decisionAt!.Value
                    };
                    context.Decisions.Add(decision);
                }
            }

            await context.SaveChangesAsync();

            Log("Candidate", candidate.Id, "Created", hr.Id, tCreate, new { candidate.FullName });
            Log("Application", application.Id, "Created", hr.Id, tApply,
                new { CandidateId = candidate.Id, VacancyId = vacancy.Id, Status = ApplicationStatuses.New, SubStatus = "Назначен на вакансию" });

            var prevStatus = ApplicationStatuses.New;
            string? prevSub = "Назначен на вакансию";
            for (var k = 0; k < steps.Length; k++)
            {
                var (st, sub) = steps[k];

                if (hasInterview && k == ivSetIndex)
                    Log("Interview", interview!.Id, "Created", hr.Id, ivCreatedAt!.Value,
                        new { ApplicationId = application.Id, ScheduledAt = interview.ScheduledAt });

                if (decision != null && (st == ApplicationStatuses.Approved || st == ApplicationStatuses.Rejected))
                    Log("Decision", decision.Id, "Created", decisionMaker.Id, decisionAt!.Value,
                        new { InterviewId = interview!.Id, DecisionType = decision.DecisionType });

                Log("Application", application.Id, "Updated", hr.Id, stepTimes[k],
                    new { Status = st, SubStatus = sub },
                    new { Status = prevStatus, SubStatus = prevSub });

                prevStatus = st;
                prevSub = sub;
            }
        }

        var globalNo = 0;
        foreach (var plan in vacancyPlans)
        {
            var vacComps = plan.V.Competencies.Where(c => c.IsActive).ToList();
            for (var slot = 0; slot < plan.Slots.Length; slot++)
            {
                await ProcessApplicationAsync(plan.V, vacComps, names[globalNo], slot, plan.Slots[slot], globalNo);
                globalNo++;
            }
        }

        foreach (var plan in vacancyPlans.Where(p => p.Closed))
        {
            plan.V.Status = "Closed";
            plan.V.UpdatedAt = plan.ClosedAt;
            plan.V.ClosesAt = plan.ClosedAt;
            Log("Vacancy", plan.V.Id, "Updated", admin.Id, plan.ClosedAt!.Value,
                new { Status = "Closed" }, new { Status = "Open" });
        }
        await context.SaveChangesAsync();

        context.AuditLogs.AddRange(audits);
        await context.SaveChangesAsync();
    }
}
