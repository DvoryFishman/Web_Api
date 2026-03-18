using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using System.Threading.Tasks;
using core.Services;

namespace core;

public class MyLoger
{
    private readonly RequestDelegate next;
    private readonly IAsyncFileLogger logger;

    public MyLoger(RequestDelegate next, IAsyncFileLogger logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext c)
    {
        var startTime = DateTime.Now;
        var sw = new Stopwatch();
        sw.Start();
        await next.Invoke(c);
        sw.Stop();

        string controller = "Unknown";
        string action = "Unknown";
        var endpoint = c.GetEndpoint();
        if (endpoint != null)
        {
            var controllerAction = endpoint.Metadata.GetMetadata<ControllerActionDescriptor>();
            if (controllerAction != null)
            {
                controller = controllerAction.ControllerName;
                action = controllerAction.ActionName;
            }
        }

        // נסיון לקבל את ה-userId מה-Claims
        string user = "anonymous";
        var userIdClaim = c.User?.FindFirst("id");
        if (userIdClaim != null)
        {
            user = userIdClaim.Value;
        }

        var logEntry = new LogEntry
        {
            StartTime = startTime,
            Controller = controller,
            Action = action,
            User = user,
            DurationMs = sw.ElapsedMilliseconds
        };

        logger.EnqueueLog(logEntry);
    }
}

public static partial class MiddlewareExtensions
{
    public static IApplicationBuilder UseMyLog(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<MyLoger>();
    }
}

