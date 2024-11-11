const weatherApiUrl = "https://api.open-meteo.com/v1/forecast";

// Éléments du DOM
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherInfo = document.getElementById("weather-info");
const cityElement = document.getElementById("city");
const tempElement = document.getElementById("temperature");
const descElement = document.getElementById("description");
const weatherIconElement = document.getElementById("weather-icon");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind-speed");
const errorMessage = document.getElementById("error-message");

// Fonction principale pour obtenir les données météo
async function getWeatherData(city) {
    try {
        // Afficher le loader
        document.getElementById('weather-info').classList.add('loading');
        
        // Masquer l'état initial et les données météo
        document.getElementById('initial-state').classList.add('hidden');
        document.getElementById('weather-data').classList.add('hidden');
        
        // Obtenir les coordonnées
        const geoApiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoResponse = await fetch(geoApiUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results?.length) {
            throw new Error("Ville non trouvée");
        }

        const { latitude, longitude, name } = geoData.results[0];

        // Obtenir la météo
        const weatherUrl = `${weatherApiUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();

        // Mise à jour de l'interface
        updateWeatherUI(name, data);

        // Une fois les données reçues, masquer le loader et afficher les données
        document.getElementById('weather-info').classList.remove('loading');
        document.getElementById('weather-data').classList.remove('hidden');

    } catch (error) {
        console.error("Erreur:", error);
        showError(error.message);
        
        // En cas d'erreur, masquer le loader et afficher l'état initial
        document.getElementById('weather-info').classList.remove('loading');
        document.getElementById('initial-state').classList.remove('hidden');
    }
}

// Fonction pour mettre à jour l'interface
function updateWeatherUI(cityName, data) {
    cityElement.textContent = cityName;
    tempElement.textContent = `${Math.round(data.current.temperature_2m)}°C`;
    descElement.textContent = getWeatherDescription(data.current.weather_code);
    weatherIconElement.src = getWeatherIcon(data.current.weather_code);
    humidityElement.textContent = `${data.current.relative_humidity_2m}%`;
    windElement.textContent = `${data.current.wind_speed_10m} km/h`;

    // Ajouter une classe pour l'animation
    weatherInfo.classList.add('fade-in');
}

// Fonction pour afficher les erreurs
function showError(message) {
    cityElement.textContent = `Erreur: ${message}`;
    tempElement.textContent = "--°C";
    descElement.textContent = "--";
    weatherIconElement.src = "./placeholder.png";
    humidityElement.textContent = "--%";
    windElement.textContent = "-- km/h";
}

// Fonction pour obtenir la description météo
function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Ciel dégagé",
        1: "Peu nuageux",
        2: "Partiellement nuageux",
        3: "Couvert",
        45: "Brouillard",
        48: "Brouillard givrant",
        51: "Bruine légère",
        53: "Bruine modérée",
        55: "Bruine dense",
        61: "Pluie légère",
        63: "Pluie modérée",
        65: "Pluie forte",
        71: "Neige légère",
        73: "Neige modérée",
        75: "Neige forte",
        95: "Orage"
    };
    return weatherCodes[code] || "Inconnu";
}

// Fonction pour obtenir l'icône météo
function getWeatherIcon(code) {
    const baseUrl = "https://openweathermap.org/img/wn/";
    if (code === 0) return `${baseUrl}01d@2x.png`;
    if (code <= 3) return `${baseUrl}02d@2x.png`;
    if (code <= 48) return `${baseUrl}50d@2x.png`;
    if (code <= 55) return `${baseUrl}09d@2x.png`;
    if (code <= 65) return `${baseUrl}10d@2x.png`;
    if (code <= 75) return `${baseUrl}13d@2x.png`;
    if (code === 95) return `${baseUrl}11d@2x.png`;
    return `${baseUrl}02d@2x.png`;
}

// Fonction pour gérer la recherche
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        // Animation de secousse et message d'erreur
        cityInput.classList.add('input-error');
        errorMessage.classList.add('visible');
        cityInput.classList.add('shake');
        
        // Afficher l'état initial
        document.getElementById('initial-state').classList.remove('hidden');
        document.getElementById('weather-data').classList.add('hidden');
        
        setTimeout(() => {
            cityInput.classList.remove('shake');
        }, 820);
        
        return;
    }
    
    // Réinitialiser les styles d'erreur
    cityInput.classList.remove('input-error');
    errorMessage.classList.remove('visible');
    
    // Appeler la fonction de recherche météo
    getWeatherData(city);
}

// Gestionnaires d'événements
searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

// Ajoutez cet écouteur pour retirer le message d'erreur quand l'utilisateur commence à taper
cityInput.addEventListener("input", () => {
    if (cityInput.value.trim()) {
        cityInput.classList.remove('input-error');
        errorMessage.classList.remove('visible');
    }
});

// Ajoutez cet écouteur pour retirer la classe shake après l'animation
cityInput.addEventListener('animationend', (e) => {
    if (e.animationName === 'shake') {
        cityInput.classList.remove('shake');
    }
});

// Ajoutez cette classe CSS pour l'animation
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Au début de la recherche
document.getElementById('initial-state').classList.add('hidden');
document.getElementById('weather-data').classList.remove('hidden');

// En cas d'erreur ou de champ vide
document.getElementById('initial-state').classList.remove('hidden');
document.getElementById('weather-data').classList.add('hidden');