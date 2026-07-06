using BarsHr.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
    }
}
