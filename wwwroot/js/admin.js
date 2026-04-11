let currentUserId = null;
let token = sessionStorage.getItem('token');
const apiBaseUrl = '';

console.log('Token:', token);
console.log('Role:', sessionStorage.getItem('role'));

// Check if user is logged in and is admin
function checkAdminAccess() {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    const role = sessionStorage.getItem('role');
    if (role !== 'Admin') {
        alert('אתה לא מורשה לגשת לדף זה');
        window.location.href = '/user.html';
        return;
    }

    loadUsers();
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type} active`;
    setTimeout(() => {
        messageDiv.classList.remove('active');
    }, 3000);
}

async function loadUsers() {
    try {
        const response = await fetch(`/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
            }
            throw new Error('שגיאה בטעינת משתמשים');
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error:', error);
        showMessage('שגיאה בטעינת משתמשים', 'error');
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    if (users.length === 0) {
        usersList.innerHTML = '<p>אין משתמשים</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info">
                <div class="user-name">${user.username}</div>
                <span class="user-role ${user.role.toLowerCase()}">${user.role === 'Admin' ? 'מנהל' : 'משתמש רגיל'}</span>
            </div>
            <div class="user-actions">
                <button class="btn btn-edit" onclick="openEditModal(${user.id}, '${user.username}', '${user.role}')">ערוך</button>
                <button class="btn btn-primary" onclick="openAddFavoriteModal(${user.id}, '${user.username}')">הוסף מועדף</button>
                <button class="btn btn-delete" onclick="deleteUser(${user.id})">מחק</button>
            </div>
        </div>
    `).join('');
}

function openEditModal(userId, username, role) {
    currentUserId = userId;
    document.getElementById('editUsername').value = username;
    document.getElementById('editPassword').value = '';
    document.getElementById('editRole').value = role;
    document.getElementById('editModal').classList.add('active');
}

function openAddFavoriteModal(userId, username) {
    currentUserId = userId;
    document.getElementById('favoriteUsername').textContent = username;
    loadSongsForFavorite();
    document.getElementById('favoriteModal').classList.add('active');
}

function closeAddFavoriteModal() {
    document.getElementById('favoriteModal').classList.remove('active');
    currentUserId = null;
}

async function loadSongsForFavorite() {
    try {
        const response = await fetch('/song', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('שגיאה בטעינת שירים');
        }

        const songs = await response.json();
        const songsList = document.getElementById('songsList');
        songsList.innerHTML = songs.map(song => `
            <div class="song-item">
                <input type="checkbox" id="song-${song.id}" value="${song.id}">
                <label for="song-${song.id}">${song.name} - ${song.artist}</label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        showMessage('שגיאה בטעינת שירים', 'error');
    }
}

async function saveAddFavorite() {
    const selectedSongs = Array.from(document.querySelectorAll('#songsList input:checked')).map(cb => parseInt(cb.value));

    if (selectedSongs.length === 0) {
        alert('אנא בחר לפחות שיר אחד');
        return;
    }

    try {
        // קבל את המשתמש הנוכחי
        const userResponse = await fetch(`/user/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('שגיאה בטעינת משתמש');
        }

        const user = await userResponse.json();
        let favorites = user.favorites || [];

        // הוסף את השירים הנבחרים למועדפים
        selectedSongs.forEach(songId => {
            if (!favorites.includes(songId)) {
                favorites.push(songId);
            }
        });

        // שלח עדכון ל-API החדש כדי להפעיל SignalR
        const updateResponse = await fetch(`/song/user/${currentUserId}/admin-update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: user.id,
                username: user.username,
                password: user.password,
                role: user.role,
                favorites: favorites
            })
        });

        if (!updateResponse.ok) {
            throw new Error('שגיאה בעדכון מועדפים');
        }

        showMessage('השירים נוספו למועדפים בהצלחה', 'success');
        closeAddFavoriteModal();
    } catch (error) {
        console.error('Error:', error);
        showMessage('שגיאה בהוספת שירים למועדפים', 'error');
    }
}

async function saveEditUser() {
    const password = document.getElementById('editPassword').value;
    const role = document.getElementById('editRole').value;
    const username = document.getElementById('editUsername').value;

    try {
        const userData = {
            id: currentUserId,
            username: username,
            password: password || undefined,
            role: role,
            favorites: []
        };

        // שלח עדכון ל-API החדש כדי להפעיל SignalR
        const response = await fetch(`/song/user/${currentUserId}/admin-update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('שגיאה בעדכון משתמש');
        }

        showMessage('המשתמש עודכן בהצלחה', 'success');
        closeEditModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showMessage('שגיאה בעדכון משתמש', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
        return;
    }

    try {
        const response = await fetch(`/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('שגיאה במחיקת משתמש');
        }

        showMessage('המשתמש נמחק בהצלחה', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showMessage('שגיאה במחיקת משתמש', 'error');
    }
}

async function addNewUser() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!username || !password) {
        showMessage('אנא הזן שם משתמש וסיסמה', 'error');
        return;
    }

    try {
        const userData = {
            username: username,
            password: password,
            role: role,
            favorites: []
        };

        console.log('Sending user data:', userData);

        const response = await fetch(`/user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`שגיאה ביצירת משתמש: ${response.status}`);
        }

        showMessage('משתמש חדש נוסף בהצלחה', 'success');
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newRole').value = 'User';
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'שגיאה ביצירת משתמש', 'error');
    }
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    window.location.href = '/login.html';
}

// On page load
checkAdminAccess();
