namespace BarsHr.Api.Domain;

// права константны и жёстко привязаны к 3 ролям (без БД и рантайм-редактирования).
// Ключи совпадают с чеклистом на фронте.
public static class Permissions
{
    public const string CandidatesEdit = "candidates.edit";
    public const string CandidatesDelete = "candidates.delete";
    public const string VacanciesEdit = "vacancies.edit";
    public const string InterviewsSchedule = "interviews.schedule";
    public const string DocumentsPrint = "documents.print";
    public const string UsersManage = "users.manage";
    public const string AuditView = "audit.view";

    public static readonly string[] All =
    {
        CandidatesEdit, CandidatesDelete, VacanciesEdit,
        InterviewsSchedule, DocumentsPrint, UsersManage, AuditView
    };

    public static readonly IReadOnlyDictionary<string, string[]> ByRole = new Dictionary<string, string[]>
    {
        [Roles.Admin] = All,
        [Roles.HR] = new[]
        {
            CandidatesEdit, CandidatesDelete, VacanciesEdit,
            InterviewsSchedule, DocumentsPrint, AuditView
        },
        [Roles.DecisionMaker] = new[] { DocumentsPrint, AuditView },
    };

    public static bool Has(string? role, string permission) =>
        role != null && ByRole.TryGetValue(role, out var perms) && perms.Contains(permission);
}
