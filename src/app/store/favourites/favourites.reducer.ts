// store/favourites/favourites.reducer.ts
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { City } from '../../core/models/weather.model';
import { FavouritesActions } from './favourites.actions';

export interface FavouritesState extends EntityState<City> {
  loading: boolean;
}

// City doesn´t have a stable id always, we will use a composite key as the entity ID.
const adapter = createEntityAdapter<City>({
  selectId: (city) => `${city.lat}_${city.lon}`,
});

const initialState: FavouritesState = adapter.getInitialState({
  loading: false,
});

export const favouritesReducer = createReducer(
  initialState,

  on(FavouritesActions.loadFavourites, (state) => ({
    ...state,
    loading: true,
  })),
  on(FavouritesActions.loadFavouritesSuccess, (state, { favourites }) =>
    adapter.setAll(favourites, { ...state, loading: false }),
  ),
  on(FavouritesActions.loadFavouritesFailure, (state) => ({
    ...state,
    loading: false,
  })),

  // Optimistic add
  on(FavouritesActions.addFavourite, (state, { city }) =>
    adapter.addOne(city, state),
  ),
  on(FavouritesActions.addFavouriteSuccess, (state, { favourites }) =>
    adapter.setAll(favourites, state),
  ),
  on(FavouritesActions.addFavouriteFailure, (state, { city }) =>
    adapter.removeOne(`${city.lat}_${city.lon}`, state), // rollback
  ),

  // Optimistic remove
  on(FavouritesActions.removeFavourite, (state, { city }) =>
    adapter.removeOne(`${city.lat}_${city.lon}`, state),
  ),
  on(FavouritesActions.removeFavouriteSuccess, (state, { favourites }) =>
    adapter.setAll(favourites, state),
  ),
  on(FavouritesActions.removeFavouriteFailure, (state, { city }) =>
    adapter.addOne(city, state), // rollback
  ),
);

export const { selectAll, selectTotal } = adapter.getSelectors();