
using Microsoft.AspNetCore.Mvc;
using core.Models;
using core.Services;

namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SongController : ControllerBase
    {
        ISongService SongService
        public SongController( ISongService SongService)
        {
        }

        [HttpGet]
        public ActionResult<List<Song>> GetAll()
        {
            return SongService.GetAll();
        }

        [HttpGet("{id}")]
        public ActionResult<Song> Get(int id)
        {
            Song? song = SongService.Get(id);
            if (song == null)
            {
                return NotFound();
            }
            return song;
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
            SongService.Update(song);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            Song? song = SongService.Get(id);
            if (song is null)
            {
                return NotFound();
            }

            SongService.Delete(id);
            return Ok(SongService.GetAll());
        }
    }
}