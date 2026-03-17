
using Microsoft.AspNetCore.Mvc;
using core.Models;
using System.Collections.Generic;
using System.Linq;
using CORE.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SongController : ControllerBase
    {
        private readonly Isong _songService;

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
        public IActionResult Create(Song song)
        {
            int currentUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            song.UserId = currentUserId;
            _songService.Add(song);
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