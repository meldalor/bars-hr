using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class Decision
{
    [Key]
    public int Id { get; set; }

    public int InterviewId { get; set; }
    public Interview? Interview { get; set; }

    public int MadeById { get; set; }
    public User? MadeBy { get; set; }

    [MaxLength(50)]
    public string DecisionType { get; set; } = string.Empty; // "Hired", "Rejected", "Offer", etc.

    /// <summary>
    /// Detailed reasoning / comments from the DecisionMaker.
    /// Visible in protocol and candidate history.
    /// </summary>
    public string Comment { get; set; } = string.Empty;

    public DateTime MadeAt { get; set; } = DateTime.UtcNow;
}
