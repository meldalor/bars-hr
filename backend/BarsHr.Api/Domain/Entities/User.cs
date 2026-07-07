using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("users")]
public class User
{

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("login")]
    public string Login { get; set; } = string.Empty;

    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("full_name")]
    public string? FullName { get; set; }

    [MaxLength(150)]
    [Column("email")]
    public string? Email { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("role")]
    public string Role { get; set; } = "HR";

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("last_login_at")]
    public DateTime? LastLoginAt { get; set; }

    // ==================== Навигационные свойства (связи) ====================

    public ICollection<Candidate> CreatedCandidates { get; set; } = new List<Candidate>();
    public ICollection<Candidate> UpdatedCandidates { get; set; } = new List<Candidate>();

    public ICollection<Vacancy> CreatedVacancies { get; set; } = new List<Vacancy>();

    public ICollection<Interview> CreatedInterviews { get; set; } = new List<Interview>();
    public ICollection<Interview> UpdatedInterviews { get; set; } = new List<Interview>();
    public ICollection<Interview> ConductedInterviews { get; set; } = new List<Interview>();

    public ICollection<Evaluation> MadeEvaluations { get; set; } = new List<Evaluation>();
    public ICollection<Decision> MadeDecisions { get; set; } = new List<Decision>();

    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}