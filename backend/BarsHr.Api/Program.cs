using System.Text;
using BarsHr.Api.Data;
using BarsHr.Api.Pdf;
using BarsHr.Api.Services.Implementations;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// QuestPDF: бесплатная Community-лицензия, регистрация кириллического шрифта и логотипа
QuestPDF.Settings.License = LicenseType.Community;
PdfAssets.Initialize();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT-токен из POST /api/auth/login"
    });
    // ссылке на схему нужен сам документ, иначе security сериализуется пустым и UI не шлёт токен
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditSaveChangesInterceptor>();
builder.Services.AddDbContext<BarsHrDbContext>((sp, options) =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
           .AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>()));

builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();
builder.Services.AddScoped<IVacancyService, VacancyService>();
builder.Services.AddScoped<ISkillService, SkillService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IAuditService, AuditService>();

var jwt = builder.Configuration.GetSection("Jwt");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
            ClockSkew = TimeSpan.FromMinutes(5)
        };
    });

builder.Services.AddAuthorization();

// CORS для локального фронтенда (Vite на 5173); Content-Disposition нужен клиенту,
// чтобы вытащить имя файла при скачивании PDF через blob
const string FrontendCorsPolicy = "frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy => policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithExposedHeaders("Content-Disposition"));
});

var app = builder.Build();

// стартовые пользователи и демо-данные: без них на чистой БД невозможно войти
{
    var seedOptions = new DbContextOptionsBuilder<BarsHrDbContext>()
        .UseNpgsql(app.Configuration.GetConnectionString("Default"))
        .Options;
    await using var seedDb = new BarsHrDbContext(seedOptions);

    for (var attempt = 1; ; attempt++)
    {
        try
        {
            await seedDb.Database.MigrateAsync();
            break;
        }
        catch (Npgsql.NpgsqlException) when (attempt < 10)
        {
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }

    await DbSeeder.SeedAsync(seedDb);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options => options.EnablePersistAuthorization());
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
