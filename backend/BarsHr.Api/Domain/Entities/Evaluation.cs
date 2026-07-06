using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Evaluation
{
    [Key]
    public int Id { get; set; }

    public int InterviewId { get; set; }
    public Interview? Interview { get; set; }

    public int CompetencyId { get; set; }
    public Competency? Competency { get; set; }

    /// <summary>
    /// Score given for this competency in this interview.
    /// Should be between 0 and Competency.MaxScore (enforce in validation / UI).
    /// </summary>
    public int Score { get; set; }

    public string Comment { get; set; } = string.Empty;

    public int EvaluatedById { get; set; }
    public User? EvaluatedBy { get; set; }

    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
}
