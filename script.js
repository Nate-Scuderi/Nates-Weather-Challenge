const apiKey = '#';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentDetails = document.getElementById('current-details');
const forecastDetails = document.getElementById('forecast-details');
const historyList = document.getElementById('history-list');

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

const updateSearchHistory = () => {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            getWeatherData(city);
        });
        historyList.appendChild(li);
    });
};

const getWeatherData = (city) => {
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('City not found');
                return;
            }
            const { lat, lon } = data[0];
            const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            fetch(weatherUrl)
                .then(response => response.json())
                .then(weatherData => {
                    displayCurrentWeather(weatherData);
                    displayForecast(weatherData);
                    if (!searchHistory.includes(city)) {
                        searchHistory.push(city);
                        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                        updateSearchHistory();
                    }
                });
        })
        .catch(error => console.error('Error fetching data:', error));
};

const displayCurrentWeather = (data) => {
    const current = data.list[0];
    const date = new Date(current.dt * 1000).toLocaleDateString();
    const icon = `http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
    currentDetails.innerHTML = `
        <p>City: ${data.city.name}</p>
        <p>Date: ${date}</p>
        <p><img src="${icon}" alt="${current.weather[0].description}"></p>
        <p>Temperature: ${current.main.temp} °C</p>
        <p>Humidity: ${current.main.humidity} %</p>
        <p>Wind Speed: ${current.wind.speed} m/s</p>
    `;
};

const displayForecast = (data) => {
    forecastDetails.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const icon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <p>${date}</p>
            <p><img src="${icon}" alt="${forecast.weather[0].description}"></p>
            <p>Temp: ${forecast.main.temp} °C</p>
            <p>Humidity: ${forecast.main.humidity} %</p>
            <p>Wind: ${forecast.wind.speed} m/s</p>
        `;
        forecastDetails.appendChild(forecastCard);
    }
};

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    }
});

updateSearchHistory();
