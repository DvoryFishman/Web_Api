using RabbitMQ.Client;

namespace core.Services
{
    public interface IRabbitMqService
    {
        RabbitMQ.Client.IModel Channel { get; }
    }

    public class RabbitMqService : IRabbitMqService, IDisposable
    {
        private readonly RabbitMQ.Client.IConnection _connection;
        public RabbitMQ.Client.IModel Channel { get; }

        public RabbitMqService(RabbitMQ.Client.IConnection connection)
        {
            _connection = connection;
            Channel = _connection.CreateModel();
            // כאן אפשר להגדיר תורים/הגדרות ראשוניות
        }

        public void Dispose()
        {
            Channel?.Dispose();
            _connection?.Dispose();
        }
    }
}
