using System.Security.Claims;
using BarsHr.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace BarsHr.Api.Authorization;

// проверка права по роли текущего пользователя (роль в JWT-claim). Требует [Authorize].
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public sealed class RequirePermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string _permission;

    public RequirePermissionAttribute(string permission) => _permission = permission;

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var role = context.HttpContext.User.FindFirstValue(ClaimTypes.Role);
        if (!Permissions.Has(role, _permission))
            context.Result = new ForbidResult();
    }
}
