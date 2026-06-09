// store/favourites/favourites.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavouritesState, selectAll, selectTotal } from './favourites.reducer';
import { City } from '../../core/models/weather.model';
import { sameCity } from '../../core/utils/city.utils';
import { MAX_FAVOURITES } from '../../core/constants/constants';

// Selectors used by UI components to read the favourites slice.

export const selectFavouritesState =
  createFeatureSelector<FavouritesState>('favourites');

export const selectAllFavourites = createSelector(
  selectFavouritesState,
  selectAll,
);

export const selectFavouritesCount = createSelector(
  selectFavouritesState,
  selectTotal,
);

export const selectIsFull = createSelector(
  selectFavouritesCount,
  (count) => count >= MAX_FAVOURITES,
);

export const selectIsLoading = createSelector(
  selectFavouritesState,
  (state) => state.loading,
);

// export const selectIsFavourite = (city: City) =>
//   createSelector(selectAllFavourites, (favs) =>
//     favs.some(
//       (f) =>
//         f.name.toLowerCase() === city.name.toLowerCase() &&
//         f.country.toLowerCase() === city.country.toLowerCase() &&
//         Math.round(f.lat * 10) === Math.round(city.lat * 10) &&
//         Math.round(f.lon * 10) === Math.round(city.lon * 10),
//     ),
//   );

export const selectIsFavourite = (city: City) =>
  createSelector(selectAllFavourites, (favs) => favs.some((f) => sameCity(f, city)));
