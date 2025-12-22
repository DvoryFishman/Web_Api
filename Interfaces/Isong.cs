using System.Collections.Generic;
using core.Models;

namespace CORE.Interfaces;


public interface Isong
{
    List<Song> GetAll();

    Song? Get(int id);
    void Add(Song song);
    void Update(Song song);

    void Delete(int id);
    int Count { get; }

}
