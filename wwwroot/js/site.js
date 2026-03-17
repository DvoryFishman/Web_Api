var songs = [];
const uri = '/song';
let userId = localStorage.getItem('userId');
let token = localStorage.getItem('token');
let userFevorites = localStorage.getItem('userFavorites') ? JSON.parse(localStorage.getItem('userFavorites')) : [];

const apiBaseUrl = '';

function checkAuth() {
    if (!token || !userId) {
        window.location.href = '/login.html';
        return;
    }

    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (username) {
        document.getElementById('userName').innerText = username;
    }

    // הצג כפתורי ניהול למנהל
    if (role === 'Admin') {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = 'inline-block';
        }
    }
}

function getFavorites() {
    checkAuth();
    userFevorites = localStorage.getItem('userFavorites') ? JSON.parse(localStorage.getItem('userFavorites')) : [];
    if (!userFevorites.length) {
        alert('אין שירים מועדפים');
        return;
    }

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
    checkAuth();
    const role = localStorage.getItem('role');

    // כל המשתמשים רואים את כל השירים
    fetch('/song', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    checkAuth();
    const role = localStorage.getItem('role');

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
    checkAuth();
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
    checkAuth();
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
    const tBody = document.getElementById('songs');
    tBody.innerHTML = '';

    _displayCount(data.length);

    const button = document.createElement('button');

    data.forEach(item => {
        let isVocalCheckbox = document.createElement('input');
        isVocalCheckbox.type = 'checkbox';
        isVocalCheckbox.disabled = true;
        isVocalCheckbox.checked = item.isVocal;

        let editButton = button.cloneNode(false);
        editButton.innerText = 'ערוך';
        editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'מחק';
        deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

        let favButton = button.cloneNode(false);
        favButton.innerText = userFevorites.includes(item.id) ? '❤️ מועדף' : '🤍 הוסף למועדפים';
        favButton.setAttribute('onclick', `toggleFavorite(${item.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(isVocalCheckbox);

        let td2 = tr.insertCell(1);
        let textNode = document.createTextNode(item.name);
        td2.appendChild(textNode);

        let td3 = tr.insertCell(2);
        let artistNode = document.createTextNode(item.artist || 'לא צוין');
        td3.appendChild(artistNode);

        let td4 = tr.insertCell(3);
        td4.appendChild(editButton);

        let td5 = tr.insertCell(4);
        td5.appendChild(deleteButton);

        let td6 = tr.insertCell(5);
        td6.appendChild(favButton);
    });
    songs = data;
}

function toggleFavorite(songId) {
    checkAuth();
    userFevorites = localStorage.getItem('userFavorites') ? JSON.parse(localStorage.getItem('userFavorites')) : [];

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
                    localStorage.setItem('userFavorites', JSON.stringify(favorites));
                    userFevorites = favorites;
                    getItems();
                })
                .catch(error => console.error('Unable to update favorites.', error));
        });
}
