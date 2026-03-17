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
            // שמור userId ל-session/localStorage
            response.json().then(data => {
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userFavorites', JSON.stringify(data.favorites || []));
                window.location.href = 'index.html';
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


