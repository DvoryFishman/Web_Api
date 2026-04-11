using System;

namespace core
{
    public class LogEntry
    {
        public DateTime StartTime { get; set; }
        public string Controller { get; set; } = "Unknown";
        public string Action { get; set; } = "Unknown";
        public string User { get; set; } = "anonymous";
        public long DurationMs { get; set; }

        public override string ToString()
        {
            return $"[{StartTime:yyyy-MM-dd HH:mm:ss.fff}] {Controller}.{Action} | User: {User} | Duration: {DurationMs}ms";
        }
    }
}