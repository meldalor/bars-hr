using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BarsHr.Api.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<BarsHrDbContext>
{
    public BarsHrDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<BarsHrDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=barshr;Username=barshr;Password=barshr_dev"
        );

        return new BarsHrDbContext(optionsBuilder.Options);
    }
}