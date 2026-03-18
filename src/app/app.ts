import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WeatherTableComponent } from './features/weather-table/weather-table.component';
import { TemperatureChartComponent } from './features/temperature-chart/temperature-chart.component';
import { HeatIndexCalculatorComponent } from './features/heat-index-calculator/heat-index-calculator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    WeatherTableComponent,
    TemperatureChartComponent,
    HeatIndexCalculatorComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {}
