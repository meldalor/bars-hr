using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Interview
{
    [Key]
    public int Id { get; set; }

    public int CandidateId { get; set; }
    public Candidate? Candidate { get; set; }

    public int VacancyId { get; set; }
    public Vacancy? Vacancy { get; set; }

    /// <summary>
    /// When the interview is scheduled (or was held, if past).
    /// </summary>
    public DateTime ScheduledAt { get; set; }

    /// <summary>
    /// Interview plan / agenda (questions, topics, duration, format).
    /// Part of "план собеседования" in 4.5.
    /// </summary>
    public string Plan { get; set; } = string.Empty;

    /// <summary>
    /// Current stage in the hiring funnel.
    /// Examples: "Отклик", "Скрининг", "Интервью", "Оффер", "Принят", "Отклонён".
    /// </summary>
    [MaxLength(50)]
    public string Status { get; set; } = "Scheduled";

    /// <summary>
    /// More granular sub-status for workflow flexibility.
    /// Examples from ER: "Назначен на вакансию", "Ожидание ответа", "ТЗ на проверке".
    /// </summary>
    [MaxLength(50)]
    public string SubStatus { get; set; } = string.Empty;

    /// <summary>
    /// Overall / average score for this interview round.
    /// Can be:
    /// 1. Calculated as average of all Evaluation.score (recommended)
    /// 2. Manually entered by interviewer / HR when closing the interview.
    /// 
    /// Used in реестр кандидатов / реестр собеседований for quick overview (1.4, 1.9).
    /// </summary>
    [Column(TypeName = "decimal(3,1)")]
    public decimal? OverallScore { get; set; }

    public int? InterviewerId { get; set; }
    public User? Interviewer { get; set; }

    /// <summary>
    /// General free-text notes / comments about the interview.
    /// "оставлять прочие комментарии" from product description.
    /// </summary>
    public string GeneralNotes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ============================================
    // NAVIGATION PROPERTIES
    // ============================================

    /// <summary>
    /// Competency evaluations (scores + comments) for this interview.
    /// This is the "матрица компетенций" (1.7, 4.6).
    /// One row per competency evaluated in this interview.
    /// </summary>
    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();

    /// <summary>
    /// Final decision made after this interview (by Решала).
    /// Usually one Decision per Interview.
    /// </summary>
    public Decision? Decision { get; set; }

    /// <summary>
    /// Generated printable documents (Offer Letter, Evaluation Sheet, Protocol, Приглашение/Отказ, etc.).
    /// </summary>
    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
}
