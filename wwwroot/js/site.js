var songs = [];
var allSongs = []; // לשמירת כל השירים ללא סינון
const uri = '/song';
let userFevorites = [];
let isShowingFavorites = false;

const apiBaseUrl = '';

// Version: 3.0 - Fixed favorites toggle and display

function toggleFavoritesView() {
    const btn = document.getElementById('favoritesToggleBtn');
    
    if (isShowingFavorites) {
        // חזור לרשימה הכללית - הצג את כל השירים
        isShowingFavorites = false;
        btn.innerText = 'הצג שירים מועדפים';
        console.log('Showing all songs:', allSongs.length);
        songs = allSongs; // החזר את כל השירים
        _displayItems(allSongs);
    } else {
        // הצג מועדפים בלבד
        userFevorites = sessionStorage.getItem('userFavorites') 
            ? JSON.parse(sessionStorage.getItem('userFavorites')) 
            : [];
            
        if (!userFevorites || userFevorites.length === 0) {
            alert('אין שירים מועדפים');
            return;
        }
        isShowingFavorites = true;
        btn.innerText = 'חזור לרשימת השירים';
        const favoriteSongs = allSongs.filter(song => userFevorites.includes(song.id));
        console.log('Showing favorite songs:', favoriteSongs.length);
        _displayItems(favoriteSongs);
    }
}

function getFavorites() {
    const token = sessionStorage.getItem('token');
    userFevorites = sessionStorage.getItem('userFavorites') ? JSON.parse(sessionStorage.getItem('userFavorites')) : [];
    if (!userFevorites.length) {
        alert('אין שירים מועדפים');
        return;
    }

    console.log('getFavorites called, userFavorites:', userFevorites);
    // סינון רק לשירים מועדפים
    const favoriteSongs = songs.filter(song => userFevorites.includes(song.id));
    _displayItems(favoriteSongs);
}

function getItems() {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    const userId = sessionStorage.getItem('userId');
    console.log('getItems called, token:', token ? 'exists' : 'missing');

    // טעון את השירים מה-API כדי להציג גם שירים שנוספו דרך POST
    fetch('/song', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Song API fetch response:', response.status);
            if (!response.ok) {
                throw new Error('Failed to load songs from API');
            }
            return response.json();
        })
        .then(data => {
            console.log('Songs data received:', data);
            console.log('Number of songs:', data.length);
            songs = data; // שמור בגלובל
            allSongs = data; // שמור גם את כל השירים
            
            // טעון את המועדפים מה-backend
            if (token && userId) {
                loadUserFavorites(token, userId);
            } else {
                _displayItems(songs);
            }
        })
        .catch(error => {
            console.error('Unable to get items from Data/song.json.', error);
            alert('שגיאה בטעינת הנתונים: ' + error.message);
        });
}

