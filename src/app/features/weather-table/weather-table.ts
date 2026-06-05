import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { WeatherService } from '../../core/services/weather.service';
import { WeatherRow } from '../../core/models/weather.model';
import { CityService } from '../../core/services/city.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-weather-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TableModule,
    DatePicker,
    Button,
    InputText,
    ProgressSpinner,
    TranslocoModule,
  ],
  templateUrl: './weather-table.html',
  styleUrls: ['./weather-table.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherTableComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);
  protected readonly cityService = inject(CityService);
  private readonly translocoService = inject(TranslocoService);

  constructor() {
    // reload data on language change to update weather state labels
    this.translocoService.langChanges$.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.rows().length > 0) {
        this.loadData();
      }
    });
  }

  rows = signal<WeatherRow[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  dateRange = signal<Date[]>([]);

  readonly columns = [
    { field: 'datetime', headerKey: 'weather.columns.datetime', sortable: true },
    { field: 'weatherState', headerKey: 'weather.columns.weatherState', sortable: true },
    { field: 'temperature', headerKey: 'weather.columns.temperature', sortable: true },
    { field: 'humidity', headerKey: 'weather.columns.humidity', sortable: true },
    { field: 'pressure', headerKey: 'weather.columns.pressure', sortable: true },
    { field: 'windSpeed', headerKey: 'weather.columns.windSpeed', sortable: true },
    { field: 'precipitation', headerKey: 'weather.columns.precipitation', sortable: true },
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

    this.weatherService
      .getWeatherData(
        this.weatherService.formatDate(range[0]),
        this.weatherService.formatDate(range[1]),
      )
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load weather data.');
          this.loading.set(false);
        },
      });
  }

  getTempClass(temp: number): string {
    if (temp >= 35) return 'temp-hot';
    if (temp >= 25) return 'temp-warm';
    if (temp >= 15) return 'temp-mild';
    if (temp >= 5) return 'temp-cool';
    return 'temp-cold';
  }

  onGlobalFilter(event: Event, table: any): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
