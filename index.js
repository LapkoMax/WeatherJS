const APIKey = "b1f81cbdc552ee9c9d86fcabf9b48999";

let cities = JSON.parse(localStorage.getItem("cities"));

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  if (cities == undefined) {
    cities = [];
  }

  cities.sort((a, b) => a.name.localeCompare(b.name));

  if (cities.length > 0) {
    let container = document.getElementById("results");

    cities.forEach(async (city) => await createNewCityElement(container, city));
  }
}

async function getCoordinatesByCityName(cityName) {
  let res = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`
  );

  let information = (await res.json())[0];

  return information;
}

async function getWeatherDataByCityLocation(lat, lon) {
  let res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`
  );

  let information = await res.json();

  return information;
}

async function addCity() {
  let cityField = document.getElementById("cityName");

  let cityName = cityField.value;

  if (cityName) {
    cityField.value = "";

    let cityInformation = await getCoordinatesByCityName(cityName);

    let newCityName = cityInformation.local_names.en;

    if (
      newCityName &&
      (cities.lenght === 0 || !cities.find((x) => x.name == newCityName))
    ) {
      let newCity = {
        name: newCityName,
        lat: cityInformation.lat,
        lon: cityInformation.lon,
      };

      cities.push(newCity);

      localStorage.setItem("cities", JSON.stringify(cities));

      let container = document.getElementById("results");

      await createNewCityElement(container, newCity);
    }

    console.log(cities);
  }
}

async function createNewCityElement(container, { name, lat, lon }) {
  let cityWeatherEl = document.createElement("div");
  cityWeatherEl.className = "weatherInfo";

  container.append(cityWeatherEl);
  let cityWeather = await getWeatherDataByCityLocation(lat, lon);

  console.log(JSON.stringify(cityWeather));

  let cityHeaderEl = document.createElement("h3");
  cityHeaderEl.innerText = name;

  cityWeatherEl.append(cityHeaderEl);

  let weatherMainEl = document.createElement("h4");
  weatherMainEl.className = "weatherMain";
  weatherMainEl.innerText = cityWeather.weather[0].main;

  cityWeatherEl.append(weatherMainEl);

  let weatherDescEl = document.createElement("p");
  weatherDescEl.innerText = cityWeather.weather[0].description;

  cityWeatherEl.append(weatherDescEl);

  let temperatureEl = document.createElement("h4");
  temperatureEl.className = "temperature";
  temperatureEl.innerText = `Temperature: ${cityWeather.main.temp}`;

  cityWeatherEl.append(temperatureEl);

  let temperatureFeelsEl = document.createElement("p");
  temperatureFeelsEl.innerText = `Feels like: ${cityWeather.main.feels_like}`;

  cityWeatherEl.append(temperatureFeelsEl);

  let windEl = document.createElement("p");
  windEl.className = "wind";
  windEl.innerText = `Wind: ${cityWeather.wind.speed} m/s`;

  cityWeatherEl.append(windEl);

  return cityWeatherEl;
}
