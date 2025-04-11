document.addEventListener("DOMContentLoaded", () => {
	const placeDetailsSection = document.querySelector(".place-details");
	const reviewsSection = document.querySelector("#reviews");
	const reviewForm = document.querySelector("#review-form");
	const addReviewSection = document.querySelector(".add-review");
	
  
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
		showReviewFormIfLoggedIn();
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
		  reviewsSection.innerHTML += "<p>Could not load reviews.</p>";
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
		reviewsSection.appendChild(card);
	  });
	}
  
	function showReviewFormIfLoggedIn() {
	  // À modifier selon ton vrai système d'authentification
	  const userIsLoggedIn = true;
  
	  if (!userIsLoggedIn) {
		addReviewSection.innerHTML = `
        <a href="add_review.html" class="btn">Add Review</a>
      `;
    }
  }
});