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

    // שמירת שדה שם לצפייה
    const helloName = document.getElementById('userName');
    if (helloName) {
        helloName.innerText = username || '';
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
        alert('אנא הזן שם משתמש');
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

        alert('פרטיך עודכנו בהצלחה');
        document.getElementById('profile-password').value = '';
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בעדכון פרטיך');
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
