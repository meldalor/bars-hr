namespace BarsHr.Api.Domain;

// строки совпадают с users.role и claim'ом роли в токене
public static class Roles
{
    public const string Admin = "Admin";
    public const string HR = "HR";
    public const string DecisionMaker = "DecisionMaker";

    public static readonly string[] All = { Admin, HR, DecisionMaker };
}
