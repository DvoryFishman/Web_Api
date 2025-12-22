
using Microsoft.AspNetCore.Mvc;
using core.Models;
using System.Collections.Generic;
using System.Linq;
using CORE.Interfaces;

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
        public ActionResult<List<Song>> GetAll()
        {
            return _songService.GetAll();
        }

        [HttpGet("{id}")]
        public ActionResult<Song> Get(int id)
        {
            var s = _songService.Get(id);
            if (s == null)
            {
                return NotFound();
            }
            return s;
        }

        [HttpPost]
        public IActionResult Create(Song song)
        {
            _songService.Add(song);
            return CreatedAtAction(nameof(Get), new { id = song.Id }, song);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Song song)
        {
            if (id != song.Id)
            {
                return BadRequest();
            }
            var existingSong = _songService.Get(id);
            if (existingSong is null)
                return NotFound();
            _songService.Update(song);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var song = _songService.Get(id);
            if (song is null)
            {
                return NotFound();
            }

            _songService.Delete(id);
            return Content(_songService.Count.ToString());
        }
    }
}