const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-button");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherCardsDiv = document.querySelector(".current-weather");
const currentLocation = document.querySelector(".currentLocationButton");
const toggleUnit = document.querySelector(".toggleUnit");

const API_KEY = "d36ce1a3014b66c450521fc08b62491b";

const createWeatherCard = (cityName, weatherItem, index) => {
  const fahr = `${weatherItem.main.temp}°F`;
  const celc = `${(weatherItem.main.temp - 273.15).toFixed(2)}°C`;

  if (index === 0) {
    return `<div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>
            Temperature: ${celc}
            </h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}</h4>
          </div>
          <div class="icon">
            <img
              src="https://openweathermap.org/img/wn/${
                weatherItem.weather[0].icon
              }@4x.png"
              alt="weather-icon"
            />
            <h4>${weatherItem.weather[0].description}</h4>
          </div>`;
  } else {
    return `            <li class="card">
    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
    <img
    src="https://openweathermap.org/img/wn/${
      weatherItem.weather[0].icon
    }@2x.png"
    alt="weather-icon"
    />
    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
    <h4>Humi: ${weatherItem.main.humidity}%</h4>
    </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDays = [];

      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      weatherCardsDiv.innerHTML = "";
      currentWeatherCardsDiv.innerHTML = "";
      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An Error Occured while fetching the weather forecast");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim(); // get user entered city name and remove extra spaces
  if (!cityName) return; // return if the field is empty

  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`$Failed to find {cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert("an error occured while fetching the location"));
};

const getCurrentCoordinate = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEO_CODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_GEO_CODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
          console.log(data);
        })
        .catch(() => alert("an error occured while fetching the city"));
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          `WOW, WOW, That's not how it works homes, Please allow the permission`
        );
      }
    }
  );
};

searchButton.addEventListener("click", getCityCoordinates);
currentLocation.addEventListener("click", getCurrentCoordinate);
cityInput.addEventListener(
  "keyup",
  (e) => e.key == "Enter" && getCityCoordinates()
);
