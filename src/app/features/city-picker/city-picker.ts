import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CityService } from '../../core/services/city.service';
import { City } from '../../core/models/weather.model';
import { CityMapComponent } from '../city-map/city-map';
import { SelectButton } from 'primeng/selectbutton';

@Component({
  selector: 'app-city-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, ProgressSpinner, SelectButton, CityMapComponent],
  templateUrl: './city-picker.html',
  styleUrls: ['./city-picker.scss']
})
export class CityPickerComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cityService = inject(CityService);

  searchQuery = signal('');
  results = signal<City[]>([]);
  loading = signal(false);
    viewMode = signal<'search' | 'map'>('search');

     modeOptions = [
    { label: '🔍 Search', value: 'search' },
    { label: '🗺️ Map', value: 'map' }
  ];
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.results.set([]);
          return [];
        }
        this.loading.set(true);
        return this.http.get<any>(
          `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`
        );
      })
    ).subscribe({
      next: (data: any) => {
        this.loading.set(false);
        if (data?.results) {
          this.results.set(data.results.map((r: any) => ({
            name: r.name,
            country: r.country,
            lat: r.latitude,
            lon: r.longitude
          })));
        } else {
          this.results.set([]);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectCity(city: City): void {
    this.cityService.selectCity(city);
    this.router.navigate(['/weather']);
  }
}