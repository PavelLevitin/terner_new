import { useEffect, useState } from 'react';
import styles from './WeatherWidget.module.css';

const WMO_CODES = {
  0: { label: 'Clear', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Foggy', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy Drizzle', icon: '🌧️' },
  61: { label: 'Light Rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Light Snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  80: { label: 'Showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Heavy Showers', icon: '🌧️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  99: { label: 'Thunderstorm', icon: '⛈️' },
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=31.25&longitude=34.79&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=kmh'
    )
      .then((r) => r.json())
      .then((data) => {
        const c = data.current;
        const code = c.weathercode;
        setWeather({
          temp: Math.round(c.temperature_2m),
          wind: Math.round(c.windspeed_10m),
          ...( WMO_CODES[code] || { label: 'Unknown', icon: '🌡️' }),
        });
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  return (
    <div className={styles.weatherContainer}>
      <div className={styles.location}>Turner Stadium</div>
      <div className={styles.main}>
        <span className={styles.icon}>{weather.icon}</span>
        <span className={styles.temp}>{weather.temp}°C</span>
      </div>
      <div className={styles.details}>
        <span>{weather.label}</span>
        <span>💨 {weather.wind} km/h</span>
      </div>
    </div>
  );
}
