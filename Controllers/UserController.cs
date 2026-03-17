using Microsoft.AspNetCore.Mvc;
using core.Models;
using core.Services;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        [HttpGet("{id}/favorites")]
        [Authorize(Policy = "UserOrAdmin")]
        public ActionResult<List<int>> GetFavorites(int id)
        {
            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var user = UserService.GetUser(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user.Favorites);
        }

        [HttpPost]
        [Route("login")]
        public ActionResult<object> Login([FromBody] User req)
        {
            var user = UserService.GetAllUsers().FirstOrDefault(u => u.Username == req.Username && u.Password == req.Password);
            if (user == null)
            {
                return Unauthorized();
            }

            // יצירת claims עם role
            List<Claim> claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = usersTokenService.GetToken(claims);
            string tokenString = usersTokenService.WriteToken(token);

            return Ok(new { 
                id = user.Id, 
                username = user.Username, 
                role = user.Role,
                favorites = user.Favorites,
                token = tokenString 
            });
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public ActionResult<List<User>> GetAllUsers()
        {
            Console.WriteLine("GetAllUsers called");
            Console.WriteLine($"IsAuthenticated: {User?.Identity?.IsAuthenticated}");
            Console.WriteLine($"Identity Name: {User?.Identity?.Name}");
            foreach (Claim claim in User?.Claims ?? new List<Claim>())
            {
                Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
            }
            return UserService.GetAllUsers();
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "UserOrAdmin")]
        public ActionResult<User> GetUser(int id)
        {
            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (currentUserId != id && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            User? user = UserService.GetUser(id);
            if (user is null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult CreateUser(User user)
        {
            UserService.AddUser(user);
            return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "UserOrAdmin")]
        public IActionResult UpdateUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            bool isAdmin = User.IsInRole("Admin");

            // משתמש רגיל לא יכול לערוך משתמשים אחרים
            if (!isAdmin && currentUserId != id)
            {
                return Forbid();
            }

            // משתמש רגיל לא יכול לשנות את התפקיד שלו
            if (!isAdmin)
            {
                User? existingUser = UserService.GetUser(id);
                if (existingUser is not null)
                {
                    user.Role = existingUser.Role; // לא מאפשרים שינוי של Role
                }
            }

            UserService.UpdateUser(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult DeleteUser(int id)
        {
            User? user = UserService.GetUser(id);
            if (user is null)
            {
                return NotFound();
            }

            UserService.DeleteUser(id);
            return Ok(UserService.GetAllUsers());
        }
    }
}