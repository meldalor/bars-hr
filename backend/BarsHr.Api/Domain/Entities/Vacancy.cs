using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Vacancy
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the position.
    /// Shown in vacancy card / public posting.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Key responsibilities (separate from description for structured display).
    /// </summary>
    public string Responsibilities { get; set; } = string.Empty;

    public string Requirements { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(50)]
    public string WorkFormat { get; set; } = string.Empty; // e.g. "Remote", "Hybrid", "Office"

    [MaxLength(50)]
    public string EmploymentType { get; set; } = string.Empty; // "Full-time", "Part-time", "Internship"

    [MaxLength(50)]
    public string ExperienceLevel { get; set; } = string.Empty; // "Junior", "Middle", "Senior", "Lead"

    public int? SalaryMin { get; set; }
    public int? SalaryMax { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "RUB";

    public int PositionsCount { get; set; } = 1;

    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    /// <summary>
    /// Required skills as flexible JSONB array.
    /// Example: ["C#", "ASP.NET Core", "PostgreSQL", "Docker"]
    /// Used for matching with candidates or filtering.
    /// </summary>
    public List<string> Skills { get; set; } = new List<string>();

    /// <summary>
    /// Publishing platforms / sources (jsonb array).
    /// Example: ["hh.ru", "LinkedIn", "Telegram", "Internal Career Site"]
    /// Important for analytics (which channels bring candidates).
    /// </summary>
    public List<string> Platforms { get; set; } = new List<string>();

    [MaxLength(50)]
    public string Status { get; set; } = "Open";

    /// <summary>
    /// Planned or actual closing date of the vacancy.
    /// Useful for реестр вакансий and dashboards.
    /// </summary>
    public DateTime? ClosesAt { get; set; }

    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsArchived { get; set; } = false;

    // ============================================
    // NAVIGATION PROPERTIES
    // ============================================

    /// <summary>
    /// All applications (отклики) received for this vacancy.
    /// </summary>
    public ICollection<Application> Applications { get; set; } = new List<Application>();

    /// <summary>
    /// All interviews conducted for this vacancy.
    /// </summary>
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
