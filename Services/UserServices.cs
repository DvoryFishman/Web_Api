using core.Models;
using System.Collections.Generic;
using System.Linq;
namespace core.Services
{

    public static class UserService
    {
        static List<User> Users { get; }
        static int nextId = 4;
        static UserService()
        {
            Users = new List<User>
         {
            new User { Id = 1, Username = "Alice" },
            new User { Id = 2, Username = "Bob" },
            new User { Id = 3, Username = "Charlie" }
         };
        }

        public static List<User> GetAllUsers() => Users;
        public static User? GetUser(int id) => Users.FirstOrDefault(u => u.Id == id);
        public static void AddUser(User user)
        {
            user.Id = nextId++;
            Users.Add(user);
        }
        public static void DeleteUser(int id)
        {
            var user = GetUser(id);
            if (user is null)
                return;

            Users.Remove(user);
        }
        public static void UpdateUser(User user)
        {
            var index = Users.FindIndex(u => u.Id == user.Id);
            if (index == -1)
                return;

            Users[index] = user;
        }
        public static int Count => Users.Count();
    }
}