using core.Models;
using System.Collections.Generic;
using System.Linq;

namespace core.Services
{
    public static class SongService
    {
        static List<Song> Songs { get; }
        static int nextId = 3;
        static SongService()
        {
            Songs = new List<Song>
            {
                new Song { Id = 1, Name = "lift up your candle", isVocal = false },
                new Song { Id = 2, Name = "akavia", isVocal = true }
            };
        }

        public static List<Song> GetAll() => Songs;

        public static Song? Get(int id) => Songs.FirstOrDefault(p => p.Id == id);

        public static void Add(Song song)
        {
            song.Id = nextId++;
            Songs.Add(song);
        }

        public static void Delete(int id)
        {
            var song = Get(id);
            if(song is null)
                return;

            Songs.Remove(song);
        }

        public static void Update(Song song)
        {
            var index = Songs.FindIndex(p => p.Id == song.Id);
            if(index == -1)
                return;

            Songs[index] = song;
        }

        public static int Count => Songs.Count();
    }
}