function loadUserFavorites(token, userId) {
    fetch(`/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.warn('Could not load user favorites');
                return null;
            }
        })
        .then(user => {
            if (user && user.favorites) {
                userFevorites = user.favorites;
                sessionStorage.setItem('userFavorites', JSON.stringify(userFevorites));
                console.log('Loaded user favorites:', userFevorites);
            }
            _displayItems(songs);
        })
        .catch(error => {
            console.error('Error loading favorites:', error);
            _displayItems(songs);
        });
}

function addItem() {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const role = sessionStorage.getItem('role');

    // רק מנהל יכול להוסיף שיר חדש
    if (role !== 'Admin') {
        alert('רק מנהל יכול להוסיף שיר חדש');
        return;
    }

    const addNameTextbox = document.getElementById('add-name');
    const addArtistTextbox = document.getElementById('add-artist');
    const addIsVocal = document.getElementById('add-isVocal');

    if (!addNameTextbox.value.trim() || !addArtistTextbox.value.trim()) {
        alert('אנא מלא את כל השדות');
        return;
    }

    const songName = addNameTextbox.value.trim();
    const artistName = addArtistTextbox.value.trim();
    
    const item = {
        isVocal: false, // ברירת מחדל
        name: songName,
        artist: artistName,
        userId: userId,
        audioUrl: `/songs/${artistName} - ${songName}.mp3`
    };

    fetch(`/song`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            console.log('Add song response status:', response.status);
            if (response.ok) {
                addNameTextbox.value = '';
                addArtistTextbox.value = '';
                alert('שיר נוסף בהצלחה!');
                getItems();
            } else {
                response.text().then(text => {
                    console.error('Server error response:', text);
                    alert(`שגיאה בהוספת שיר (${response.status}): ${text}`);
                });
            }
        })
        .catch(error => {
            console.error('Unable to add item.', error);
            alert('שגיאה בהוספת שיר: ' + error.message);
        });
}

function deleteItem(id) {
    const token = sessionStorage.getItem('token');
    if (!confirm('האם אתה בטוח שברצונך למחוק שיר זה?')) {
        return;
    }

    fetch(`/song/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                getItems();
            } else {
                alert('שגיאה במחיקת שיר');
            }
        })
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {
    const item = songs.find(item => item.id === id);

    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-artist').value = item.artist || '';
    document.getElementById('edit-id').value = item.id;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    const itemId = document.getElementById('edit-id').value;
    const editArtistTextbox = document.getElementById('edit-artist');

    if (!document.getElementById('edit-name').value.trim() || !editArtistTextbox.value.trim()) {
        alert('אנא מלא את כל השדות');
        return false;
    }

    const item = {
        id: parseInt(itemId, 10),
        isVocal: songs.find(song => song.id === parseInt(itemId, 10))?.isVocal ?? false,
        name: document.getElementById('edit-name').value.trim(),
        artist: editArtistTextbox.value.trim(),
        userId: userId
    };

    fetch(`/song/${itemId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.ok) {
                getItems();
            } else {
                alert('שגיאה בעדכון שיר');
            }
        })
        .catch(error => console.error('Unable to update item.', error));

    closeInput();

    return false;
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(itemCount) {
    const name = (itemCount === 1) ? 'שיר' : 'שירים';

    document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function _displayItems(data) {
    const container = document.getElementById('songs');
    container.innerHTML = '';

    _displayCount(data.length);

    data.forEach(item => {
        // Create card container
        let card = document.createElement('div');
        card.className = 'song-card';

        // Create image section
        let imageDiv = document.createElement('div');
        imageDiv.className = 'song-image';
        imageDiv.innerHTML = '<span class="music-icon">🎵</span>';
        card.appendChild(imageDiv);

        // Create info section
        let infoDiv = document.createElement('div');
        infoDiv.className = 'song-info';

        // Title
        let titleP = document.createElement('p');
        titleP.className = 'song-title';
        titleP.innerText = item.name;
        infoDiv.appendChild(titleP);

        // Artist
        let artistP = document.createElement('p');
        artistP.className = 'song-artist';
        artistP.innerText = item.artist || 'לא צוין';
        infoDiv.appendChild(artistP);

        // Vocal indicator - הסיר ימוג'י
        // (ניתן להוסיף בעתיד אם נדרש)

        // Audio player
        let playerDiv = document.createElement('div');
        playerDiv.className = 'song-player';
        let audio = document.createElement('audio');
        audio.controls = true;
        audio.style.width = '100%';
        // Set audio source from item.AudioUrl if available
        if (item.audioUrl) {
            audio.innerHTML = `<source src="${item.audioUrl}" type="audio/mpeg">הדפדפן שלך לא תומך בהשמעה`;
        } else {
            audio.innerHTML = '<source src="" type="audio/mpeg">אין קובץ שיר זמין';
        }
        playerDiv.appendChild(audio);
        infoDiv.appendChild(playerDiv);

        // Controls section
        let controlsDiv = document.createElement('div');
        controlsDiv.className = 'song-controls';

        // Edit button
        let editBtn = document.createElement('button');
        editBtn.className = 'song-edit-btn';
        editBtn.innerText = '✏️ ערוך';
        editBtn.setAttribute('onclick', `displayEditForm(${item.id})`);
        controlsDiv.appendChild(editBtn);

        // Delete button
        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'song-delete-btn';
        deleteBtn.innerText = '🗑️ מחק';
        deleteBtn.setAttribute('onclick', `deleteItem(${item.id})`);
        controlsDiv.appendChild(deleteBtn);

        // Favorite button
        let favBtn = document.createElement('button');
        favBtn.className = 'song-favorite-btn';
        if (userFevorites.includes(item.id)) {
            favBtn.classList.add('active');
            favBtn.style.background = '#e74c3c';
            favBtn.style.color = 'white';
            favBtn.innerText = '❤️ מועדף';
        } else {
            favBtn.innerText = '🤍 למועדפים';
        }
        favBtn.setAttribute('onclick', `toggleFavorite(${item.id})`);
        controlsDiv.appendChild(favBtn);

        infoDiv.appendChild(controlsDiv);
        card.appendChild(infoDiv);

        container.appendChild(card);
    });
    songs = data;
}
    
function toggleFavorite(songId) {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    userFevorites = sessionStorage.getItem('userFavorites') ? JSON.parse(sessionStorage.getItem('userFavorites')) : [];

    // משתמש יכול להוסיף רק לעצמו למועדפים
    fetch(`/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(user => {
            let favorites = user.favorites || [];
            if (favorites.includes(songId)) {
                favorites = favorites.filter(id => id !== songId);
            } else {
                favorites.push(songId);
            }
            user.favorites = favorites; // תיקון: קטן
            fetch(`/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(() => {
                    sessionStorage.setItem('userFavorites', JSON.stringify(favorites));
                    userFevorites = favorites;
                    console.log('Favorites updated:', favorites);
                    // רק עדכן את הכפתור בלי לטעון מחדש
                    updateFavoriteButton(songId);
                })
                .catch(error => console.error('Unable to update favorites.', error));
        })
        .catch(error => console.error('Error fetching user:', error));
}

function updateFavoriteButton(songId) {
    // מצא את כל הקרטים וחפש את הכפתור שמתאים לשיר הזה
    const cards = document.querySelectorAll('div.song-card');
    
    cards.forEach(card => {
        // קבל את שם השיר מהקרט
        const titleElement = card.querySelector('p.song-title');
        
        // מצא את השיר בנתונים
        const song = songs.find(s => s.name === titleElement.innerText);
        
        if (song && song.id === songId) {
            const favBtn = card.querySelector('button.song-favorite-btn');
            if (favBtn) {
                if (userFevorites.includes(songId)) {
                    favBtn.classList.add('active');
                    favBtn.style.background = '#e74c3c';
                    favBtn.style.color = 'white';
                    favBtn.innerText = '❤️ מועדף';
                } else {
                    favBtn.classList.remove('active');
                    favBtn.style.background = '';
                    favBtn.style.color = '';
                    favBtn.innerText = '🤍 למועדפים';
                }
            }
        }
    });
}
