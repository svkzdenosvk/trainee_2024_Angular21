// store/favourites/favourites.effects.ts
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FavouritesActions } from './favourites.actions';
import { FavouriteResponse } from '../../core/models/weather.model';
import { API_URL } from '../../core/constants/constants';
import { AuthActions } from '../auth/auth.actions';

@Injectable()
export class FavouritesEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  // Load favourites when the user successfully logs in.
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => FavouritesActions.loadFavourites()),
    ),
  );

  // Request the current favourites list from the backend API.
  loadFavourites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavouritesActions.loadFavourites),
      switchMap(() =>
        this.http.get<FavouriteResponse[]>(`${API_URL}/favourites`).pipe(
          map((favourites) => FavouritesActions.loadFavouritesSuccess({ favourites })),
          catchError(() => of(FavouritesActions.loadFavouritesFailure())),
        ),
      ),
    ),
  );

  // Add a new favourite and then reload the list to keep the client state in sync.
  addFavourite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavouritesActions.addFavourite),
      // mergeMap(({ city }) =>

      //   this.http.post<FavouriteResponse>(`${API_URL}/favourites`, city).pipe(
      //     switchMap(() =>
      //       this.http
      //         .get<FavouriteResponse[]>(`${API_URL}/favourites`)
      //         .pipe(map((favourites) => FavouritesActions.addFavouriteSuccess({ favourites }))),
      //     ),
      //     catchError(() => of(FavouritesActions.addFavouriteFailure({ city }))),
      //   ),
      // ),
      mergeMap(({ city }) => {
        return this.http.post<FavouriteResponse>(`${API_URL}/favourites`, city).pipe(
          switchMap(() =>
            this.http.get<FavouriteResponse[]>(`${API_URL}/favourites`).pipe(
              map((favourites) => {
                return FavouritesActions.addFavouriteSuccess({ favourites });
              }),
            ),
          ),
          catchError(() => of(FavouritesActions.addFavouriteFailure({ city }))),
        );
      }),
    ),
  );

  // Remove a favourite by its ID, then refresh the favourites list.
  removeFavourite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavouritesActions.removeFavourite),
      mergeMap(({ city }) => {
        // The backend delete endpoint requires an ID.
        // If `city` is missing an ID here, this should be resolved by the calling component or state selector.
        // const id = (city as any).id;
        const id = (city as FavouriteResponse).id;

        return this.http.delete(`${API_URL}/favourites/${id}`).pipe(
          switchMap(() =>
            this.http
              .get<FavouriteResponse[]>(`${API_URL}/favourites`)
              .pipe(map((favourites) => FavouritesActions.removeFavouriteSuccess({ favourites }))),
          ),
          catchError(() => of(FavouritesActions.removeFavouriteFailure({ city }))),
        );
      }),
    ),
  );

  // Clear the favourites list from the store after logout.
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      map(() => FavouritesActions.loadFavouritesSuccess({ favourites: [] })),
    ),
  );
}
