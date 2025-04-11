document.addEventListener("DOMContentLoaded", () => {
	const placeDetailsSection = document.querySelector(".place-details");
	const reviewsSection = document.querySelector("#reviews");
	const addReviewBtn = document.getElementById('addReviewBtn'); // Assurez-vous que vous avez l'élément
	const reviewForm = document.querySelector("#review-form");
  
	// Récupère place_id depuis l'URL (ex. ?id=XXXX)
	const urlParams = new URLSearchParams(window.location.search);
	const placeId = urlParams.get("id");
  
	document.getElementById('placeId').value = placeId;
  
	if (!placeId) {
	  alert("No place ID found in URL!");
	  return;
	}
  
	// Fetch place details
	fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`)
	  .then(res => res.json())
	  .then(place => {
		renderPlaceDetails(place);
		fetchReviews(placeId);
		showReviewFormIfLoggedIn();  // Cacher ou afficher le bouton en fonction du token
	  })
	  .catch(err => {
		console.error("Error loading place:", err);
	  });
  
	function renderPlaceDetails(place) {
	  const amenities = place.amenities.map(a => a.name).join(", ");
	  const html = `
		<h1>${place.title}</h1>
		<p><strong>Host:</strong> ${place.owner.first_name} ${place.owner.last_name}</p>
		<p><strong>Price per night:</strong> $${place.price}</p>
		<p><strong>Description:</strong> ${place.description}</p>
		<p><strong>Amenities:</strong> ${amenities}</p>
	  `;
	  placeDetailsSection.innerHTML = html;
	}
  
	function fetchReviews(placeId) {
	  fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}/reviews`)
		.then(res => res.json())
		.then(reviews => renderReviews(reviews))
		.catch(err => {
		  console.error("Error loading reviews:", err);
		  reviewsSection.innerHTML = "<p>Could not load reviews.</p>";
		});
	}
  
	function renderReviews(reviews) {
	  const reviewsList = document.getElementById('reviews-list');
	  reviewsList.innerHTML = ''; // Vide la section des reviews avant d'ajouter
  
	  if (!reviews || reviews.length === 0) {
		reviewsList.innerHTML = "<p>No reviews yet.</p>";
		return;
	  }
  
	  reviews.forEach(review => {
		const userName = review
		  ? `${review.first_name} ${review.last_name}`
		  : "Anonymous";
  
		const card = document.createElement("div");
		card.classList.add("review-card");
		card.innerHTML = `
		  <p><strong>${userName}:</strong></p>
		  <p>${review.text}</p>
		  <p>Rating: ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</p>
		`;
		reviewsList.appendChild(card);
	  });
	}
  
	function showReviewFormIfLoggedIn() {
	  // Vérifie si l'utilisateur est connecté via le token
	  const userIsLoggedIn = isUserLoggedIn();  // Utilisation de la fonction pour vérifier si le token est présent
  
	  if (!userIsLoggedIn) {
		// Si non connecté, cache le bouton
		addReviewBtn.style.display = 'none';
	  } else {
		// Si connecté, affiche le bouton
		addReviewBtn.style.display = 'block';
	  }
  
	  // Ouvrir le modal lorsque le bouton "Add Review" est cliqué
	  addReviewBtn?.addEventListener('click', () => {
		document.getElementById('reviewModal').style.display = 'block';
	  });
	}
  
	// Fonction pour vérifier si l'utilisateur est connecté via le token JWT
	function isUserLoggedIn() {
	  const token = getCookie('token');
	  return token !== null;  // Si le token existe, l'utilisateur est connecté
	}
  
	// Fonction pour récupérer la valeur d'un cookie par son nom
	function getCookie(name) {
	  const value = `; ${document.cookie}`;
	  const parts = value.split(`; ${name}=`);
	  if (parts.length === 2) return parts.pop().split(';').shift();
	  return null;
	}
  
	// Fermer le modal si on clique sur la croix
	document.getElementById('closeModalBtn')?.addEventListener('click', () => {
	  document.getElementById('reviewModal').style.display = 'none';
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
		const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + token
		  },
		  body: JSON.stringify({ text, rating, user_id: userId, place_id: placeId })
		});
  
		if (response.ok) {
		  alert('Review added successfully!');
		  document.getElementById('reviewModal').style.display = 'none';
		} else {
		  const errorData = await response.json();
		  alert(`Error: ${errorData.message || 'Something went wrong...'}`);
		}
	  } catch (error) {
		alert('Error: ' + error.message);
	  }
	});
  });
  