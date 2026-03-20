const weatherMap: Record<string, string> = {
  sunny: "Sunny",
  partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  overcast: "Overcast",
  light_rain: "Light Rain",
  rain: "Rain",
  heavy_rain: "Heavy Rain",
  showers: "Showers",
  drizzle: "Drizzle",
  thunderstorm: "Thunderstorm",
  snow: "Snow",
  sleet: "Sleet",
  hail: "Hail",
  fog: "Fog",
  mist: "Mist",
  windy: "Windy",
  clear: "Clear",
  frost: "Frost",
  hot: "Hot",
  cold: "Cold",
}

export function getWeatherDisplay(weather: string | null | undefined): string | null {
  if (!weather) return null
  return weatherMap[weather.toLowerCase()] || weather
}
