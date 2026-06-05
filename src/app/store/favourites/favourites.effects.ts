// store/favourites/favourites.effects.ts
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FavouritesActions } from './favourites.actions';
import { City, FavouriteResponse } from '../../core/models/weather.model';
import { API_URL } from '../../core/constants/constants';
import { AuthActions } from '../auth/auth.actions';

@Injectable()
export class FavouritesEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  // after login load favourites
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => FavouritesActions.loadFavourites()),
    ),
  );

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

  addFavourite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavouritesActions.addFavourite),
      mergeMap(({ city }) =>
        this.http.post<FavouriteResponse>(`${API_URL}/favourites`, city).pipe(
          switchMap(() =>
            this.http
              .get<FavouriteResponse[]>(`${API_URL}/favourites`)
              .pipe(map((favourites) => FavouritesActions.addFavouriteSuccess({ favourites }))),
          ),
          catchError(() => of(FavouritesActions.addFavouriteFailure({ city }))),
        ),
      ),
    ),
  );

  removeFavourite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavouritesActions.removeFavourite),
      mergeMap(({ city }) => {
        // id musime ziskat zo stavu - pozri poznamku nizsie
        const id = (city as any).id;
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

  // after logout clear store
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      map(() => FavouritesActions.loadFavouritesSuccess({ favourites: [] })),
    ),
  );
}
