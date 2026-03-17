import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Card } from 'primeng/card';
import { Tooltip } from 'primeng/tooltip';
import { WeatherService } from '../../core/services/weather.service';
import { WeatherRow } from '../../core/models/weather.model';

@Component({
  selector: 'app-weather-table',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    TableModule, DatePicker, Button, InputText,
    ProgressSpinner, Card, Tooltip
  ],
  templateUrl: './weather-table.component.html',
  styleUrls: ['./weather-table.component.scss']
})
export class WeatherTableComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);

  rows = signal<WeatherRow[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  dateRange = signal<Date[]>([]);

  readonly columns = [
    { field: 'datetime',      header: 'Datetime',       sortable: true },
    { field: 'weatherState',  header: 'Weather State',  sortable: true },
    { field: 'temperature',   header: 'Temp (°C)',      sortable: true },
    { field: 'humidity',      header: 'Humidity (%)',   sortable: true },
    { field: 'pressure',      header: 'Pressure (hPa)', sortable: true },
    { field: 'windSpeed',     header: 'Wind (km/h)',    sortable: true },
    { field: 'precipitation', header: 'Precip. (mm)',   sortable: true }
  ];

  ngOnInit(): void {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const start = new Date();
    start.setDate(start.getDate() - 7);
    this.dateRange.set([start, end]);
    this.loadData();
  }


loadData(): void {
  const range = this.dateRange();
  const error = this.weatherService.validateDateRange(range);
  if (error) {
    this.error.set(error);
    return;
  }

    this.loading.set(true);
    this.error.set(null);

    this.weatherService.getWeatherData(
      this.weatherService.formatDate(range[0]),
      this.weatherService.formatDate(range[1])
    ).subscribe({
      next: data => { this.rows.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load weather data.'); this.loading.set(false); }
    });
  }

  getTempClass(temp: number): string {
    if (temp >= 35) return 'temp-hot';
    if (temp >= 25) return 'temp-warm';
    if (temp >= 15) return 'temp-mild';
    if (temp >= 5)  return 'temp-cool';
    return 'temp-cold';
  }

  onGlobalFilter(event: Event, table: any): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}