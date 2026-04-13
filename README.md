# Weather App

A modern Angular 21 weather application built as part of a frontend developer trainee program entry task.

## Live Demo

[angular-trainee-2024.netlify.app](https://angular-trainee-2024.netlify.app)

## Features

### Core Features
- 📊 **Weather Data Table** – Sortable, searchable, paginated hourly weather data with custom date range selection
- 📈 **Temperature Chart** – Interactive line chart with hourly/daily average toggle (Chart.js)
- 🌡️ **Heat Index Calculator** – Calculates heat index using the Rothfusz regression equation with last 5 results stored in localStorage
- 🌍 **City Selection** – Search any city worldwide or select via interactive map
- ⭐ **Favourites** – Save up to 10 favourite cities with full CRUD operations
- 🗺️ **OpenStreetMap Integration** – Interactive Leaflet map for city selection
- 🌐 **Multilingual** – English and Slovak language support (Transloco)
- 🔐 **Authentication** – Register, login and logout with localStorage-based user management
- 🛡️ **Role-based Authorization** – Admin and user roles with protected routes and admin dashboard
- 👤 **Admin Dashboard** – Manage users, change roles and delete accounts with PrimeNG data table


### Technical Features
- Lazy loading for all routes
- Route guards protecting weather/chart routes (`cityGuard`, `authGuard`, `adminGuard`)
- Linkable routes with city coordinates in URL params
- Route shell architecture (public/app shell)
- Reactive state management with Angular Signals
- Input validation (90-day date range limit, coordinate validation, password rules)
- Shared component architecture (`AppHeader`, `AppFooter`, `PublicNav`, `LangSwitcher`)
- Centralized language management via `LangService`
- Per-user favourites stored in localStorage
- Unit tests with Vitest covering services and guards

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 21 |
| UI Library | PrimeNG 21 |
| Maps | Leaflet + OpenStreetMap |
| Charts | Chart.js |
| i18n | @jsverse/transloco |
| Weather API | Open-Meteo |
| Geocoding | Open-Meteo Geocoding API |
| Reverse Geocoding | Nominatim |
| Styling | SCSS |
| State Management | Angular Signals |
| Async | RxJS |
| Testing | Vitest |
| Deployment | Netlify |

## APIs Used

- **[Open-Meteo](https://open-meteo.com/)** – Free weather forecast & historical data (no API key required)
- **[Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)** – City search by name
- **[Nominatim](https://nominatim.org/)** – Reverse geocoding (coordinates → city name)

## Getting Started

### Prerequisites
- Node.js 22+
- Angular CLI 21

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd weather-app

# Install dependencies
npm install

# Start development server
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Default Accounts

| Username | Password | Role |
|---|---|---|
| admin | admin123 | admin |
| user | user123 | user |

> ⚠️ These accounts are seeded from localStorage on first run. Do not use real passwords.


### Build
```bash
ng build
```

Output will be in `dist/weather-app/browser/`.

## Project Structure
```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces (City, WeatherRow, etc.)
│   ├── services/        # Business logic (WeatherService, CityService, FavouritesService, HeatIndexService, AuthService, LangService)
│   └── guards/          # Route guards (CityGuard, AuthGuard, AdminGuard )
├── features/
│   ├── city-picker/     # Home page with search, map and favourites
│   ├── city-map/        # Leaflet map component
│   ├── favourites/      # Favourites list
│   ├── weather-table/   # Weather data table
│   ├── temperature-chart/ # Chart.js temperature chart
│   └── heat-index-calculator/ # Heat index calculator
│   ├── login/           # Login page
│   ├── register/        # Registration with password validation
│   └── admin/           # Admin dashboard - user management
└── shared/
    ├── components/      # Reusable UI components
│   |   ├── app-header/
│   |   ├── app-footer/
│   |   ├── app-nav-auth/
│   |   ├── public-nav/
│   |   └── lang-switcher/
    └── shells_layouts/
        ├── app-shell/   # Authenticated layout with navigation
        └── public-shell/ # Public layout for home page
```

## Heat Index Formula

Uses the **Rothfusz regression equation** sourced from [weather.gov](https://www.weather.gov/media/epz/wxcalc/heatIndex.pdf) with adjustments for low and high humidity conditions.

> ⚠️ Heat Index cannot be calculated for temperatures below 26.7°C / 80°F

## Authentication

Authentication is implemented using **localStorage** as a demo backend - no real server is involved. This is intentional for the scope of this trainee project to demonstrate role-based access control patterns in Angular.

- Passwords are stored in plain text in localStorage - **not for production use**
- Admin role is seeded by default and cannot be deleted or demoted
- Registered users receive the `user` role by default
- Password requirements: minimum 6 characters, at least one uppercase letter and one digit

## Deployment

Deployed on Netlify with the following configuration:
- **Build command:** `npm run build`
- **Publish directory:** `dist/weather-app/browser`