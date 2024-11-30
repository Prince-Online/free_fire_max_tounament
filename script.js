document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    loader.style.display = '';

    const username = localStorage.getItem('Tour_Username');
    if (!username) {
        alert("Please log in to join the tournament.");
        loader.style.display = 'none';
        window.location.href = 'profile.html';
        return;
    }

    fetchTournaments().then(tournaments => {
        loader.style.display = 'none';
        tournaments.forEach((tournament, index) => {
            const tournamentCard = document.createElement('div');
            tournamentCard.className = 'tournament-card';

            const joinedTournaments = JSON.parse(localStorage.getItem('joinedTournaments')) || [];
            const isJoined = joinedTournaments.includes(tournament.title);

            tournamentCard.innerHTML = `
                <div class="tournament-title">${tournament.title}</div>
                <img src="${tournament.image}" alt="${tournament.title} image" class="tournament-image">
                <div class="prize-pool">Entry Fee: ${tournament.prizePool} coins</div>
                <div class="tournament-info">Prize Per Kill: ${tournament.text}</div>
                <button class="join-btn" 
                    data-tournament-index="${index}" 
                    data-title="${tournament.title}" 
                    data-prize-pool="${tournament.prizePool}" 
                    ${isJoined ? 'disabled' : ''}>
                    ${isJoined ? 'Joined' : 'Join Tournament'}
                </button>
            `;

            document.getElementById('tournament-list').appendChild(tournamentCard);

            tournamentCard.querySelector('.join-btn').addEventListener('click', function() {
                joinTournament(username, tournament.title, tournament.prizePool, index);
            });
        });
    });
});

function fetchTournaments() {
    return fetch('https://script.google.com/macros/s/AKfycbz6_3bBvKIggEI7liGQHMdRegrpQThl0SpC4KMF-6ixzi9qHrg9vy8ob1YUq-AlkmeA/exec', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'getTournaments'
        })
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
        console.error('Error fetching tournaments:', error);
        return [];
    });
}

function joinTournament(username, tournamentName, prizePool, tournamentIndex) {
    fetchUserDetails(username).then(userDetails => {
        if (!userDetails) {
            alert("User not found.");
            return;
        }

        const userCoins = userDetails.coins;
        if (userCoins < prizePool) {
            alert("You don't have enough coins to join this tournament.");
            return;
        }

        fetch('https://script.google.com/macros/s/AKfycbz6_3bBvKIggEI7liGQHMdRegrpQThl0SpC4KMF-6ixzi9qHrg9vy8ob1YUq-AlkmeA/exec', {
            method: 'POST',
            body: new URLSearchParams({
                action: 'joinTournament',
                username: username,
                gameId: userDetails.gameId,
                gameName: userDetails.gameName,
                tournamentName: tournamentName,
                prizePool: prizePool
            })
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
            if (message === "Successfully joined the tournament.") {
                let joinedTournaments = JSON.parse(localStorage.getItem('joinedTournaments')) || [];
                joinedTournaments.push(tournamentName);
                localStorage.setItem('joinedTournaments', JSON.stringify(joinedTournaments));

                document.querySelectorAll('.join-btn')[tournamentIndex].disabled = true;
                document.querySelectorAll('.join-btn')[tournamentIndex].innerText = "Joined";
            }
        })
        .catch(error => {
            console.error('Error joining tournament:', error);
            alert('Error joining tournament.');
        });
    });
}

function fetchUserDetails(username) {
    return fetch('https://script.google.com/macros/s/AKfycbz6_3bBvKIggEI7liGQHMdRegrpQThl0SpC4KMF-6ixzi9qHrg9vy8ob1YUq-AlkmeA/exec', {
        method: 'POST',
        body: new URLSearchParams({
            action: 'getUserDetails',
            username: username
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            const user = data[0];
            return {
                gameId: user.gameId,
                gameName: user.gameName,
                coins: user.coins
            };
        }
        return null;
    })
    .catch(error => {
        console.error('Error fetching user details:', error);
        return null;
    });
}
