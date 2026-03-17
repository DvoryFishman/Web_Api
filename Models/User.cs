namespace core.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
         public string Password { get; set; }
        public List<int> Favorites { get; set; } = new List<int>(); // מזהי שירים מועדפים
    }
}
