using BarsHr.Api.Data;                           
using Microsoft.EntityFrameworkCore; 
using BarsHr.Api.Services.Interfaces;
using BarsHr.Api.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Регистрация DbContext (EF Core + PostgreSQL)
builder.Services.AddDbContext<BarsHrDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<ICandidateService, CandidateService>();
var app = builder.Build();

// ==================== MIDDLEWARE ====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();
