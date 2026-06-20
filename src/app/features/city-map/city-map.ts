import { Component, AfterViewInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CityService } from '../../core/services/city.service';
import { City, NominatimResponse } from '../../core/models/weather.model';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { fadeInOut } from '../../shared/animations/animations';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllFavourites, selectIsFull } from '../../store/favourites/favourites.selectors';
import { sameCity } from '../../core/utils/city.utils';
import { FavouritesActions } from '../../store/favourites/favourites.actions';

@Component({
  selector: 'app-city-map',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  animations: [fadeInOut],
  templateUrl: './city-map.html',
  styleUrls: ['./city-map.scss'],
})
export class CityMapComponent implements AfterViewInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly cityService = inject(CityService);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);
  protected readonly authService = inject(AuthService);
  private readonly store = inject(Store);

  private abortController?: AbortController;
  private popupDestroy$ = new Subject<void>();
  private isAdding = false;

  private map!: L.Map;
  private marker?: L.Marker;
  private currentCity: City | null = null;

  // Map interaction state flags.

  showNoCity = signal(false);
  showFullWarning = signal(false);

  private favourites = this.store.selectSignal(selectAllFavourites);
  private isFull = this.store.selectSignal(selectIsFull);

  ngAfterViewInit(): void {
    this.initMap();

    // Update popup content if the language changes.
    this.translocoService.langChanges$.subscribe((lang) => {
      this.translocoService.load(lang).subscribe(() => {
        if (this.marker && this.currentCity) {
          this.updatePopup(this.currentCity);
        }
      });
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([50, 15], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Fix for missing marker icons in Angular build
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }

  private onMapClick(lat: number, lon: number): void {
    // Reverse-geocode picked coordinates into a city name.
    this.http
      .get<NominatimResponse>(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      )
      .subscribe((data) => {
        const name =
          data.address?.city || data.address?.town || data.address?.village || data.address?.county;

        if (!name) {
          this.showNoCity.set(true);
          setTimeout(() => this.showNoCity.set(false), 3000);
          return;
        }

        const city: City = {
          name,
          country: data.address?.country ?? '',
          lat: Math.round(lat * 100) / 100,
          lon: Math.round(lon * 100) / 100,
        };

        if (this.marker) this.marker.remove();
        this.currentCity = city;
        this.marker = L.marker([lat, lon]).addTo(this.map).bindPopup('').openPopup();

        this.updatePopup(city);
      });
  }

  private updatePopup(city: City): void {
    if (!this.marker) return;

    // Destroy old listeners before attaching new popup handlers.
    this.popupDestroy$.next();
    this.popupDestroy$.complete();
    this.popupDestroy$ = new Subject<void>();

    const isFav = this.favourites().some((f) => sameCity(f, city)); // signal, sync check
    const isFull = this.isFull();

    const selectLabel = this.translocoService.translate('cityPicker.btnSelect');
    const favLabel = isFav
      ? this.translocoService.translate('cityPicker.btnRemove')
      : this.translocoService.translate('cityPicker.btnAdd');

    const favButton = this.authService.isLoggedIn()
      ? `<button id="fav-city-btn" class="popup-btn-fav ${!isFav && isFull ? 'is-full' : ''}">⭐ ${favLabel}</button>`
      : '';

    this.marker.setPopupContent(`
      <div style="text-align:center; padding: 0.5rem; min-width: 150px;">
        <strong>${city.name}</strong><br/>
        <small>${city.country}</small>
        <div class="popup-actions">   
          <button id="select-city-btn" class="popup-btn-select">→ ${selectLabel}</button>
          ${favButton}   
        </div>
        </div>
        `);

    setTimeout(() => {
      const selectBtn = document.getElementById('select-city-btn');
      const favBtn = document.getElementById('fav-city-btn');

      if (selectBtn) {
        fromEvent(selectBtn, 'click')
          .pipe(takeUntil(this.popupDestroy$))
          .subscribe(() => {
            this.cityService.selectCity(city);
            this.router.navigate(['/weather'], {
              queryParams: {
                city: city.name,
                country: city.country,
                lat: city.lat,
                lon: city.lon,
              },
            });
          });
      }

      if (favBtn) {
        fromEvent(favBtn, 'click')
          .pipe(takeUntil(this.popupDestroy$))
          .subscribe(() => {
            if (this.isAdding) return; // block during request

            // if (this.favourites().some((f) => sameCity(f, city))) {
            //   this.store.dispatch(FavouritesActions.removeFavourite({ city }));
            const storedFavourite = this.favourites().find((f) => sameCity(f, city));

            if (storedFavourite) {
              // `city` here comes from reverse-geocoding (Nominatim) and has no
              // backend `id` — dispatch the actual stored favourite instead, which
              // carries the id the DELETE endpoint needs.
              this.store.dispatch(FavouritesActions.removeFavourite({ city: storedFavourite }));
            } else {
              if (this.isFull()) {
                this.showFullWarning.set(true);
                setTimeout(() => this.showFullWarning.set(false), 3500);
                return;
              }
              this.isAdding = true;

              this.store.dispatch(FavouritesActions.addFavourite({ city }));

              setTimeout(() => {
                this.isAdding = false;
                this.updatePopup(city);
              }, 800);
              return;
            }
            this.updatePopup(city);
          });
      }
    }, 150);
  }

  // Clean up map event listeners when the component is destroyed.
  ngOnDestroy() {
    this.popupDestroy$.next();
    this.popupDestroy$.complete();
    this.abortController?.abort();
  }
}
