using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("decisions")]
public class Decision
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("interview_id")]
    public int InterviewId { get; set; }

    [Column("made_by_id")]
    public int MadeById { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("decision_type")]
    public string DecisionType { get; set; } = string.Empty;

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("made_at")]
    public DateTime MadeAt { get; set; } = DateTime.UtcNow;

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(InterviewId))]
    public Interview? Interview { get; set; }

    [ForeignKey(nameof(MadeById))]
    public User? MadeBy { get; set; }
}