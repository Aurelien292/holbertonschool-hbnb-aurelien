// Fonction pour vérifier si le token JWT est présent
function isUserLoggedIn() {
  const token = getCookie('token');
  return token !== null;
}

// Fonction pour récupérer la valeur d'un cookie par son nom
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Décoder le token JWT et récupérer l'ID utilisateur
function getUserIdFromToken() {
  const token = getCookie('token');
  if (token) {
    const decodedToken = jwt_decode(token);
    return decodedToken.sub?.id || null;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const addReviewBtn = document.getElementById('addReviewBtn');
  const loginButton = document.getElementById('login-button');

  // Récupère place_id depuis l'URL (ex. ?id=XXXX)
	const urlParams = new URLSearchParams(window.location.search);
	const placeId = urlParams.get("id");

	document.getElementById('placeId').value = placeId;

  // Gérer la visibilité du bouton "Add Review" en fonction de l'état de connexion
  if (addReviewBtn) {
    if (!isUserLoggedIn()) {
      console.log('User is not logged in, hiding Add Review button');
      addReviewBtn.style.display = 'none';
    } else {
      console.log('User is logged in, showing Add Review button');
      addReviewBtn.style.display = 'block'; // S'assurer qu'il est visible s'il est connecté
      
    }
  }

  // Gérer Login / Logout
  if (loginButton) {
    if (isUserLoggedIn()) {
      loginButton.textContent = 'Logout';
      loginButton.href = '#';

      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Supprimer le cookie de connexion
        document.cookie = 'token=; Max-Age=0; path=/;';
        // Rediriger vers la page de connexion ou accueil
        window.location.href = 'login.html';
      });
    } else {
      loginButton.textContent = 'Login';
      loginButton.href = 'login.html';
    }
  }

  // Générer les options de rating dynamiquement (1 à 5)
  const ratingSelect = document.getElementById('reviewRating');
  if (ratingSelect) {
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i === 1 ? `${i} Star` : `${i} Stars`;
      ratingSelect.appendChild(option);
    }
  }

  // Ouvrir et fermer le modal
  document.getElementById('addReviewBtn')?.addEventListener('click', () => {
    const placeName = document.querySelector('.place-details h1')?.textContent || 'Unknown Place';
    document.getElementById('placeName').textContent = placeName;
  
    document.getElementById('reviewModal').style.display = 'block';
  });

  document.getElementById('closeModalBtn')?.addEventListener('click', () => {
    document.getElementById('reviewModal').style.display = 'none';
  });

  // Fermer le modal si on clique en dehors
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('reviewModal')) {
      document.getElementById('reviewModal').style.display = 'none';
    }
  });

  // Soumettre la review
  document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = document.getElementById('reviewText').value;
    const rating = document.getElementById('reviewRating').value;
    const placeId = document.getElementById('placeId').value;

    const userId = getUserIdFromToken();

    if (!userId) {
      alert('You must be logged in to submit a review.');
      return;
    }
    const token = getCookie('token');

    try {
      console.log({ text, rating, user_id: userId, place_id: placeId });
      const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        
        body: JSON.stringify({ text, rating, user_id: userId, place_id: placeId })
      });

      const messageBox = document.getElementById('reviewMessage');
messageBox.style.display = 'block';

if (response.ok) {
  messageBox.textContent = '✅ Review added successfully!';
  messageBox.className = 'review-message success';

  setTimeout(() => {
    messageBox.style.display = 'none';
    document.getElementById('reviewModal').style.display = 'none';
    document.getElementById('reviewForm').reset();
  }, 2500);
} else {
  const errorData = await response.json();
  messageBox.textContent = `❌ ${errorData.error || 'Something went wrong...'}`;
  messageBox.className = 'review-message error';
}
} catch (error) {
  const messageBox = document.getElementById('reviewMessage');
  messageBox.style.display = 'block';
  messageBox.textContent = '❌ ' + error.message;
  messageBox.className = 'review-message error';
}
  });
});
