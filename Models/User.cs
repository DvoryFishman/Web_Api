namespace core.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public List<int> Favorites { get; set; } = new List<int>(); // מזהי שירים מועדפים
        public string Role { get; set; } = "User"; // תפקיד: Admin או User
    }
}
