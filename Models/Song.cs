
namespace core.Models
{
    public class Song
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public bool isVocal { get; set; }
    }
}