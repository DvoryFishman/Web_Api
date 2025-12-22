
using Microsoft.AspNetCore.Mvc;
using core.Models;
using core.Services;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using core.Models;
using core.Services;
using CORE.Interfaces;

namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SongController : ControllerBase
    {
        Isong SongService
        public SongController(Isong SongService)
        {
            this.SongService = SongService;
        }

        [HttpGet]
        public ActionResult<List<Song>> GetAll() 
        {
            SongService.GetAll();
        }

        [HttpGet("{id}")]
        public ActionResult<Song> Get(int id)
        {
            var s = SongService.Get(id);
            if (s == null)
            {
                return NotFound();
            }
            return s;
        }

        [HttpPost]
        public IActionResult Create(Song song)
        {
            SongService.Add(song);
            return CreatedAtAction(nameof(Create), new { id = song.Id }, song);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Song song)
        {
            if (id != song.Id)
            {
                return BadRequest();
            }
            var existingSong = SongService.Get(id);
            if (existingSong is null)
                return NoContent();
            SongService.Update(song);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var song = SongService.Get(id);
            if (song is null)
            {
                return NotFound();
            }

            SongService.Delete(id);
            return Content(SongService.Count.ToString());
        }
    }
}