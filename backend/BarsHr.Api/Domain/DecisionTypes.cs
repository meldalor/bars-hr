namespace BarsHr.Api.Domain;

// итог собеседования, который выносит DecisionMaker
public static class DecisionTypes
{
    public const string Accepted = "Accepted";
    public const string Rejected = "Rejected";

    public static readonly string[] All = { Accepted, Rejected };
}
