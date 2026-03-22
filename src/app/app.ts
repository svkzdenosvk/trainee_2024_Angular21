import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WeatherTableComponent } from './features/weather-table/weather-table';
import { TemperatureChartComponent } from './features/temperature-chart/temperature-chart';
import { HeatIndexCalculatorComponent } from './features/heat-index-calculator/heat-index-calculator';
import { CityService } from './core/services/city.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    // WeatherTableComponent,
    // TemperatureChartComponent,
    // HeatIndexCalculatorComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected cityService = inject(CityService);

}
