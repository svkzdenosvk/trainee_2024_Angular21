import { Routes } from '@angular/router';
import { cityGuard } from './core/guards/city-guard';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/shells_layouts/public-shell/public-shell').then((m) => m.PublicShell),
    children: [
      {
        path: 'favourites',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/favourites/favourites').then((m) => m.FavouritesComponent),
      },
      {
        path: '',
        loadComponent: () =>
          import('./features/city-picker/city-picker').then((m) => m.CityPickerComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'heat-index',
        loadComponent: () =>
          import('./features/heat-index-calculator/heat-index-calculator').then(
            (m) => m.HeatIndexCalculatorComponent,
          ),
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/shells_layouts/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: 'favourites',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/favourites/favourites').then((m) => m.FavouritesComponent),
      },
      {
        path: 'weather',
        canActivate: [cityGuard],
        loadComponent: () =>
          import('./features/weather-table/weather-table').then((m) => m.WeatherTableComponent),
      },
      {
        path: 'chart',
        canActivate: [cityGuard],
        loadComponent: () =>
          import('./features/temperature-chart/temperature-chart').then(
            (m) => m.TemperatureChartComponent,
          ),
      },
    ],
  },
];
