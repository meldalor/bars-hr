using QuestPDF.Drawing;

namespace BarsHr.Api.Pdf;

// шрифт и логотип грузятся один раз при старте: дефолтный шрифт QuestPDF
// не содержит кириллицы, а логотип незачем читать с диска на каждый документ
public static class PdfAssets
{
    private static byte[]? _logo;

    public static byte[] Logo => _logo
        ?? throw new InvalidOperationException("PdfAssets.Initialize не вызван");

    public static void Initialize()
    {
        var assets = Path.Combine(AppContext.BaseDirectory, "Assets");
        var fonts = Path.Combine(assets, "Fonts");

        FontManager.RegisterFont(File.OpenRead(Path.Combine(fonts, "DejaVuSans.ttf")));
        FontManager.RegisterFont(File.OpenRead(Path.Combine(fonts, "DejaVuSans-Bold.ttf")));

        _logo = File.ReadAllBytes(Path.Combine(assets, "BARSGroup_logotype.png"));
    }
}
