using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("candidates")]
public class Candidate
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("phone")]
    public string? Phone { get; set; }

    [MaxLength(100)]
    [Column("city")]
    public string? City { get; set; }

    [MaxLength(100)]
    [Column("telegram")]
    public string? Telegram { get; set; }

    [MaxLength(200)]
    [Column("specialty")]
    public string? Specialty { get; set; }

    [Column("additional_info")]
    public string? AdditionalInfo { get; set; }

    // JSON-массив записей {level, institution, faculty, start, end}; легаси-данные — плоский текст
    [Column("education")]
    public string? Education { get; set; }

    // JSON-массив записей {company, position, start, end, info}; легаси-данные — плоский текст
    [Column("previous_work")]
    public string? PreviousWork { get; set; }

    [Column("skills")]
    public string? Skills { get; set; } // JSONB (массив или объект)

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    //нужно вернуть, ставлю тест 
    //public int CreatedById { get; set; }
    public int? CreatedById { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("is_archived")]
    public bool IsArchived { get; set; } = false;

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    // собеседования кандидата доступны через Applications: интервью всегда в контексте отклика
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}