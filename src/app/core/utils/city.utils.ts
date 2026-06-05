// src/app/core/utils/city.utils.ts
import { City } from '../models/weather.model';

export function sameCity(a: City, b: City): boolean {
  return (
    a.name.toLowerCase() === b.name.toLowerCase() &&
    a.country.toLowerCase() === b.country.toLowerCase() &&
    Math.round(a.lat * 10) === Math.round(b.lat * 10) &&
    Math.round(a.lon * 10) === Math.round(b.lon * 10)
  );
}

export const MAX_FAVOURITES = 10;