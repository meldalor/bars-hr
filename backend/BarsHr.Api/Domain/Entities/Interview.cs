using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("interviews")]
public class Interview
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("candidate_id")]
    public int CandidateId { get; set; }

    [Column("vacancy_id")]
    public int VacancyId { get; set; }

    [Column("scheduled_at")]
    public DateTime ScheduledAt { get; set; }

    [Column("plan")]
    public string? Plan { get; set; }

    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "New";

    [MaxLength(50)]
    [Column("sub_status")]
    public string? SubStatus { get; set; }

    [Column("overall_score")]
    public decimal? OverallScore { get; set; }

    [Column("general_notes")]
    public string? GeneralNotes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int CreatedById { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedById { get; set; }

    [Column("interviewer_id")]
    public int? InterviewerId { get; set; }

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(CandidateId))]
    public Candidate? Candidate { get; set; }

    [ForeignKey(nameof(VacancyId))]
    public Vacancy? Vacancy { get; set; }

    [ForeignKey(nameof(InterviewerId))]
    public User? Interviewer { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    [ForeignKey(nameof(UpdatedById))]
    public User? UpdatedBy { get; set; }

    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();

    public Decision? Decision { get; set; }

    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
}