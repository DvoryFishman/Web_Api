var songs = [];
const uri = '/song';
let userFevorites = [];

const apiBaseUrl = '';

// Version: 2.0 - Fixed infinite loop issue

function getFavorites() {
    const token = sessionStorage.getItem('token');
    userFevorites = sessionStorage.getItem('userFavorites') ? JSON.parse(sessionStorage.getItem('userFavorites')) : [];
    if (!userFevorites.length) {
        alert('אין שירים מועדפים');
        return;
    }

    // הצג את הטבלה
    document.getElementById('songsTable').style.display = 'table';

    // תמיד מביא את כל השירים כדי למצוא את המועדפים
    fetch('/song', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // סינון רק לשירים מועדפים
            const favoriteSongs = data.filter(song => userFevorites.includes(song.id));
            _displayItems(favoriteSongs);
        })
        .catch(error => console.error('Unable to get favorites.', error));
}

function getItems() {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    console.log('getItems called, token:', token ? 'exists' : 'missing');

    // הצג את הטבלה
    document.getElementById('songsTable').style.display = 'table';

    // כל המשתמשים רואים את כל השירים
    fetch('/song', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Song fetch response:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Songs data received:', data);
            _displayItems(data);
        })
        .catch(error => console.error('Unable to get items.', error));
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

    const item = {
        isVocal: addIsVocal.checked,
        name: addNameTextbox.value.trim(),
        artist: addArtistTextbox.value.trim(),
        userId: userId
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
            if (response.ok) {
                addNameTextbox.value = '';
                addArtistTextbox.value = '';
                addIsVocal.checked = false;
                getItems();
            } else {
                alert('שגיאה בהוספת שיר');
            }
        })
        .catch(error => console.error('Unable to add item.', error));
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
    document.getElementById('edit-isVocal').checked = item.isVocal;
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
        isVocal: document.getElementById('edit-isVocal').checked,
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

        // Vocal indicator
        let vocalP = document.createElement('p');
        vocalP.className = 'song-vocal';
        vocalP.innerText = item.isVocal ? '👩 זמרת' : '👨 זמר';
        infoDiv.appendChild(vocalP);

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
            user.Favorites = favorites;
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
                    getItems();
                })
                .catch(error => console.error('Unable to update favorites.', error));
        });
}
