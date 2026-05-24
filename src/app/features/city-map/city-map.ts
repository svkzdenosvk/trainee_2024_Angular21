import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CityService } from '../../core/services/city.service';
import { FavouritesService } from '../../core/services/favourites.service';
import { City } from '../../core/models/weather.model';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-city-map',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './city-map.html',
  styleUrls: ['./city-map.scss'],
})
export class CityMapComponent implements AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cityService = inject(CityService);
  private readonly favouritesService = inject(FavouritesService);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);
  protected readonly authService = inject(AuthService);

  private map!: L.Map;
  private marker?: L.Marker;
  private currentCity: City | null = null;

  showNoCity = signal(false);
  showFullWarning = signal(false);

  ngAfterViewInit(): void {
    this.initMap();

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
    this.http
      .get<any>(
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

    const isFav = this.favouritesService.isFavourite(city);
    const isFull = this.favouritesService.favourites().length >= 10;
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
      document.getElementById('select-city-btn')?.addEventListener('click', () => {
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
      document.getElementById('fav-city-btn')?.addEventListener(
        'click',
        () => {
          if (this.favouritesService.isFavourite(city)) {
            this.favouritesService.remove(city);
          } else {
            if (this.favouritesService.favourites().length >= 10) {
              this.showFullWarning.set(true);
              setTimeout(() => this.showFullWarning.set(false), 3500);
              return;
            }
            this.favouritesService.add(city);
          }
          this.updatePopup(city);
        },
        { once: true },
      );
    }, 100);
  }
}
