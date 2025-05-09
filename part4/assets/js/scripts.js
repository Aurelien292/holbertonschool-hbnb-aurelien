// Fonction pour récupérer les données des places via l'API
async function getPlaces() {
  try {
      // Remplace l'URL de ton API par l'adresse correcte
      const response = await fetch('http://127.0.0.1:5000/api/v1/places');  // URL de l'API
      const places = await response.json();  // Récupère les données en JSON
      
      displayPlaces(places);  // Appelle la fonction pour afficher les données
  } catch (error) {
      console.error("Erreur lors de la récupération des places:", error);
  }
}

// Fonction pour afficher les places dans le DOM
function displayPlaces(places) {
  const placesContainer = document.getElementById('places-list');  // Sélectionne le conteneur des cartes
  
  // Vide le conteneur avant de rajouter les nouvelles cartes
  placesContainer.innerHTML = '';

  // Limite à 3 places maximum
  const limitedPlaces = places.slice(0, 7);

  // Parcours des places récupérées et création des cartes
  limitedPlaces.forEach(place => {
      const card = document.createElement('div');
      card.classList.add('place-card');  // Ajoute la classe place-card à la carte

      // Ajoute les informations de la place à la carte
      card.innerHTML = `
          <h3 class="place-card-title">${place.title}</h3>
          <p class="place-card-price">Price per night: $${place.price}</p>
          <button class="details-button" onclick="viewDetails('${place.id}')">View Details</button>
      `;

      // Ajoute la carte au conteneur
      placesContainer.appendChild(card);
  });
}

function filterPlaces() {
  const maxPrice = document.getElementById('price-filter').value;  // Récupère la valeur du prix sélectionné

  localStorage.setItem('maxPrice', maxPrice);  // Enregistre le prix dans le localStorage

  // Récupère les places à partir de l'API
  fetch('http://127.0.0.1:5000/api/v1/places/')
    .then(response => response.json())
    .then(places => {
        // Si l'utilisateur a choisi "All", on affiche toutes les places
        if (maxPrice === 'all') {
          places.sort((a, b) => b.price - a.price);  // Trie les places par prix croissant
            displayPlaces(places);
        } else {
            // Sinon, on filtre les places par prix
              // Convertit la valeur en nombre
            const filteredPlaces = places.filter(place => place.price <= maxPrice);
            filteredPlaces.sort((a, b) => a.price - b.price);
            displayPlaces(filteredPlaces);
        }
    })
    .catch(error => console.error("Erreur lors du filtrage des places:", error));
}


function viewDetails(place_Id) {
  // Vérifie si l'ID de la place est passé correctement
  console.log('Place ID:', place_Id);
  
  // Redirige l'utilisateur vers la page place.html avec l'ID en paramètre
  window.location.href = `place.html?id=${place_Id}`;
}  

document.addEventListener('DOMContentLoaded', () => {
  // Récupère la valeur du filtre du localStorage (s'il existe)
  const savedMaxPrice = localStorage.getItem('maxPrice');
  
  // Applique le filtre si une valeur est trouvée
  if (savedMaxPrice && savedMaxPrice !== 'all') {
    document.getElementById('price-filter').value = savedMaxPrice;
    filterPlaces();  // Applique le filtre au chargement de la page
  } else {
    getPlaces();  // Sinon, récupère toutes les places
  }
});

