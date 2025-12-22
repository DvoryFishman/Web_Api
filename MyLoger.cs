using System.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace core;

public class MyLoger
{
    private readonly RequestDelegate next;
    private readonly ILogger logger;


    public MyLoger(RequestDelegate next, ILogger<MyLoger> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext c)
    {
        var sw = new Stopwatch();
        sw.Start();
        await next.Invoke(c);
        logger.LogDebug($"{c.Request.Path}.{c.Request.Method} took {sw.ElapsedMilliseconds}ms."
            + $" User: {c.User?.FindFirst("userId")?.Value ?? "unknown"}");
        
    }
}

public static partial class MiddlewareExtensions
{
    public static IApplicationBuilder UseMyLog(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<MyLoger>();
    }
}

