import { Routes } from '@angular/router';
import { cityGuard } from './core/guards/city-guard';

export const routes: Routes = [
  { path: '',
     loadComponent: () =>
      import('./features/city-picker/city-picker').then(
        (m) => m.CityPickerComponent,
      ), },
  {
    path: 'weather',
    canActivate: [cityGuard],
    loadComponent: () =>
      import('./features/weather-table/weather-table').then(
        (m) => m.WeatherTableComponent,
      ),
  },
  {
    path: 'chart',
    canActivate: [cityGuard],
    loadComponent: () =>
      import('./features/temperature-chart/temperature-chart').then(
        (m) => m.TemperatureChartComponent,
      ),
  },
  {
    path: 'heat-index',
    loadComponent: () =>
      import('./features/heat-index-calculator/heat-index-calculator').then(
        (m) => m.HeatIndexCalculatorComponent,
      ),
  },
];
