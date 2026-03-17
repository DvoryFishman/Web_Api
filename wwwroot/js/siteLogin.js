// const apiBaseUrl = 'http://localhost:5028';
// const uri = `${apiBaseUrl}/user/login`;
const uri = '/user/login';

function loginUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                // שמור את כל הנתונים הדרושים
                localStorage.setItem('userId', data.id);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userFavorites', JSON.stringify(data.favorites || []));
                
                // הפנה לעמוד השירים - גם מנהל וגם משתמש רגיל
                window.location.href = '/index.html';
            });
        } else {
            document.getElementById('loginError').innerText = 'שם משתמש או סיסמה שגויים';
            document.getElementById('loginError').style.display = 'block';
        }
    })
    .catch(error => {
        document.getElementById('loginError').innerText = 'שגיאה בהתחברות';
        document.getElementById('loginError').style.display = 'block';
    });
}


