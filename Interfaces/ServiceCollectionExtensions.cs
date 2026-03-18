using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddRabbitMq(this IServiceCollection services, string rabbitMqUri)
    {
        services.AddSingleton<IConnection>(sp =>
        {
            var factory = new ConnectionFactory() { Uri = new Uri(rabbitMqUri) };
            return factory.CreateConnection();
        });
        services.AddSingleton<core.Services.IRabbitMqService, core.Services.RabbitMqService>();
        return services;
    }
}
