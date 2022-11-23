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
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`
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

function removeCity(event) {
  let city = cities.find((x) => x.name == event.target.offsetParent.id);

  let index = cities.indexOf(city);

  if (index > -1) {
    cities.splice(index, 1);
  }

  localStorage.setItem("cities", JSON.stringify(cities));

  document.getElementById(event.target.offsetParent.id).remove();
}

async function createNewCityElement(container, { name, lat, lon }) {
  let cityWeatherEl = document.createElement("div");
  cityWeatherEl.className = "weatherInfo";

  container.append(cityWeatherEl);
  let cityWeather = await getWeatherDataByCityLocation(lat, lon);

  cityWeatherEl.setAttribute("id", name);

  let cityHeaderEl = document.createElement("h3");
  cityHeaderEl.innerText = name;

  cityWeatherEl.append(cityHeaderEl);

  let weatherImg = document.createElement("img");
  weatherImg.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${cityWeather.weather[0].icon}@2x.png`
  );
  weatherImg.setAttribute("alt", "weather icon");

  cityWeatherEl.append(weatherImg);

  let weatherMainEl = document.createElement("h4");
  weatherMainEl.className = "weatherMain";
  weatherMainEl.innerText = cityWeather.weather[0].main;

  cityWeatherEl.append(weatherMainEl);

  let weatherDescEl = document.createElement("p");
  weatherDescEl.innerText = cityWeather.weather[0].description;

  cityWeatherEl.append(weatherDescEl);

  let temperatureEl = document.createElement("h4");
  temperatureEl.className = "temperature";
  temperatureEl.innerText = `Temperature: ${cityWeather.main.temp} deg C`;

  cityWeatherEl.append(temperatureEl);

  let temperatureFeelsEl = document.createElement("p");
  temperatureFeelsEl.innerText = `Feels like: ${cityWeather.main.feels_like} deg C`;

  cityWeatherEl.append(temperatureFeelsEl);

  let windEl = document.createElement("p");
  windEl.className = "wind";
  windEl.innerText = `Wind: ${cityWeather.wind.speed} m/s`;

  cityWeatherEl.append(windEl);

  let removeBtn = document.createElement("button");
  removeBtn.className = "removeBtn";
  removeBtn.innerText = "Remove city";
  removeBtn.addEventListener("click", removeCity);

  cityWeatherEl.append(removeBtn);

  return cityWeatherEl;
}
