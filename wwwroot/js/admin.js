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

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    currentUserId = null;
}

async function loadSongsForFavorite() {
    try {
        // Fetch both songs and current user favorites
        const songsResponse = await fetch('/song', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!songsResponse.ok) {
            throw new Error('שגיאה בטעינת שירים');
        }

        const userResponse = await fetch(`/user/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('שגיאה בטעינת נתוני משתמש');
        }

        const songs = await songsResponse.json();
        const user = await userResponse.json();
        const currentFavorites = user.favorites || [];

        const songsList = document.getElementById('songsList');
        songsList.innerHTML = songs.map(song => `
            <div class="song-item">
                <input type="checkbox" id="song-${song.id}" value="${song.id}" ${currentFavorites.includes(song.id) ? 'checked' : ''}>
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

    try {
        // Get the user's current data
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

        console.log('[saveAddFavorite] Selected songs:', selectedSongs);
        console.log('[saveAddFavorite] Updating user with new favorites');

        // Send update with new favorites list (toggle favorites)
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
                favorites: selectedSongs
            })
        });

        if (!updateResponse.ok) {
            throw new Error('שגיאה בעדכון מועדפים');
        }

        console.log('[saveAddFavorite] Update sent successfully');
        showNotification(`<div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✓ המועדפים עודכנו בהצלחה</div>`);
        closeAddFavoriteModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ שגיאה בעדכון מועדפים</div>`);
    }
}

async function saveEditUser() {
    const password = document.getElementById('editPassword').value.trim();
    const role = document.getElementById('editRole').value;
    const username = document.getElementById('editUsername').value;

    try {
        // Get current user data to preserve favorites
        const userResponse = await fetch(`/user/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('שגיאה בטעינת נתוני משתמש');
        }

        const currentUser = await userResponse.json();

        const userData = {
            id: currentUserId,
            username: username,
            role: role,
            favorites: currentUser.favorites || []  // Preserve existing favorites
        };

        // Only include password if it was provided (non-empty)
        if (password) {
            userData.password = password;
        }

        console.log('[saveEditUser] Sending update:', userData);

        // Send update to the new API
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

        showNotification(`<div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✓ המשתמש עודכן בהצלחה</div>`);
        closeEditModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ שגיאה בעדכון משתמש</div>`);
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

        showNotification(`<div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✓ המשתמש נמחק בהצלחה</div>`);
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ שגיאה במחיקת משתמש</div>`);
    }
}

async function addNewUser() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!username || !password) {
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ אנא הזן שם משתמש וסיסמה</div>`);
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

        showNotification(`<div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✓ משתמש חדש נוסף בהצלחה</div>`);
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newRole').value = 'User';
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ ${error.message || 'שגיאה ביצירת משתמש'}</div>`);
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
