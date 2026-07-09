using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("applications")]
public class Application
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("candidate_id")]
    public int CandidateId { get; set; }

    [Column("vacancy_id")]
    public int VacancyId { get; set; }

    [Column("applied_at")]
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "New";

    [MaxLength(50)]
    [Column("sub_status")]
    public string? SubStatus { get; set; }

    [Column("notes")]
    public string? Notes { get; set; } // Комментарий / сопроводительное письмо

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int CreatedById { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedById { get; set; }

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(CandidateId))]
    public Candidate? Candidate { get; set; }

    [ForeignKey(nameof(VacancyId))]
    public Vacancy? Vacancy { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    [ForeignKey(nameof(UpdatedById))]
    public User? UpdatedBy { get; set; }

    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}