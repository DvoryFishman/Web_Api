using Microsoft.AspNetCore.Mvc;
using core.Models;
using core.Services;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using core.Controllers.Hubs;
namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        // הוסף את ה-Hub כפרט לקונטרולר
        private readonly IHubContext<NotificationHub> _hubContext;

        // עדכן את הבנאי של הקונטרולר
        public UserController(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        private async Task NotifyUser(int userId, string htmlMessage)
        {
            var connections = NotificationHub.GetConnections(userId.ToString());
            if (connections != null && connections.Count > 0)
            {
                await _hubContext.Clients.Clients(connections).SendAsync("ReceiveMessage", htmlMessage);
            }
        }

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
public async Task<IActionResult> UpdateUser(int id, User user)
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

    // שלח הודעה לכל החיבורים של המשתמש
    string adminName = User.FindFirst("username")?.Value ?? "משתמש";
    string message = isAdmin && currentUserId != id
        ? $"<div style='color:#fff;font-weight:bold;font-size:18px;padding:20px;background:linear-gradient(135deg, #E91E63 0%, #F06292 100%);border-radius:8px;text-align:center;box-shadow:0 6px 20px rgba(233, 30, 99, 0.4);'>המנהל <span style='color:#FFE082'>{adminName}</span> עדכן את פרטיך!</div>"
        : "<div style='color:#fff;font-weight:bold;font-size:18px;padding:20px;background:linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);border-radius:8px;text-align:center;box-shadow:0 6px 20px rgba(76, 205, 196, 0.4);'>הפרטים שלך עודכנו בהצלחה!</div>";

    await NotifyUser(user.Id, message);

    return NoContent();
}

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            User? user = UserService.GetUser(id);
            if (user is null)
            {
                return NotFound();
            }

            // שלח הודעה למשתמש שלחצו עליו - אם הוא עדיין מחובר
            string adminName = User.FindFirst("username")?.Value ?? "מנהל";
            string message = $"<div style='color:#F44336;font-weight:bold;padding:10px;background:#FFEBEE;border-radius:4px;'>⚠️ המנהל <span style='color:#E91E63'>{adminName}</span> מחק את החשבון שלך! עליך להתחבר שוב.</div>";
            await NotifyUser(user.Id, message);

            UserService.DeleteUser(id);
            return Ok(UserService.GetAllUsers());
        }
    }
}