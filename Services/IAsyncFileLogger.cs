using System.Threading.Tasks;

namespace core.Services
{
    public interface IAsyncFileLogger
    {
        void EnqueueLog(LogEntry logEntry);
    }
}