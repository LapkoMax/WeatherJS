const APIKey = "b1f81cbdc552ee9c9d86fcabf9b48999";

export async function getCoordinatesByCityName(cityName) {
  let res = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`
  );

  let information = (await res.json())[0];

  return information;
}

export async function getWeatherDataByCityLocation(lat, lon) {
  let res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`
  );

  let information = await res.json();

  return information;
}
