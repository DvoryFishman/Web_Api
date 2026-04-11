using Microsoft.AspNetCore.Mvc;
using core.Models;
using System.Collections.Generic;
using System.Linq;
using CORE.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using core.Controllers.Hubs;

namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SongController : ControllerBase
    {
        private readonly Isong _songService;

        private async Task NotifyUser(int userId, string message)
        {
            var context = HttpContext.RequestServices.GetService<IHubContext<NotificationHub>>();
            var connections = NotificationHub.GetConnections(userId.ToString());
            if (connections.Any() && context != null)
            {
                await context.Clients.Clients(connections).SendAsync("ReceiveMessage", message);
            }
        }

        [HttpPut("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] Song updateModel)
        {
            // שליחת הודעה לכל החיבורים של המשתמש
            var context = HttpContext.RequestServices.GetService<IHubContext<NotificationHub>>();
            var connectionIds = NotificationHub.GetConnections(userId.ToString());
            if (connectionIds.Count > 0 && context != null)
            {
                await context.Clients.Clients(connectionIds).SendAsync("ReceiveMessage", "Your profile has been updated by an admin.");
            }
            return NoContent();
        }

       [HttpPut("user/{userId}/admin-update")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> AdminUpdateUser(int userId, [FromBody] User updateModel)
{
    var user = core.Services.UserService.GetUser(userId);
    if (user == null)
    {
        Console.WriteLine($"[AdminUpdateUser] User {userId} not found");
        return NotFound();
    }

    string adminName = User.FindFirst("username")?.Value ?? "מנהל";
    List<string> changes = new();

    if (updateModel.Favorites != null && !user.Favorites.SequenceEqual(updateModel.Favorites))
    {
        user.Favorites = new List<int>(updateModel.Favorites);
        changes.Add("המועדפים");
    }
    if (!string.IsNullOrEmpty(updateModel.Username) && updateModel.Username != user.Username)
    {
        user.Username = updateModel.Username;
        changes.Add("שם המשתמש");
    }
    if (!string.IsNullOrEmpty(updateModel.Password) && updateModel.Password != user.Password)
    {
        user.Password = updateModel.Password;
        changes.Add("הסיסמה");
    }
    if (!string.IsNullOrEmpty(updateModel.Role) && updateModel.Role != user.Role)
    {
        user.Role = updateModel.Role;
        changes.Add("ההרשאות");
    }

    core.Services.UserService.SaveUsers();

    var context = HttpContext.RequestServices.GetService<IHubContext<core.Controllers.Hubs.NotificationHub>>();
    var connectionIds = core.Controllers.Hubs.NotificationHub.GetConnections(userId.ToString());
    Console.WriteLine($"[AdminUpdateUser] connectionIds for user {userId}: {string.Join(",", connectionIds)}");
    Console.WriteLine($"[AdminUpdateUser] changes: {string.Join(", ", changes)}");
    if (connectionIds != null && connectionIds.Count > 0 && context != null && changes.Count > 0)
    {
        string htmlMsg = $"<div style='color:#2196F3;font-weight:bold;'>המנהל <span style='color:#E91E63'>{adminName}</span> שינה לך את: <span style='color:#4CAF50'>{string.Join(", ", changes)}</span></div>";
        Console.WriteLine($"[AdminUpdateUser] Sending SignalR message: {htmlMsg}");
        await context.Clients.Clients(connectionIds).SendAsync("ReceiveMessage", htmlMsg);
    }
    else
    {
        Console.WriteLine($"[AdminUpdateUser] No connections or no changes or context is null");
    }
    return NoContent();
}
        public SongController(Isong songService)
        {
            _songService = songService;
        }

        [HttpGet]
        [Authorize(Policy = "UserOrAdmin")]
        public ActionResult<List<Song>> GetAll()
        {
            return _songService.GetAll();
        }

        [HttpGet("user/{userId}")]
        [Authorize(Policy = "UserOrAdmin")]
        public async Task<ActionResult<List<Song>>> GetByUserId(int userId)
        {
            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (currentUserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var obtainedUser = core.Services.UserService.GetUser(userId);
            if (obtainedUser == null || obtainedUser.Favorites == null)
            {
                return NotFound();
            }

            var allSongs = (await _songService.GetByUserId(userId)).ToList();
            var favSongs = allSongs.Where(s => obtainedUser.Favorites.Contains(s.Id)).ToList();
            return favSongs;
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "UserOrAdmin")]
        public ActionResult<Song> Get(int id)
        {
            Song? song = _songService.Get(id);
            if (song == null)
            {
                return NotFound();
            }

            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (song.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return song;
        }

        [HttpPost]
        [Authorize(Policy = "UserOrAdmin")]
        public async Task<IActionResult> Create(Song song)
        {
            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            song.UserId = currentUserId;
            _songService.Add(song);
            await NotifyUser(currentUserId, $"נוסף שיר חדש: {song.Name}");
            return CreatedAtAction(nameof(Get), new { id = song.Id }, song);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "UserOrAdmin")]
        public IActionResult Update(int id, Song song)
        {
            if (id != song.Id)
            {
                return BadRequest();
            }

            Song? existingSong = _songService.Get(id);
            if (existingSong is null)
            {
                return NotFound();
            }

            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (existingSong.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            song.UserId = existingSong.UserId; // לא מאפשרים שינוי של UserId
            _songService.Update(song);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "UserOrAdmin")]
        public IActionResult Delete(int id)
        {
            Song? song = _songService.Get(id);
            if (song is null)
            {
                return NotFound();
            }

            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (song.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _songService.Delete(id);
            return Content(_songService.Count.ToString());
        }
    }
}