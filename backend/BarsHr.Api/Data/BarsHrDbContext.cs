using BarsHr.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Data;

public class BarsHrDbContext : DbContext
{
    public BarsHrDbContext(DbContextOptions<BarsHrDbContext> options) 
        : base(options)
    {
    }

    // ==================== DbSet'ы ====================

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Candidate> Candidates { get; set; } = null!;
    public DbSet<Vacancy> Vacancies { get; set; } = null!;
    public DbSet<Interview> Interviews { get; set; } = null!;
    public DbSet<Application> Applications { get; set; } = null!;
    public DbSet<Competency> Competencies { get; set; } = null!;
    public DbSet<Evaluation> Evaluations { get; set; } = null!;
    public DbSet<Decision> Decisions { get; set; } = null!;
    public DbSet<DocumentTemplate> DocumentTemplates { get; set; } = null!;
    public DbSet<GeneratedDocument> GeneratedDocuments { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==================== Связи с User ====================

        // Candidate → User
        modelBuilder.Entity<Candidate>()
            .HasOne(c => c.CreatedBy)
            .WithMany()
            .HasForeignKey(c => c.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Vacancy → User
        modelBuilder.Entity<Vacancy>()
            .HasOne(v => v.CreatedBy)
            .WithMany()
            .HasForeignKey(v => v.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Interview → User (3 связи)
        modelBuilder.Entity<Interview>()
            .HasOne(i => i.CreatedBy)
            .WithMany()
            .HasForeignKey(i => i.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Interview>()
            .HasOne(i => i.UpdatedBy)
            .WithMany()
            .HasForeignKey(i => i.UpdatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Interview>()
            .HasOne(i => i.Interviewer)
            .WithMany()
            .HasForeignKey(i => i.InterviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Evaluation → User
        modelBuilder.Entity<Evaluation>()
            .HasOne(e => e.EvaluatedBy)
            .WithMany()
            .HasForeignKey(e => e.EvaluatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Decision → User
        modelBuilder.Entity<Decision>()
            .HasOne(d => d.MadeBy)
            .WithMany()
            .HasForeignKey(d => d.MadeById)
            .OnDelete(DeleteBehavior.Restrict);

        // GeneratedDocument → User
        modelBuilder.Entity<GeneratedDocument>()
            .HasOne(g => g.GeneratedBy)
            .WithMany()
            .HasForeignKey(g => g.GeneratedById)
            .OnDelete(DeleteBehavior.Restrict);

        // AuditLog → User
        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // ==================== Индексы ====================
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Login)
            .IsUnique();
        }}