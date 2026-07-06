using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("competencies")]
public class Competency
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(100)]
    [Column("category")]
    public string? Category { get; set; } // Hard Skills / Soft Skills / Culture Fit и т.д.

    [Column("max_score")]
    public int MaxScore { get; set; } = 5;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // ==================== Навигационные свойства ====================

    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();
}