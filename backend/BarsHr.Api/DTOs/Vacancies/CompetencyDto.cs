namespace BarsHr.Api.DTOs.Vacancies;

// строка матрицы оценки вакансии: навык из пула + потолок баллов
public record CompetencyDto(
    int Id,
    int SkillId,
    string SkillName,
    string SkillType,
    int MaxScore
);

// пункт матрицы во входящем запросе (создание вакансии / правка матрицы)
public record CompetencyItem(
    int SkillId,
    int MaxScore = 5
);
