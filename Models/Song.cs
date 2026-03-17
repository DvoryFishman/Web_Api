
namespace core.Models
{
    public class Song
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Artist { get; set; } = ""; // שם הזמר
        public bool IsVocal { get; set; }
        public int UserId { get; set; } // בעלים של השיר
    }
}