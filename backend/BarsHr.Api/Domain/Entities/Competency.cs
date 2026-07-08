using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BarsHr.Api.Domain.Entities;

[Table("competencies")]
public class Competency
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("skill_id")]
    public int SkillId { get; set; }

    [ForeignKey(nameof(SkillId))]
    public Skill? Skill { get; set; }

    [Column("max_score")]
    public int MaxScore { get; set; } = 5;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("vacancy_id")]
    public int VacancyId { get; set; }

    [ForeignKey(nameof(VacancyId))]
    public Vacancy? Vacancy { get; set; }

    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();
}