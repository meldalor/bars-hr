using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarsHr.Api.Domain.Entities;

public class GeneratedDocument
{
    [Key]
    public int Id { get; set; }

    public int InterviewId { get; set; }
    public Interview? Interview { get; set; }

    public int TemplateId { get; set; }
    public DocumentTemplate? Template { get; set; }

    /// <summary>
    /// Path or URL to the generated PDF file.
    /// Can be local filesystem path, relative to wwwroot, or cloud storage key.
    /// </summary>
    public string FilePath { get; set; } = string.Empty;

    public int GeneratedById { get; set; }
    public User? GeneratedBy { get; set; }

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// JSONB snapshot of all relevant data at the moment of PDF generation.
    /// Guarantees the document content never changes even if source entities are edited later.
    /// </summary>
    public string ParametersSnapshot { get; set; } = "{}";
}
