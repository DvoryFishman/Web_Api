using core.Models;
using System.Collections.Generic;
using System.Linq;
using core.Services;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace core.Services
{
    public static class UserService
    {
        static List<User>? Users { get; set; }
        static int nextId = 1;
        static string filePath = System.IO.Path.Combine("Data", "users.json");

        static UserService()
        {
            LoadUsers();
        }

        public static void LoadUsers()
        {
            if (!System.IO.File.Exists(filePath))
            {
                Users = new List<User>();
                return;
            }
            var json = System.IO.File.ReadAllText(filePath);
            Users = System.Text.Json.JsonSerializer.Deserialize<List<User>>(json,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
            if (Users.Count > 0) nextId = Users.Max(u => u.Id) + 1;
        }

        public static void SaveUsers()
        {
            var json = System.Text.Json.JsonSerializer.Serialize(Users, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(filePath, json);
        }

        public static List<User> GetAllUsers() => Users;
        public static User? GetUser(int id) => Users.FirstOrDefault(u => u.Id == id);
        public static User? GetUserByUsername(string username) => Users.FirstOrDefault(u => u.Username == username);
        public static void AddUser(User user, IServiceProvider? serviceProvider = null)
        {
            user.Id = nextId++;
            Users.Add(user);
            SaveUsers();

            // שליחת הודעה ל-RabbitMQ אם יש ServiceProvider
            if (serviceProvider != null)
            {
                try
                {
                    var rabbitService = serviceProvider.GetService<IRabbitMqService>();
                    if (rabbitService != null)
                    {
                        var channel = rabbitService.Channel;
                        string queueName = "user-events";
                        channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
                        var userJson = System.Text.Json.JsonSerializer.Serialize(user);
                        var body = Encoding.UTF8.GetBytes(userJson);
                        channel.BasicPublish(exchange: "", routingKey: queueName, mandatory: false, basicProperties: null, body: body);
                    }
                }
                catch (Exception ex)
                {
                    // אפשר להוסיף לוג או טיפול בשגיאות
                    Console.WriteLine($"RabbitMQ error: {ex.Message}");
                }
            }
        }
        public static void DeleteUser(int id)
        {
            var user = GetUser(id);
            if (user is null)
                return;
            Users.Remove(user);
            SaveUsers();
        }
        public static void UpdateUser(User user)
        {
            var index = Users.FindIndex(u => u.Id == user.Id);
            if (index == -1)
                return;
            Users[index] = user;
            SaveUsers();
        }
        public static int Count => Users.Count();
    }
}