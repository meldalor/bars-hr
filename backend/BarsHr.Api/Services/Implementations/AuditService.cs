using System.Text.Json;
using BarsHr.Api.Data;
using BarsHr.Api.Domain;
using BarsHr.Api.DTOs.Audit;
using BarsHr.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Services.Implementations;

public class AuditService : IAuditService
{
    private readonly BarsHrDbContext _context;

    public AuditService(BarsHrDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogDto>> GetAsync(
        string? entityName = null,
        string? action = null,
        int? userId = null,
        int? candidateId = null,
        int? vacancyId = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 50)
    {
        var query = _context.AuditLogs.AsNoTracking()
            // пооценочные записи и строки матрицы — шум, в журнале не показываем
            .Where(a => a.EntityName != "Evaluation" && a.EntityName != "Competency");

        if (!string.IsNullOrWhiteSpace(entityName))
            query = query.Where(a => a.EntityName == entityName);
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);
        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);
        if (from.HasValue)
            query = query.Where(a => a.Timestamp >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.Timestamp <= to.Value);

        // журнал конкретного кандидата: его карточка + отклики/интервью/решения по ним;
        // события удалённых интервью выпадают — их id уже не разрешить в кандидата
        if (candidateId.HasValue)
        {
            var cid = candidateId.Value;
            var appIds = _context.Applications.Where(x => x.CandidateId == cid).Select(x => x.Id);
            var interviewIds = _context.Interviews
                .Where(x => x.Application!.CandidateId == cid).Select(x => x.Id);
            var decisionIds = _context.Decisions
                .Where(x => x.Interview!.Application!.CandidateId == cid).Select(x => x.Id);

            query = query.Where(a =>
                (a.EntityName == "Candidate" && a.EntityId == cid) ||
                (a.EntityName == "Application" && appIds.Contains(a.EntityId)) ||
                (a.EntityName == "Interview" && interviewIds.Contains(a.EntityId)) ||
                (a.EntityName == "Decision" && decisionIds.Contains(a.EntityId)));
        }

        // журнал конкретной вакансии — по той же схеме
        if (vacancyId.HasValue)
        {
            var vid = vacancyId.Value;
            var appIds = _context.Applications.Where(x => x.VacancyId == vid).Select(x => x.Id);
            var interviewIds = _context.Interviews
                .Where(x => x.Application!.VacancyId == vid).Select(x => x.Id);
            var decisionIds = _context.Decisions
                .Where(x => x.Interview!.Application!.VacancyId == vid).Select(x => x.Id);

            query = query.Where(a =>
                (a.EntityName == "Vacancy" && a.EntityId == vid) ||
                (a.EntityName == "Application" && appIds.Contains(a.EntityId)) ||
                (a.EntityName == "Interview" && interviewIds.Contains(a.EntityId)) ||
                (a.EntityName == "Decision" && decisionIds.Contains(a.EntityId)));
        }

