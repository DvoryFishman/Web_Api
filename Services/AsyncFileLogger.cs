using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace core.Services
{
    public class AsyncFileLogger : IHostedService, IDisposable, IAsyncFileLogger
    {
        private readonly ConcurrentQueue<LogEntry> _logQueue = new();
        private readonly string _logFilePath;
        private Task? _processingTask;
        private CancellationTokenSource? _cts;

        public AsyncFileLogger()
        {
            _logFilePath = Path.Combine(Directory.GetCurrentDirectory(), "logs.txt");
            Console.WriteLine($"[Logger] Initialized with log file: {_logFilePath}");
        }

        public void EnqueueLog(LogEntry logEntry)
        {
            _logQueue.Enqueue(logEntry);
            // כתוב לקובץ בצורה סינכרונית מיד
            try
            {
                File.AppendAllText(_logFilePath, logEntry.ToString() + Environment.NewLine);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Logger] Error writing log: {ex.Message}");
            }
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("[Logger] StartAsync called");
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("[Logger] StopAsync called");
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            Console.WriteLine("[Logger] Disposing");
        }
    }
}