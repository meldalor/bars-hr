using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class AuditLog
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string EntityName { get; set; } = string.Empty; // "Candidate", "Interview", "Vacancy", etc.

    public int EntityId { get; set; }

    [MaxLength(50)]
    public string Action { get; set; } = string.Empty; // "Create", "Update", "Delete", "DecisionMade"...

    /// <summary>
    /// JSONB snapshot of values before the change.
    /// </summary>
    public string OldValues { get; set; } = "{}";

    /// <summary>
    /// JSONB snapshot of values after the change.
    /// </summary>
    public string NewValues { get; set; } = "{}";

    public int UserId { get; set; }
    public User? User { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    public string IpAddress { get; set; } = string.Empty;
}
