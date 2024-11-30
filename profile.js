const loginDiv = document.getElementById('login-div');
const contentDiv = document.getElementById('content-div');
const usernameDisplay = document.getElementById('username-display');
const userName = document.getElementById('user-name');
const userCoins = document.getElementById('user-coins');
const userGameId = document.getElementById('user-game-id');
const userGameName = document.getElementById('user-game-name');
const editBtn = document.getElementById('edit-btn');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit');
const updateForm = document.getElementById('update-form');

const DEPLOYED_URL = 'https://script.google.com/macros/s/AKfycbwvoVO4PFefe-MheoauJYVZzL9Jz2VvaVeqgUhUzAaIzQKrk4FywO3tY9qBaYJBMQV0/exec';

const storedUsername = localStorage.getItem('Tour_Username');

if (storedUsername) {
  loginDiv.style.display = 'none';
  contentDiv.style.display = 'block';
  usernameDisplay.innerText = storedUsername;
  fetchUserDetails(storedUsername);
}

const form = document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(DEPLOYED_URL, {
      method: 'POST',
      body: new URLSearchParams({ username, password, action: 'login' }),
    });
    
    const result = await response.text();
    
    if (result === 'Login successful!') {
      localStorage.setItem('Tour_Username', username);
      loginDiv.style.display = 'none';
      contentDiv.style.display = 'block';
      usernameDisplay.innerText = username;
      fetchUserDetails(username);
    } else {
      alert(result);
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
});

async function fetchUserDetails(username) {
  try {
    const response = await fetch(DEPLOYED_URL, {
      method: 'POST',
      body: new URLSearchParams({ username, action: 'getUserDetails' }),
    });
    
    const userData = await response.json();
    
    userName.innerText = userData.name || 'N/A';
    userCoins.innerText = userData.coins || '0';
    userGameId.innerText = userData.gameId || 'Not set';
    userGameName.innerText = userData.gameName || 'Not set';

    document.getElementById('edit-game-id').value = userData.gameId || '';
    document.getElementById('edit-game-name').value = userData.gameName || '';
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}

editBtn.addEventListener('click', () => {
  editForm.style.display = 'block';
});

cancelEditBtn.addEventListener('click', () => {
  editForm.style.display = 'none';
});

updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const gameId = document.getElementById('edit-game-id').value;
  const gameName = document.getElementById('edit-game-name').value;
  
  try {
    const response = await fetch(DEPLOYED_URL, {
      method: 'POST',
      body: new URLSearchParams({ 
        username: storedUsername, 
        gameId, 
        gameName,
        action: 'updateUserDetails' 
      }),
    });
    
    const result = await response.text();
    
    if (result === 'Update successful!') {
      fetchUserDetails(storedUsername);
      editForm.style.display = 'none';
    } else {
      alert(result);
    }
  } catch (error) {
    console.error('Error updating user details:', error);
  }
});