        var logs = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.Timestamp,
                a.UserId,
                UserName = a.User != null ? a.User.FullName : null,
                UserRole = a.User != null ? a.User.Role : null,
                a.Action,
                a.EntityName,
                a.EntityId,
                a.OldValues,
                a.NewValues
            })
            .ToListAsync();

        // разбираем сохранённые значения и батчами разрешаем имена кандидатов/вакансий
        var entries = logs
            .Select(l => (l.EntityName, Values: ParseValues(l.NewValues) ?? ParseValues(l.OldValues)))
            .ToList();
        var names = await ResolveNamesAsync(entries);

        return logs.Select(l =>
        {
            var values = ParseValues(l.NewValues) ?? ParseValues(l.OldValues);
            var oldValues = ParseValues(l.OldValues);
            return new AuditLogDto(
                l.Id,
                l.Timestamp,
                l.UserId,
                l.UserName,
                l.UserRole,
                l.Action,
                l.EntityName,
                l.EntityId,
                BuildDetails(l.EntityName, l.Action, values, oldValues, names)
            );
        }).ToList();
    }

    private sealed record NameMaps(
        Dictionary<int, string> Candidates,
        Dictionary<int, string> VacancyTitles,
        Dictionary<int, string> CandidateByApplication,
        Dictionary<int, string> CandidateByInterview);

    // собирает по журнальной странице все нужные id и одним махом тянет имена
    private async Task<NameMaps> ResolveNamesAsync(
        List<(string EntityName, Dictionary<string, JsonElement>? Values)> entries)
    {
        var candidateIds = new HashSet<int>();
        var vacancyIds = new HashSet<int>();
        var applicationIds = new HashSet<int>();
        var interviewIds = new HashSet<int>();

        foreach (var (entityName, values) in entries)
        {
            if (values == null) continue;
            switch (entityName)
            {
                case "Application":
                    if (GetInt(values, "CandidateId") is int cid) candidateIds.Add(cid);
                    if (GetInt(values, "VacancyId") is int vid) vacancyIds.Add(vid);
                    break;
                case "Interview":
                    if (GetInt(values, "ApplicationId") is int aid) applicationIds.Add(aid);
                    break;
                case "Decision":
                    if (GetInt(values, "InterviewId") is int iid) interviewIds.Add(iid);
                    break;
            }
        }

        var candidates = candidateIds.Count == 0
            ? new Dictionary<int, string>()
            : await _context.Candidates.AsNoTracking()
                .Where(c => candidateIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.FullName);

        var vacancies = vacancyIds.Count == 0
            ? new Dictionary<int, string>()
            : await _context.Vacancies.AsNoTracking()
                .Where(v => vacancyIds.Contains(v.Id))
                .ToDictionaryAsync(v => v.Id, v => v.Title);

        // навигации разворачиваем в Select — иначе селектор словаря выполнится в памяти по null-навигациям
        var byApplication = applicationIds.Count == 0
            ? new Dictionary<int, string>()
            : await _context.Applications.AsNoTracking()
                .Where(a => applicationIds.Contains(a.Id))
                .Select(a => new { a.Id, Name = a.Candidate!.FullName })
                .ToDictionaryAsync(x => x.Id, x => x.Name);

        var byInterview = interviewIds.Count == 0
            ? new Dictionary<int, string>()
            : await _context.Interviews.AsNoTracking()
                .Where(i => interviewIds.Contains(i.Id))
                .Select(i => new { i.Id, Name = i.Application!.Candidate!.FullName })
                .ToDictionaryAsync(x => x.Id, x => x.Name);

        return new NameMaps(candidates, vacancies, byApplication, byInterview);
    }

    private static string? BuildDetails(
        string entityName,
        string action,
        Dictionary<string, JsonElement>? values,
        Dictionary<string, JsonElement>? oldValues,
        NameMaps names)
    {
        if (values == null)
            return null;

        switch (entityName)
        {
            case "Candidate":
                return GetString(values, "FullName");

            case "Vacancy":
                return GetString(values, "Title");

            case "User":
                return GetString(values, "FullName") ?? GetString(values, "Login");

            case "Skill":
                return GetString(values, "Name");

            case "Application":
            {
                var name = GetInt(values, "CandidateId") is int cid && names.Candidates.TryGetValue(cid, out var n)
                    ? n
                    : "Кандидат";
                var status = GetString(values, "Status");
                var oldStatus = oldValues != null ? GetString(oldValues, "Status") : null;
                var subStatus = GetString(values, "SubStatus");
                var oldSubStatus = oldValues != null ? GetString(oldValues, "SubStatus") : null;

                // при создании ведём к вакансии, при смене статуса — к новому статусу/подстатусу
                if (action == "Created")
                {
                    var vacancy = GetInt(values, "VacancyId") is int vid && names.VacancyTitles.TryGetValue(vid, out var t)
                        ? t
                        : null;
                    return vacancy != null ? $"{name} → {vacancy}" : name;
                }
                if (status != null && status != oldStatus)
                    return $"{name} → {ApplicationStatuses.RuLabels.GetValueOrDefault(status, status)}";
                if (subStatus != null && subStatus != oldSubStatus)
                    return $"{name} → {subStatus}";
                return name;
            }

            case "Interview":
            {
                var name = GetInt(values, "ApplicationId") is int aid && names.CandidateByApplication.TryGetValue(aid, out var n)
                    ? n
                    : "Кандидат";
                var scheduled = GetString(values, "ScheduledAt");
                if (scheduled != null &&
                    DateTime.TryParse(scheduled, null, System.Globalization.DateTimeStyles.RoundtripKind, out var at))
                    return $"{name} → {at.ToLocalTime():dd.MM.yy HH:mm}";
                return name;
            }

            case "Decision":
            {
                var name = GetInt(values, "InterviewId") is int iid && names.CandidateByInterview.TryGetValue(iid, out var n)
                    ? n
                    : "Кандидат";
                var type = GetString(values, "DecisionType");
                return type != null
                    ? $"{name} → {(type == DecisionTypes.Accepted ? "Принят" : "Отклонён")}"
                    : name;
            }

            default:
                return null;
        }
    }

    private static Dictionary<string, JsonElement>? ParseValues(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static int? GetInt(Dictionary<string, JsonElement> values, string key) =>
        values.TryGetValue(key, out var el) && el.ValueKind == JsonValueKind.Number && el.TryGetInt32(out var n)
            ? n
            : null;

    private static string? GetString(Dictionary<string, JsonElement> values, string key) =>
        values.TryGetValue(key, out var el) && el.ValueKind == JsonValueKind.String
            ? el.GetString()
            : null;
}
