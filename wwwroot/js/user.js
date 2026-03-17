const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');
const role = localStorage.getItem('role');
const apiBaseUrl = '';

function checkAuth() {
    if (!token || !userId) {
        window.location.href = '/login.html';
        return;
    }

    document.getElementById('userName').innerText = username;

    // הצג את לוח הניהול רק למנהלים
    if (role === 'Admin') {
        document.getElementById('adminSection').style.display = 'block';
    }

    loadUserProfile();
}

async function loadUserProfile() {
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
        const userData = {
            id: parseInt(userId),
            username: newUsername,
            password: password || undefined,
            role: role,
            favorites: JSON.parse(localStorage.getItem('userFavorites') || '[]')
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

        // עדכן את השם ב-localStorage
        localStorage.setItem('username', newUsername);

        alert('פרטיך עודכנו בהצלחה');
        document.getElementById('profile-password').value = '';
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בעדכון פרטיך');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userFavorites');
    window.location.href = '/login.html';
}

// On page load
checkAuth();
