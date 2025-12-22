using Microsoft.AspNetCore.Mvc;
using core.Models;
using core.Services;

namespace core.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        public UserController()
        {
        }

        [HttpGet]
        public ActionResult<List<User>> GetAllUsers()
        {
            return UserService.GetAllUsers();
        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUser(int id)
        {
            var user = UserService.GetUser(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public IActionResult CreateUser(User user)
        {
            UserService.AddUser(user);
            return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }
            UserService.UpdateUser(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = UserService.GetUser(id);
            if (user is null)
            {
                return NotFound();
            }

            UserService.DeleteUser(id);
            return Ok(UserService.GetAllUsers());
        }
    }
}