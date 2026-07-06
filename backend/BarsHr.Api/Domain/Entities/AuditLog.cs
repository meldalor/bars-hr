using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("audit_logs")]
public class AuditLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("entity_name")]
    public string EntityName { get; set; } = string.Empty;

    [Column("entity_id")]
    public int EntityId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("action")]
    public string Action { get; set; } = string.Empty;

    [Column("old_values")]
    public string? OldValues { get; set; }          // JSONB

    [Column("new_values")]
    public string? NewValues { get; set; }          // JSONB

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}