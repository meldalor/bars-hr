using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

[Table("document_templates")]
public class DocumentTemplate
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("html_content")]
    public string HtmlContent { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // ==================== Навигационные свойства ====================

    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
}