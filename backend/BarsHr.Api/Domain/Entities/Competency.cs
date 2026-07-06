using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Competency
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty; // "Hard Skills", "Soft Skills", "Culture Fit" etc.

    /// <summary>
    /// Maximum possible score for this competency (default 5).
    /// Allows different scales per competency if needed.
    /// </summary>
    public int MaxScore { get; set; } = 5;

    public bool IsActive { get; set; } = true;

    // ============================================
    // NAVIGATION
    // ============================================

    /// <summary>
    /// All evaluations ever made for this competency (across all interviews).
    /// Useful for analytics (average score per competency, trends).
    /// </summary>
    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();
}
