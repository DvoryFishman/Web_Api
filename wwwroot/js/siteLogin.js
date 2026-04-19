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
                sessionStorage.setItem('userId', data.id);
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('role', data.role);
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userFavorites', JSON.stringify(data.favorites || []));
                
                // ניהול ניווט לפי תפקיד - כל המשתמשים לindex.html
                
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


