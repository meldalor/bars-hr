using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("evaluations")]
public class Evaluation
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("interview_id")]
    public int InterviewId { get; set; }

    [Column("competency_id")]
    public int CompetencyId { get; set; }

    [Column("score")]
    public int Score { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("evaluated_by_id")]
    public int EvaluatedById { get; set; }

    [Column("evaluated_at")]
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(InterviewId))]
    public Interview? Interview { get; set; }

    [ForeignKey(nameof(CompetencyId))]
    public Competency? Competency { get; set; }

    [ForeignKey(nameof(EvaluatedById))]
    public User? EvaluatedBy { get; set; }
}