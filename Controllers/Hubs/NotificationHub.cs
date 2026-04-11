using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace core.Controllers.Hubs
{
    public class NotificationHub : Hub
    {
        // מילון סטטי: userId -> רשימת connectionIds
        private static readonly ConcurrentDictionary<string, HashSet<string>> UserConnections = new();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("id")?.Value;
            Console.WriteLine($"[NotificationHub] User connected: connectionId={Context.ConnectionId}, userId={userId}");
            
            if (!string.IsNullOrEmpty(userId))
            {
                var connections = UserConnections.GetOrAdd(userId, _ => new HashSet<string>());
                lock (connections)
                {
                    connections.Add(Context.ConnectionId);
                }
                Console.WriteLine($"[NotificationHub] Added connection for userId {userId}. Total connections: {connections.Count}");
            }
            else
            {
                Console.WriteLine($"[NotificationHub] User ID is empty. Context.User is {(Context.User == null ? "null" : "not null")}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst("id")?.Value;
            if (!string.IsNullOrEmpty(userId) && UserConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        UserConnections.TryRemove(userId, out _);
                    }
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        // פונקציה סטטית לשליפת כל connectionIds של משתמש
        public static List<string> GetConnections(string userId)
        {
            if (UserConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    return connections.ToList();
                }
            }
            return new List<string>();
        }
    }
}
