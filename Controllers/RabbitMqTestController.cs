using core.Services;
using Microsoft.AspNetCore.Mvc;

namespace core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RabbitMqTestController : ControllerBase
    {
        private readonly IRabbitMqService _rabbitMqService;

        public RabbitMqTestController(IRabbitMqService rabbitMqService)
        {
            _rabbitMqService = rabbitMqService;
        }

        [HttpGet("test-queue")] // GET api/rabbitmqtest/test-queue
        public IActionResult TestQueue()
        {
            var channel = _rabbitMqService.Channel;
            string queueName = "test-queue";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
            var body = System.Text.Encoding.UTF8.GetBytes("Hello RabbitMQ!");
            channel.BasicPublish(exchange: "", routingKey: queueName, mandatory: false, basicProperties: null, body: body);
            
            return Ok("Message sent to RabbitMQ queue: " + queueName);
        }
    }
}
