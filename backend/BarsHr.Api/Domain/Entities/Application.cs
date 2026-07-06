using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Application
{
    [Key]
    public int Id { get; set; }

    public int CandidateId { get; set; }
    public Candidate? Candidate { get; set; }

    public int VacancyId { get; set; }
    public Vacancy? Vacancy { get; set; }

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    public string Source { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Status { get; set; } = "New";
    public string CoverLetter { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsArchived { get; set; } = false;

    // ============================================
    // NAVIGATION
    // ============================================
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
