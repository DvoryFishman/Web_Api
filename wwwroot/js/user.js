function getSessionData() {
    return {
        token: sessionStorage.getItem('token'),
        userId: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username'),
        role: sessionStorage.getItem('role')
    };
}

const apiBaseUrl = '';

function checkAuth() {
    const { token, userId, username, role } = getSessionData();

    if (!token || !userId) {
        window.location.href = '/login.html';
        return;
    }

    // קישור ניהול למנהל
    const adminLink = document.getElementById('adminLink');
    const adminFavoritesLink = document.getElementById('adminFavoritesLink');
    if (role === 'Admin') {
        if (adminLink) {
            adminLink.innerHTML = '<a href="/admin.html" class="admin-link">ניהול משתמשים</a>';
        }
        if (adminFavoritesLink) {
            adminFavoritesLink.innerHTML = '<a href="/" class="admin-link" style="background: linear-gradient(135deg, #ffd93d 0%, #ff8c42 100%) !important;">רשימת השירים המועדפים שלי</a>';
        }
    } else {
        if (adminLink) {
            adminLink.innerHTML = '';
        }
        if (adminFavoritesLink) {
            adminFavoritesLink.innerHTML = '';
        }
    }

    loadUserProfile();
}

async function loadUserProfile() {
    const { token, userId, username } = getSessionData();
    try {
        const response = await fetch(`/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('שגיאה בטעינת פרטיך');
        }

        const user = await response.json();
        document.getElementById('profile-username').value = user.username;
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בטעינת פרטיך');
    }
}

async function updateProfile() {
    const newUsername = document.getElementById('profile-username').value.trim();
    const password = document.getElementById('profile-password').value;

    if (!newUsername) {
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ אנא הזן שם משתמש</div>`);
        return;
    }

    try {
        const { token, userId, role } = getSessionData();

        const userData = {
            id: parseInt(userId, 10),
            username: newUsername,
            password: password || undefined,
            role: role || 'User',
            favorites: JSON.parse(sessionStorage.getItem('userFavorites') || '[]')
        };

        const response = await fetch(`/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('שגיאה בעדכון פרטיך');
        }

        // עדכן את השם ב-sessionStorage
        sessionStorage.setItem('username', newUsername);

        showNotification(`<div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✓ פרטיך עודכנו בהצלחה</div>`);
        document.getElementById('profile-password').value = '';
    } catch (error) {
        console.error('Error:', error);
        showNotification(`<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%); color: white; padding: 15px; border-radius: 8px; font-weight: 500;">✗ שגיאה בעדכון פרטיך</div>`);
    }
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userFavorites');
    window.location.href = '/login.html';
}
