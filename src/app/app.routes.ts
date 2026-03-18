import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'weather', pathMatch: 'full' },
  {
    path: 'weather',
    loadComponent: () =>
      import('./features/weather-table/weather-table.component').then(
        (m) => m.WeatherTableComponent,
      ),
  },
  {
    path: 'chart',
    loadComponent: () =>
      import('./features/temperature-chart/temperature-chart.component').then(
        (m) => m.TemperatureChartComponent,
      ),
  },
  {
    path: 'heat-index',
    loadComponent: () =>
      import('./features/heat-index-calculator/heat-index-calculator.component').then(
        (m) => m.HeatIndexCalculatorComponent,
      ),
  },
];
