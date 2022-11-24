import { getCoordinatesByCityName } from "./api/openWeatherAPI.js";
import { cities, createNewCityElement } from "./cities/citiesManipulation.js";

document.addEventListener("DOMContentLoaded", initialize);

let container = undefined;

async function initialize() {
  container = document.getElementById("results");

  cities.sort((a, b) => a.name.localeCompare(b.name));

  if (cities.find((x) => x.isCurrent == true) == undefined) {
    await navigator.geolocation.getCurrentPosition(
      async (position) => {
        await createNewCityElement(container, {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          isCurrent: true,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  if (cities.length > 0) {
    cities.forEach(async (city) => await createNewCityElement(container, city));
  }

  let button = document.getElementById("addCity");
  button.addEventListener("click", addCity);
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
      await createNewCityElement(container, newCity);
    }
  } else {
    cityField.classList.add("errorCityField");
    errorField.innerText = "You havent specified any city name. Try again.";
  }
}
