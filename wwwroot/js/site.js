var songs = [];
const uri = '/song';
let userId = localStorage.getItem('userId'); // יש להגדיר את userId לאחר התחברות
let userFevorites =  localStorage.getItem('userFavorites') ? JSON.parse(localStorage.getItem('userFavorites')) : [];


function getFavorites() {
    userFevorites = localStorage.getItem('userFavorites') ? JSON.parse(localStorage.getItem('userFavorites')) : [];
    if (!userFevorites.length) {
        alert('אין שירים מועדפים');
        return;
    }
    fetch(uri)
        .then(response => response.json())
        .then(allSongs => {
            const favSongs = allSongs.filter(song => userFevorites.includes(song.id));
            _displayItems(favSongs);
        })
        .catch(error => console.error('Unable to get favorites.', error));
}
function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const addNameTextbox = document.getElementById('add-name');

    const item = {
        isVocal: false,
        name: addNameTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.ok) {
                getItems();
            }
        })
        .catch(error => console.error('Unable to add item.', error));
    // closeInput();
    // return false;
}
function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {
    const item = songs.find(item => item.id === id);

    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-isGlutenFree').checked = item.isVocal;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const itemId = document.getElementById('edit-id').value;
    const item = {
        id: parseInt(itemId, 10),
        isVocal: document.getElementById('edit-isGlutenFree').checked,
        name: document.getElementById('edit-name').value.trim()
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.ok) {
                getItems();
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
    const name = (itemCount === 1) ? 'song' : 'song kinds';

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
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

        let favButton = button.cloneNode(false);
        favButton.innerText = 'מועדף';
        favButton.setAttribute('onclick', `toggleFavorite(${item.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(isVocalCheckbox);

        let td2 = tr.insertCell(1);
        let textNode = document.createTextNode(item.name);
        td2.appendChild(textNode);

        let td3 = tr.insertCell(2);
        td3.appendChild(editButton);

        let td4 = tr.insertCell(3);
        td4.appendChild(deleteButton);

        let td5 = tr.insertCell(4);
        td5.appendChild(favButton);
    });
    songs = data;
}

function toggleFavorite(songId) {
    userId = localStorage.getItem('userId');
    userFevorites =  localStorage.getItem('userFavorites') ? JSON.parse(localStorage.getItem('userFavorites')) : [];
    if (!userId) {
        alert('יש להתחבר קודם');
        return;
    }
    fetch(`/user/${userId}`)
        .then(response => response.json())
        .then(user => {
            let favorites = user.Favorites || [];
            console.log(favorites);
            if (favorites.includes(songId)) {
                favorites = favorites.filter(id => id !== songId);
            } else {
                favorites.push(songId);
            }
            user.Favorites = favorites;
            fetch(`/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(() => getItems())
                .catch(error => console.error('Unable to update favorites.', error));
        });
}

// ...existing code...
