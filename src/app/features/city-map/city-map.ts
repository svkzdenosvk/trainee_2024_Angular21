import { Component, AfterViewInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CityService } from '../../core/services/city.service';
import { City } from '../../core/models/weather.model';

@Component({
  selector: 'app-city-map',
  standalone: true,
  imports: [],
  templateUrl: './city-map.html',
  styleUrls: ['./city-map.scss'],
})
export class CityMapComponent implements AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly cityService = inject(CityService);
  private readonly router = inject(Router);

  private map!: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();
  }

  // private initMap(): void {
  //   this.map = L.map('map').setView([50, 15], 5);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '© OpenStreetMap contributors',
  //   }).addTo(this.map);

  //   this.map.on('click', (e: L.LeafletMouseEvent) => {
  //     this.onMapClick(e.latlng.lat, e.latlng.lng);
  //   });
  // }
  //-----------------------------------------------------------------------------------------

  // private onMapClick(lat: number, lon: number): void {
  //   if (this.marker) this.marker.remove();
  //   this.marker = L.marker([lat, lon]).addTo(this.map);

  //   this.http
  //     .get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
  //     .subscribe((data) => {
  //       const city: City = {
  //         name:
  //           data.address.city || data.address.town || data.address.village || data.address.county,
  //         country: data.address.country,
  //         lat,
  //         lon,
  //       };

  //       this.cityService.selectCity(city);
  //       this.router.navigate(['/weather']);
  //     });
  // }

  private onMapClick(lat: number, lon: number): void {
    if (this.marker) this.marker.remove();

    this.http
      .get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      .subscribe((data) => {
        const city: City = {
          name:
            data.address.city || data.address.town || data.address.village || data.address.county,
          country: data.address.country,
          lat,
          lon,
        };

        this.marker = L.marker([lat, lon])
          .addTo(this.map)
          .bindPopup(
            `
        <div style="text-align:center; padding: 0.5rem;">
          <strong>${city.name}</strong><br/>
          <small>${city.country}</small><br/><br/>
          <button 
            id="select-city-btn"
            style="
              background: linear-gradient(135deg, #f97316, #ef4444);
              color: white;
              border: none;
              padding: 0.4rem 1rem;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
            ">
            Select City
          </button>
        </div>
      `,
          )
          .openPopup();

        // Listen for button click inside popup
        setTimeout(() => {
          document.getElementById('select-city-btn')?.addEventListener('click', () => {
            this.cityService.selectCity(city);
            this.router.navigate(['/weather']);
          });
        }, 100);
      });
  }

  private initMap(): void {
    this.map = L.map('map').setView([50, 15], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Leaflet marker icon fix for Angular
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
}
