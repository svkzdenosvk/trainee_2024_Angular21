// Raw API response from Open-Meteo
export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: HourlyApiData;
}

export interface HourlyApiData {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  surface_pressure: number[];
  weathercode: number[];
  windspeed_10m: number[];
  precipitation: number[];
}

// Transformed row used in the table
export interface WeatherRow {
  datetime: Date;
  weatherState: string;
  weatherIcon: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  precipitation: number;
}

// Heat Index calculator
export interface HeatIndexEntry {
  temperature: number;
  humidity: number;
  heatIndex: number;
  unit: TemperatureUnit;
  timestamp: Date;
}

export type TemperatureUnit = '°C' | '°F';

export interface City {
  id?: string; //optional
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface FavouriteResponse {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}