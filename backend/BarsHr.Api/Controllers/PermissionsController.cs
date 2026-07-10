using BarsHr.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    // константный маппинг роль → права (для чеклиста в админке, только чтение)
    [HttpGet]
    public ActionResult<IReadOnlyDictionary<string, string[]>> GetAll() => Ok(Permissions.ByRole);
}
