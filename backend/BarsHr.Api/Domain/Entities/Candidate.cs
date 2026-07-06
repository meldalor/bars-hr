using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Candidate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    /// <summary>
    /// Education background (free text or structured later).
    /// Part of candidate card (4.3).
    /// </summary>
    public string Education { get; set; } = string.Empty;

    /// <summary>
    /// Previous work experience (free text).
    /// Part of candidate card (4.3).
    /// </summary>
    public string PreviousWork { get; set; } = string.Empty;

    /// <summary>
    /// Flexible skills storage as JSONB array.
    /// Example in DB: ["C#", ".NET", "SQL", "Teamwork"]
    /// 
    /// Why jsonb: allows easy filtering / indexing in PostgreSQL and flexible schema evolution
    /// (no need to change table when new skill types appear).
    /// Mapped in DbContext.OnModelCreating with .HasColumnType("jsonb").
    /// </summary>
    public List<string> Skills { get; set; } = new List<string>();

    /// <summary>
    /// Overall candidate status in the hiring pipeline.
    /// Possible values (from ER): "New", "In Progress", "Hired", "Rejected".
    /// 
    /// Used in реестр кандидатов (1.9) for filtering / color coding.
    /// Can be derived or manually updated when Decision is made.
    /// </summary>
    [MaxLength(50)]
    public string Status { get; set; } = "New";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Who created/added this candidate (FK to User).
    /// Usually HR or Admin (4.3).
    /// </summary>
    public int CreatedById { get; set; }

    public User? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Soft delete flag (bonus 4.10 Архивация).
    /// When true, candidate is hidden from main lists but data preserved for history / audit.
    /// </summary>
    public bool IsArchived { get; set; } = false;

    // ============================================
    // NAVIGATION PROPERTIES
    // ============================================

    /// <summary>
    /// All applications (отклики) this candidate has submitted / been registered for.
    /// Supports multiple positions per candidate (TZ note 4.6).
    /// </summary>
    public ICollection<Application> Applications { get; set; } = new List<Application>();

    /// <summary>
    /// All interviews / собеседования for this candidate (across different vacancies).
    /// Core feature: store history of upcoming and past interviews.
    /// </summary>
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
