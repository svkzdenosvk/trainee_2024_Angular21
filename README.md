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
- 🔐 **Authentication** – Register, login and logout with JWT-based authentication and NestJS backend
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
- Per-user favourites stored in PostgreSQL via NestJS REST API
- HTTP interceptor for automatic JWT token injection
- Role enum for type-safe role management
- Unit tests with Vitest covering services and guards
- Geocoding proxy via NestJS backend (CORS bypass)
- DTO validation with class-validator on backend

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

### Backend
| Category | Technology |
|---|---|
| Framework | NestJS |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Auth | JWT |
| Validation | class-validator |
| Deployment | Render |

## APIs Used

- **[Open-Meteo](https://open-meteo.com/)** – Free weather forecast & historical data (no API key required)
- **[Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)** – City search by name
- **[Nominatim](https://nominatim.org/)** – Reverse geocoding (coordinates → city name)

## Getting Started

### Prerequisites
- Node.js 22+
- Angular CLI 21
- NestJS CLI

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
| admin | Admin123* | admin |
| user | User123* | user |

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
│   ├── constants/       # API URL, default user IDs
│   ├── models/          # TypeScript interfaces (City, WeatherRow, User, Role)
│   ├── services/        # Business logic (WeatherService, CityService, FavouritesService, HeatIndexService,AdminService, AuthService, LangService)
│   ├── guards/          # Route guards (CityGuard, AuthGuard, AdminGuard )
│   └── interceptors/    # HTTP interceptors (authInterceptor)
├── features/
│   ├── city-picker/     # Home page with search and map 
│   ├── city-map/        # Leaflet map component
│   ├── favourites/      # Per-user favourites list
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
        └── public-shell/ # Public layout 
```

### Backend
src/
├── auth/                # Auth module - register, login, JWT guard
│   └── dto/             # RegisterDto, LoginDto with validation
├── admin/               # Admin module - user management
├── favourites/          # Favourites CRUD
├── geocoding/           # Geocoding proxy
├── users/               # User profile management
└── prisma/              # Prisma service and module

## Heat Index Formula

Uses the **Rothfusz regression equation** sourced from [weather.gov](https://www.weather.gov/media/epz/wxcalc/heatIndex.pdf) with adjustments for low and high humidity conditions.

> ⚠️ Heat Index cannot be calculated for temperatures below 26.7°C / 80°F

## Authentication

Authentication is implemented using **NestJS + JWT + PostgreSQL** via Supabase.

- Passwords are hashed with **bcrypt**
- JWT token stored in localStorage
- HTTP interceptor automatically attaches Bearer token to all API requests
- Admin role cannot be self-assigned during registration
- Default admin and user accounts are protected from deletion and role changes
- Password requirements: minimum 6, maximum 128 characters, at least one uppercase letter and one digit
- Username requirements: minimum 3, maximum 20 characters


## Deployment

Deployed on Netlify with the following configuration:
- **Build command:** `npm run build`
- **Publish directory:** `dist/weather-app/browser`

### Backend - Render
- **Build command:** `npm run build`
- **Start command:** `node dist/main`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`