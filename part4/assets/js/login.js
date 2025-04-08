document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loaderContainer = document.getElementById('loader-container');
    const loaderText = document.querySelector('.loader-text'); // Sélectionner le texte de progression
    let percentage = 0; // Variable pour la progression du pourcentage
    const duration = 6000; // Durée totale du loader en ms (10 secondes)
    const steps = 100; // Nombre de mises à jour du pourcentage (1% par étape)
    const intervalTime = duration / steps; // Intervalle de temps entre chaque mise à jour
    
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    toggleBtn.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.src = '../assets/images/login/padlock.png';
        } else {
            passwordInput.type = 'password';
            this.src = '../assets/images/login/padlock.png';
        }
    });

 
    // Fonction pour mettre à jour la progression du loader
    function updatePercentage(interval) {
        if (percentage < 100) {
            percentage++;
            loaderText.textContent = `${percentage}%`;
        } else {
            clearInterval(interval); // Arrêter le timer une fois que le pourcentage atteint 100%
        }
    }

    // Gérer la soumission du formulaire de connexion
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Empêcher la soumission normale du formulaire

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Afficher le loader uniquement pendant la connexion
        loaderContainer.classList.remove('hidden');

        // Démarrer la mise à jour de la progression du loader
        const interval = setInterval(() => updatePercentage(interval), intervalTime);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/login', { // Remplace cette URL par ton endpoint réel
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                // Attendre que le pourcentage atteigne 100% avant de procéder
                setTimeout(() => {
                    clearInterval(interval); // Arrêter le timer
                    loaderContainer.classList.add('fade-out'); // Cacher le loader avec un effet
                    document.cookie = `token=${data.token}; path=/`; // Sauvegarde du token dans un cookie
                    window.location.href = 'index.html';  // Redirige l'utilisateur vers la page principale
                }, duration);
            } else {
                const errorData = await response.json();

                setTimeout(() => {
                    clearInterval(interval); // Arrêter le timer
                    loaderContainer.classList.add('fade-out'); // Cacher le loader avec un effet
                    errorMessage.textContent = errorData.message || 'Login failed. Please try again.';
                    errorMessage.classList.remove('hidden');  // Affiche le message d'erreur
                }, duration);
            }
        } catch (error) {
            // Gérer l'erreur de réseau
            setTimeout(() => {
                clearInterval(interval); // Arrêter le timer
                loaderContainer.classList.add('fade-out'); // Cacher le loader avec un effet
                errorMessage.textContent = 'Network error. Please try again later.';
                errorMessage.classList.remove('hidden');
            }, duration);
        }

    });
    
});
