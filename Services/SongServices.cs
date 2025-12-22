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
        private readonly List<Song> Songs;
        private int nextId = 3;
        private string filePath;
        public SongServices(IWebHostEnvironment webHost)
        {
            var dataPath = Path.Combine(webHost.ContentRootPath, "Data", "song.json");
            var rootPath = Path.Combine(webHost.ContentRootPath, "song.json");
            // prefer existing root song.json (you already have one), else use/create Data/song.json
            this.filePath = File.Exists(rootPath) ? rootPath : dataPath;
            var dir = Path.GetDirectoryName(this.filePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);

            if (!File.Exists(this.filePath))
            {
                File.WriteAllText(this.filePath, "[]");
                Songs = new List<Song>();
                return;
            }

            using (var jsonFile = File.OpenText(filePath))
            {
                var content = jsonFile.ReadToEnd();
                Songs = JsonSerializer.Deserialize<List<Song>>(content,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new List<Song>();
            }
            // initialize nextId based on existing items
            if (Songs.Count > 0) nextId = Songs.Max(s => s.Id) + 1;
        }
        private void saveToFile()
        {
            var text = JsonSerializer.Serialize(Songs, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(filePath, text);
        }

        public List<Song> GetAll() => Songs;
        public Song? Get(int id) => Songs.FirstOrDefault(p => p.Id == id);
        public void Add(Song song) { song.Id = nextId++; Songs.Add(song); saveToFile(); }
        public void Update(Song song) { var i = Songs.FindIndex(p => p.Id == song.Id); if (i != -1) Songs[i] = song; saveToFile(); }
        public void Delete(int id) { var s = Get(id); if (s != null) Songs.Remove(s); saveToFile(); }
        public int Count => Songs.Count;
    }
}