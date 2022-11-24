const APIKey = "b1f81cbdc552ee9c9d86fcabf9b48999";

let cities = JSON.parse(localStorage.getItem("cities"));
let current = undefined;

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  if (cities == undefined) {
    cities = [];
  }

  cities.sort((a, b) => a.name.localeCompare(b.name));

  await navigator.geolocation.getCurrentPosition(
    async (position) => {
      let container = document.getElementById("results");

      current = await createNewCityElement(
        container,
        {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        },
        true
      );
    },
    (error) => {
      console.log(error);
    }
  );

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
  let errorField = document.getElementById("errorField");

  cityField.classList.remove("errorCityField");
  errorField.innerText = "";

  let cityName = cityField.value;

  if (cityName) {
    cityField.value = "";

    let cityInformation = await getCoordinatesByCityName(cityName);

    console.log(cityInformation);

    if (
      cityInformation == undefined ||
      cityInformation.local_names == undefined ||
      cityInformation.local_names.en == undefined
    ) {
      cityField.classList.add("errorCityField");
      errorField.innerText =
        "Sorry, we can't find a city you specified. Try again.";
      return;
    }

    let newCityName = cityInformation.local_names.en;

    if (cities.lenght === 0 || !cities.find((x) => x.name == newCityName)) {
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
  } else {
    cityField.classList.add("errorCityField");
    errorField.innerText = "You havent specified any city name. Try again.";
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

async function createNewCityElement(
  container,
  { name, lat, lon },
  isCurrLocation = false
) {
  let cityWeatherEl = document.createElement("div");
  cityWeatherEl.className = `weatherInfo${
    isCurrLocation ? " currentLocation" : ""
  }`;

  cityWeatherEl.style.display = "none";

  if (isCurrLocation) {
    container.insertBefore(cityWeatherEl, container.firstChild);
  } else {
    container.append(cityWeatherEl);
  }
  let cityWeather = await getWeatherDataByCityLocation(lat, lon);

  cityWeatherEl.setAttribute("id", name != undefined ? name : cityWeather.name);

  let cityHeaderEl = document.createElement("h2");
  cityHeaderEl.innerText = name != undefined ? name : cityWeather.name;

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

  cityWeatherEl.style.display = "block";

  return cityWeatherEl;
}
