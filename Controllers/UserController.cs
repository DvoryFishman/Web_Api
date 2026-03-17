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
    public class UserController : ControllerBase{
            [HttpGet("{id}/favorites")]
            public ActionResult<List<int>> GetFavorites(int id)
            {
                var user = UserService.GetUser(id);
                if (user == null)
                    return NotFound();
                return Ok(user.Favorites);
            }
    
        // public UserController()
        // {
        // }
        [HttpPost]
        [Route("login")]
        public ActionResult<User> Login([FromBody] User req)
        {
            var user = UserService.GetAllUsers().FirstOrDefault(u => u.Username == req.Username && u.Password == req.Password);
            if (user == null)
                return Unauthorized();
            return Ok(new { id = user.Id, username = user.Username, favorites = user.Favorites });
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

            return CreatedAtAction(nameof(CreateUser), new { id = user.Id, password = user.Password}, user);
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