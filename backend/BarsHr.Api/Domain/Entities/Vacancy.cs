using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("vacancies")]
public class Vacancy
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("responsibilities")]
    public string? Responsibilities { get; set; }

    [Column("requirements")]
    public string? Requirements { get; set; }

    [MaxLength(50)]
    [Column("work_format")]
    public string? WorkFormat { get; set; }

    [MaxLength(100)]
    [Column("location")]
    public string? Location { get; set; }

    [MaxLength(50)]
    [Column("employment_type")]
    public string? EmploymentType { get; set; }

    [MaxLength(50)]
    [Column("experience_level")]
    public string? ExperienceLevel { get; set; }

    [Column("salary_min")]
    public int? SalaryMin { get; set; }

    [Column("salary_max")]
    public int? SalaryMax { get; set; }

    [MaxLength(10)]
    [Column("currency")]
    public string Currency { get; set; } = "RUB";

    [Column("positions_count")]
    public int PositionsCount { get; set; } = 1;

    [MaxLength(100)]
    [Column("department")]
    public string? Department { get; set; }

    [Column("skills")]
    public string? Skills { get; set; }           // JSONB

    [Column("platforms")]
    public string? Platforms { get; set; }        // JSONB

    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Open";

    [Column("closes_at")]
    public DateTime? ClosesAt { get; set; }

    [Column("created_by")]
    public int CreatedById { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("is_archived")]
    public bool IsArchived { get; set; } = false;

    // ==================== Навигационные свойства ====================

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}