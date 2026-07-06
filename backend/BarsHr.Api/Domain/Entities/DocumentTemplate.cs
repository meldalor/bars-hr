using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class DocumentTemplate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// HTML content of the template with placeholders.
    /// Example: "&lt;h1&gt;Offer for {{FullName}}&lt;/h1&gt; ... {{CompetencyTable}}"
    /// </summary>
    public string HtmlContent { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    // ============================================
    // NAVIGATION
    // ============================================

    public ICollection<GeneratedDocument> GeneratedDocuments { get; set; } = new List<GeneratedDocument>();
}
