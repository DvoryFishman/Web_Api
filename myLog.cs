// using System.Diagnostics;
// namespace core;
 
// public class myLog
// {
//    private readonly RequestDelegate next;
//    private readonly ILogger logger;

//    public myLog(RequestDelegate next ,ILogger<myLog> logger)
//     {
//         this.next=next;
//         this.logger=logger;
//     }

//     public async Task Invoke(HttpContext c)
//     {
//         var sw = new Stopwatch();
//         sw.Start();
//         await next.Invoke(c);
//         logger.LogDebug($"{c.Request.Path}.{c.Request.Method} took {sw.ElapsedMilliseconds} ms."
//          + $" User: {c.User?.FindFirst("userId")?.Value ?? "unknown"}");

//     }
// }

// public static partial class MiddlewareExtensions
// {
//     public static IApplicationBuilder UseMyLog(this IApplicationBuilder builder)
//     {
//         return builder.UseMyLog<myLog>();
//     }
// }