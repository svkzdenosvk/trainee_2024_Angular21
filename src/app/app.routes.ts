import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',
     loadComponent: () =>
      import('./features/city-picker/city-picker').then(
        (m) => m.CityPickerComponent,
      ), },
  {
    path: 'weather',
    loadComponent: () =>
      import('./features/weather-table/weather-table').then(
        (m) => m.WeatherTableComponent,
      ),
  },
  {
    path: 'chart',
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
