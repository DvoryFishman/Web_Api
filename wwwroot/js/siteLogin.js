var users = [];
const uri = '/user';

function login(){
     const addNameTextbox = document.getElementById('log');
      const name = {
        username: addNameTextbox.value.trim()
    };
       const addNameTextbox2 = document.getElementById('log');
      const id = {
        userid: addNameTextbox2.value.trim()
    };
     fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(name)
        })
        .then(response => {
            if (response.ok) {
              getItems();
        }})
        .catch(error => console.error('Unable to add item.', error));

    }


