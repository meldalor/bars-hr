using System.ComponentModel.DataAnnotations;

namespace BarsHr.Api.DTOs.Evaluations;

// сохранение матрицы целиком: существующие оценки обновляются, новые добавляются
public record UpsertEvaluationsRequest(
    [Required] List<EvaluationItem> Evaluations,
    string? GeneralNotes
);

public record EvaluationItem(
    int CompetencyId,
    int Score,
    string? Comment
);
