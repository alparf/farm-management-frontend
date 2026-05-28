// components/weather-card.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Droplets, Wind, ThermometerSun, Sunrise, Sunset, Gauge, RefreshCw } from 'lucide-react';

interface HourlyData {
  time: string;
  temp: number;
  precipMM: number;
  chanceOfRain: number;
  windSpeed: number;
  weatherDesc: string;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  cloudcover: number;
  uvIndex: number;
  observationTime: string;
  weatherDesc: string;
  sunrise: string;
  sunset: string;
  location: string;
  lat: number;
  lon: number;
  hourly: HourlyData[];
}

const DEFAULT_LAT = 52.538739;
const DEFAULT_LON = 30.935158;

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();

      const current = data.current_condition[0];
      const nearestArea = data.nearest_area[0];
      const astronomy = data.weather[0].astronomy[0];
      const hourlyData = data.weather[0].hourly || [];

      // Надёжный парсинг почасовых данных
      const hourly: HourlyData[] = hourlyData.slice(0, 8).map((h: any) => ({
        time: h.time,
        temp: h.tempC ? parseInt(h.tempC) : 0,
        precipMM: h.precipMM ? parseFloat(h.precipMM) : 0,
        chanceOfRain: h.chanceofrain ? parseInt(h.chanceofrain) : 0,
        windSpeed: h.windspeedKmph ? parseInt(h.windspeedKmph) : 0,
        weatherDesc: h.weatherDesc?.[0]?.value || '',
      }));

      setWeather({
        temp: current.temp_C ? parseInt(current.temp_C) : 0,
        feelsLike: current.FeelsLikeC ? parseInt(current.FeelsLikeC) : 0,
        humidity: current.humidity ? parseInt(current.humidity) : 0,
        windSpeed: current.windspeedKmph ? parseInt(current.windspeedKmph) : 0,
        pressure: current.pressure ? parseInt(current.pressure) : 0,
        cloudcover: current.cloudcover ? parseInt(current.cloudcover) : 0,
        uvIndex: current.uvIndex ? parseInt(current.uvIndex) : 0,
        observationTime: current.observation_time || '',
        weatherDesc: current.weatherDesc?.[0]?.value || '',
        sunrise: astronomy.sunrise || '',
        sunset: astronomy.sunset || '',
        location: `${nearestArea.areaName?.[0]?.value || ''}, ${nearestArea.region?.[0]?.value || ''}`,
        lat,
        lon,
        hourly,
      });
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Не удалось загрузить данные о погоде.');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => fetchWeather(DEFAULT_LAT, DEFAULT_LON);

  useEffect(() => {
    fetchWeather(DEFAULT_LAT, DEFAULT_LON);
  }, []);

  const formatHour = (time: string) => {
    const hour = time.padStart(4, '0').slice(0, 2);
    return `${hour}:00`;
  };

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Погода сейчас</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Загрузка погоды...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Погода сейчас</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-2">
          <p className="text-red-500 text-sm text-center">{error}</p>
          <button
            onClick={refresh}
            className="text-blue-600 text-sm hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Повторить
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Погода сейчас
          <button
            onClick={refresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Обновить"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardTitle>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{weather.location}</span>
          <span className="text-xs">({weather.lat.toFixed(2)}, {weather.lon.toFixed(2)})</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Текущая погода */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThermometerSun className="h-5 w-5 text-orange-500" />
            <span className="text-3xl font-bold">{weather.temp}°C</span>
          </div>
          <div className="text-sm text-gray-500">
            Ощущается как {weather.feelsLike}°C
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700">
          {weather.weatherDesc}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>Влажность: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-teal-500" />
            <span>Ветер: {weather.windSpeed} км/ч</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-purple-500" />
            <span>Давление: {weather.pressure} гПа</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 text-gray-500">☁️</div>
            <span>Облачность: {weather.cloudcover}%</span>
          </div>
        </div>

        {/* Почасовой прогноз с ветром и осадками */}
        {weather.hourly.length > 0 && (
          <div className="border-t pt-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Прогноз на сегодня</h4>
            <div className="overflow-x-auto">
              <div className="flex gap-3 pb-1 min-w-max">
                {weather.hourly.map((hour, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center bg-gray-50 rounded-lg px-3 py-2 min-w-[85px] shadow-sm"
                  >
                    <span className="text-xs font-medium text-gray-600">{formatHour(hour.time)}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <ThermometerSun className="h-3 w-3 text-orange-400" />
                      <span className="text-sm font-bold">{hour.temp}°C</span>
                    </div>
                    {/* Ветер — всегда показываем, даже 0 км/ч */}
                    <div className="flex items-center gap-1 mt-1">
                      <Wind className="h-3 w-3 text-teal-500" />
                      <span className="text-xs">{hour.windSpeed} км/ч</span>
                    </div>
                    {/* Осадки: вероятность + количество мм (если есть) */}
                    <div className="flex items-center gap-1 mt-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-xs">
                        {hour.chanceOfRain}% {hour.precipMM > 0 && `(${hour.precipMM} мм)`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
          <div className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 text-yellow-500" />
            <span>Восход: {weather.sunrise}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="h-4 w-4 text-orange-500" />
            <span>Закат: {weather.sunset}</span>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-right">
          Обновлено: {weather.observationTime} UTC
        </div>
      </CardContent>
    </Card>
  );
}