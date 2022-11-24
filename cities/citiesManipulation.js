import { getWeatherDataByCityLocation } from "../api/openWeatherAPI.js";

let cities = JSON.parse(localStorage.getItem("cities"));

if (cities == undefined) {
  cities = [];
}

function addCity(newCity) {
  if (cities.find((x) => x.name == newCity.name) == undefined) {
    cities.push(newCity);

    localStorage.setItem("cities", JSON.stringify(cities));
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
  { name, lat, lon, isCurrent = false }
) {
  let cityWeatherEl = document.createElement("div");
  cityWeatherEl.className = `weatherInfo${isCurrent ? " currentLocation" : ""}`;

  cityWeatherEl.style.display = "none";

  if (isCurrent) {
    container.insertBefore(cityWeatherEl, container.firstChild);
  } else {
    container.append(cityWeatherEl);
  }

  let cityWeather = await getWeatherDataByCityLocation(lat, lon);

  let cityName = name != undefined ? name : cityWeather.name;

  cityWeatherEl.setAttribute("id", cityName);

  addCity({
    name: cityName,
    lat: lat,
    lon: lon,
    isCurrent: isCurrent,
  });

  addChild(cityWeatherEl, "h2", cityName);
  addChild(cityWeatherEl, "img", "", "", [
    {
      name: "src",
      value: `http://openweathermap.org/img/wn/${cityWeather.weather[0].icon}@2x.png`,
    },
    { name: "alt", value: "weather icon" },
  ]);
  addChild(cityWeatherEl, "h4", cityWeather.weather[0].main, "weatherMain");
  addChild(cityWeatherEl, "p", cityWeather.weather[0].description);
  addChild(
    cityWeatherEl,
    "h4",
    `Temperature: ${cityWeather.main.temp} deg C`,
    "temperature"
  );
  addChild(
    cityWeatherEl,
    "p",
    `Feels like: ${cityWeather.main.feels_like} deg C`
  );
  addChild(cityWeatherEl, "p", `Wind: ${cityWeather.wind.speed} m/s`, "wind");
  addChild(cityWeatherEl, "button", "Remove city", "removeBtn", null, [
    { name: "click", action: removeCity },
  ]);

  cityWeatherEl.style.display = "block";

  return cityWeatherEl;
}

function addChild(
  parent,
  tagName,
  innerText,
  className = "",
  attributes = null,
  events = null
) {
  let el = document.createElement(tagName);

  el.innerText = innerText;
  el.className = className;

  if (attributes != null) {
    attributes.forEach((attr) => {
      el.setAttribute(attr.name, attr.value);
    });
  }

  if (events != null) {
    events.forEach((event) => {
      el.addEventListener(event.name, event.action);
    });
  }

  parent.append(el);
}

export { cities, createNewCityElement };
