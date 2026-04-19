using core.Models;
using CORE.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
namespace core.Services
{
    public class SongServices : Isong      
    {
        public Task<IEnumerable<Song>> GetByUserId(int userId)
        {
            // אין userId לשיר, לכן מחזירים את כל השירים
            return Task.FromResult(Songs.AsEnumerable());
        }
        private readonly List<Song> Songs;
        private int nextId = 3;
        private string filePath;
        
        public SongServices(IWebHostEnvironment webHost)
        {
            // השתמש בקובץ יחיד: wwwroot/Data/song.json
            this.filePath = Path.Combine(webHost.WebRootPath, "Data", "song.json");
            Console.WriteLine($"[SongServices] WebRootPath: {webHost.WebRootPath}");
            Console.WriteLine($"[SongServices] Final filePath: {this.filePath}");
            
            var dir = Path.GetDirectoryName(this.filePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);

            if (!File.Exists(this.filePath))
            {
                Console.WriteLine($"[SongServices] File does not exist, creating: {this.filePath}");
                File.WriteAllText(this.filePath, "[]");
                Songs = new List<Song>();
                return;
            }

            Console.WriteLine($"[SongServices] File exists, loading from: {this.filePath}");
            using (var jsonFile = File.OpenText(filePath))
            {
                var content = jsonFile.ReadToEnd();
                Console.WriteLine($"[SongServices] File content length: {content.Length}");
                Songs = JsonSerializer.Deserialize<List<Song>>(content,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new List<Song>();
            }
            // initialize nextId based on existing items
            if (Songs.Count > 0) nextId = Songs.Max(s => s.Id) + 1;
            Console.WriteLine($"[SongServices] Loaded {Songs.Count} songs, nextId: {nextId}");
        }
        private void saveToFile()
        {
            var options = new JsonSerializerOptions 
            { 
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var text = JsonSerializer.Serialize(Songs, options);
            Console.WriteLine($"[SongServices.saveToFile] Writing {Songs.Count} songs to {filePath}");
            File.WriteAllText(filePath, text);
            Console.WriteLine($"[SongServices.saveToFile] File saved successfully");
        }

        public List<Song> GetAll() => Songs;
        public Song? Get(int id) => Songs.FirstOrDefault(p => p.Id == id);
        public void Add(Song song) 
        { 
            song.Id = nextId++; 
            Console.WriteLine($"[SongServices.Add] Adding song: {song.Name} with ID: {song.Id}");
            Songs.Add(song); 
            saveToFile(); 
        }
        public void Update(Song song) { var i = Songs.FindIndex(p => p.Id == song.Id); if (i != -1) Songs[i] = song; saveToFile(); }
        public void Delete(int id) { var s = Get(id); if (s != null) Songs.Remove(s); saveToFile(); }
        public int Count => Songs.Count;
    }
}