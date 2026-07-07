using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("candidates")]
public class Candidate
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("phone")]
    public string? Phone { get; set; }

    [MaxLength(100)]
    [Column("city")]
    public string? City { get; set; }

    [Column("education")]
    public string? Education { get; set; }

    [Column("previous_work")]
    public string? PreviousWork { get; set; }

    [Column("skills")]
    public string? Skills { get; set; } // JSONB (массив или объект)

    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "New";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    //нужно вернуть, ставлю тест 
    //public int CreatedById { get; set; }
    public int? CreatedById { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("is_archived")]
    public bool IsArchived { get; set; } = false;

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}