using System.Globalization;

namespace BarsHr.Api.Pdf;

// единый формат дат по-русски для всех документов
public static class PdfFormat
{
    private static readonly CultureInfo Ru = new("ru-RU");

    public static string Date(DateTime value) => value.ToString("d MMMM yyyy 'г.'", Ru);

    public static string DateTime(DateTime value) => value.ToString("d MMMM yyyy 'г.', HH:mm", Ru);

    // диапазон зарплаты из вакансии; null — если вилка не задана
    public static string? Salary(int? min, int? max, string currency)
    {
        if (min is null && max is null)
            return null;

        var cur = currency == "RUB" ? "₽" : currency;
        string n(int value) => value.ToString("N0", Ru);

        if (min is not null && max is not null)
            return min == max ? $"{n(min.Value)} {cur}" : $"от {n(min.Value)} до {n(max.Value)} {cur}";

        return $"{n((min ?? max)!.Value)} {cur}";
    }
}
