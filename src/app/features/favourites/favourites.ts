import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FavouritesService } from '../../core/services/favourites.service';
import { CityService } from '../../core/services/city.service';
import { City } from '../../core/models/weather.model';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, InputText,TranslocoModule],
  templateUrl: './favourites.html',
  styleUrls: ['./favourites.scss']
})
export class FavouritesComponent {
  protected readonly favouritesService = inject(FavouritesService);
  private readonly cityService = inject(CityService);
  private readonly router = inject(Router);

  editingCity = signal<City | null>(null);
  editName = signal('');

  selectCity(city: City): void {
    this.cityService.selectCity(city);
    this.router.navigate(['/weather'], {
      queryParams: {
        city: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
      }
    });
  }

  startEdit(city: City): void {
    this.editingCity.set(city);
    this.editName.set(city.name);
  }

  confirmEdit(city: City): void {
    if (this.editName().trim()) {
      this.favouritesService.update(city, this.editName().trim());
    }
    this.editingCity.set(null);
  }

  cancelEdit(): void {
    this.editingCity.set(null);
  }
}