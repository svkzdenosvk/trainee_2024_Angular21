// import { Component, AfterViewInit, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import * as L from 'leaflet';
// import { CityService } from '../../core/services/city.service';
// import { City } from '../../core/models/weather.model';
// import { FavouritesService } from '../../core/services/favourites.service';

// @Component({
//   selector: 'app-city-map',
//   standalone: true,
//   imports: [],
//   templateUrl: './city-map.html',
//   styleUrls: ['./city-map.scss'],
// })
// export class CityMapComponent implements AfterViewInit {
//   private readonly http = inject(HttpClient);
//   private readonly cityService = inject(CityService);
//   private readonly router = inject(Router);

//   private map!: L.Map;
//   private marker?: L.Marker;

//   ngAfterViewInit(): void {
//     this.initMap();
//   }

//   // private initMap(): void {
//   //   this.map = L.map('map').setView([50, 15], 5);

//   //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   //     attribution: '© OpenStreetMap contributors',
//   //   }).addTo(this.map);

//   //   this.map.on('click', (e: L.LeafletMouseEvent) => {
//   //     this.onMapClick(e.latlng.lat, e.latlng.lng);
//   //   });
//   // }
//   //-----------------------------------------------------------------------------------------

//   // private onMapClick(lat: number, lon: number): void {
//   //   if (this.marker) this.marker.remove();
//   //   this.marker = L.marker([lat, lon]).addTo(this.map);

//   //   this.http
//   //     .get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
//   //     .subscribe((data) => {
//   //       const city: City = {
//   //         name:
//   //           data.address.city || data.address.town || data.address.village || data.address.county,
//   //         country: data.address.country,
//   //         lat,
//   //         lon,
//   //       };

//   //       this.cityService.selectCity(city);
//   //       this.router.navigate(['/weather']);
//   //     });
//   // }

//   private onMapClick(lat: number, lon: number): void {
//     if (this.marker) this.marker.remove();

//     this.http
//       .get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
//       .subscribe((data) => {
//         const city: City = {
//           name:
//             data.address.city || data.address.town || data.address.village || data.address.county,
//           country: data.address.country,
//           lat,
//           lon,
//         };

//         this.marker = L.marker([lat, lon])
//           .addTo(this.map)
//           .bindPopup(
//             `
//         <div style="text-align:center; padding: 0.5rem;">
//           <strong>${city.name}</strong><br/>
//           <small>${city.country}</small><br/><br/>
//           <button 
//             id="select-city-btn"
//             style="
//               background: linear-gradient(135deg, #f97316, #ef4444);
//               color: white;
//               border: none;
//               padding: 0.4rem 1rem;
//               border-radius: 6px;
//               cursor: pointer;
//               font-weight: 600;
//             ">
//             Select City
//           </button>
//         </div>
//       `,
//           )
//           .openPopup();

//         // Listen for button click inside popup
//         setTimeout(() => {
//           document.getElementById('select-city-btn')?.addEventListener('click', () => {
//             //small validation
//             if (!city.name?.trim()) {
//               alert(
//                 'Unable to determine city name at this location. Try clicking directly on a city.',
//               );
//               return;
//             }

//             this.cityService.selectCity(city);
//             this.router.navigate(['/weather'], {
//               queryParams: {
//                 city: city.name,
//                 country: city.country,
//                 lat: city.lat,
//                 lon: city.lon,
//               },
//             });
//           });
//         }, 100);
//       });
//   }

//   private initMap(): void {
//     this.map = L.map('map').setView([50, 15], 5);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '© OpenStreetMap contributors',
//     }).addTo(this.map);

//     // Leaflet marker icon fix for Angular
//     const iconDefault = L.icon({
//       iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//       iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//       shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//     });
//     L.Marker.prototype.options.icon = iconDefault;

//     this.map.on('click', (e: L.LeafletMouseEvent) => {
//       this.onMapClick(e.latlng.lat, e.latlng.lng);
//     });
//   }
// }

import { Component, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CityService } from '../../core/services/city.service';
import { FavouritesService } from '../../core/services/favourites.service';
import { City } from '../../core/models/weather.model';

@Component({
  selector: 'app-city-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-map.html',
  styleUrls: ['./city-map.scss']
})
export class CityMapComponent implements AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cityService = inject(CityService);
  private readonly favouritesService = inject(FavouritesService);
  private readonly router = inject(Router);

  private map!: L.Map;
  private marker?: L.Marker;

  showNoCity = signal(false);
  showFullWarning = signal(false);

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([50, 15], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix for missing marker icons in Angular build
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }

  private onMapClick(lat: number, lon: number): void {
    this.http.get<any>(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    ).subscribe(data => {
      const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county;

      if (!name) {
        this.showNoCity.set(true);
        setTimeout(() => this.showNoCity.set(false), 3000);
        return;
      }

      const city: City = {
        name,
        country: data.address?.country ?? '',
        lat,
        lon
      };

      if (this.marker) this.marker.remove();

      const isFav = this.favouritesService.isFavourite(city);
      const favLabel = isFav ? '⭐ Remove' : '⭐ Add';

      this.marker = L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`
          <div style="text-align:center; padding: 0.5rem; min-width: 150px;">
            <strong>${city.name}</strong><br/>
            <small>${city.country}</small><br/><br/>
            <div style="display:flex; gap:0.5rem; justify-content:center;">
              <button id="select-city-btn" style="
                background: linear-gradient(135deg, #f97316, #ef4444);
                color: white; border: none; padding: 0.4rem 0.75rem;
                border-radius: 6px; cursor: pointer; font-weight: 600;">
                → Select
              </button>
              <button id="fav-city-btn" style="
                background: #374151; color: #d1d5db;
                border: none; padding: 0.4rem 0.75rem;
                border-radius: 6px; cursor: pointer;">
                ${favLabel}
              </button>
            </div>
          </div>
        `)
        .openPopup();

      setTimeout(() => {
        document.getElementById('select-city-btn')?.addEventListener('click', () => {
          this.cityService.selectCity(city);
          this.router.navigate(['/weather'], {
            queryParams: {
              city: city.name,
              country: city.country,
              lat: city.lat,
              lon: city.lon
            }
          });
        });

        // document.getElementById('fav-city-btn')?.addEventListener('click', () => {
        //   if (this.favouritesService.isFavourite(city)) {
        //     this.favouritesService.remove(city);
        //   } else {
        //     if (this.favouritesService.isFull()) {
        //       this.showFullWarning.set(true);
        //       setTimeout(() => this.showFullWarning.set(false), 5000);
        //       return;
        //     }
        //     this.favouritesService.add(city);
        //   }
        // });
        document.getElementById('fav-city-btn')?.addEventListener('click', () => {
  if (this.favouritesService.isFavourite(city)) {
    this.favouritesService.remove(city);
    const btn = document.getElementById('fav-city-btn');
    if (btn) btn.innerText = '⭐ Add';
  } else {
    if (this.favouritesService.isFull()) {
      this.showFullWarning.set(true);
      setTimeout(() => this.showFullWarning.set(false), 5000);
      return;
    }
    this.favouritesService.add(city);
    const btn = document.getElementById('fav-city-btn');
    if (btn) btn.innerText = '⭐ Remove';
  }
});
      }, 100);
    });
  }
}