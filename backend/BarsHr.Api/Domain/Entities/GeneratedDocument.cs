using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("generated_documents")]
public class GeneratedDocument
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("interview_id")]
    public int InterviewId { get; set; }

    [Column("template_id")]
    public int TemplateId { get; set; }

    [Column("file_path")]
    public string FilePath { get; set; } = string.Empty;

    [Column("generated_by_id")]
    public int GeneratedById { get; set; }

    [Column("generated_at")]
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    [Column("parameters_snapshot")]
    public string? ParametersSnapshot { get; set; } // JSONB

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(InterviewId))]
    public Interview? Interview { get; set; }

    [ForeignKey(nameof(TemplateId))]
    public DocumentTemplate? Template { get; set; }

    [ForeignKey(nameof(GeneratedById))]
    public User? GeneratedBy { get; set; }
}