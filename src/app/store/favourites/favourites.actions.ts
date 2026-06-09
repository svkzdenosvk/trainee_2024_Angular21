// store/favourites/favourites.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { City } from '../../core/models/weather.model';

// Actions used by favourites reducer and effects.
export const FavouritesActions = createActionGroup({
  source: 'Favourites',
  events: {
    'Load Favourites': emptyProps(),
    'Load Favourites Success': props<{ favourites: City[] }>(),
    'Load Favourites Failure': emptyProps(),

    'Add Favourite': props<{ city: City }>(),
    'Add Favourite Success': props<{ favourites: City[] }>(),
    'Add Favourite Failure': props<{ city: City }>(), // carries the original city for rollback or retry

    'Remove Favourite': props<{ city: City }>(),
    'Remove Favourite Success': props<{ favourites: City[] }>(),
    'Remove Favourite Failure': props<{ city: City }>(), // carries the original city for rollback or retry
  },
});