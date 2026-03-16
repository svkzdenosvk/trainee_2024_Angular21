import { Component } from '@angular/core';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { WeatherTableComponent } from './features/weather-table/weather-table.component';
import { TemperatureChartComponent } from './features/temperature-chart/temperature-chart.component';
import { HeatIndexCalculatorComponent } from './features/heat-index-calculator/heat-index-calculator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Tabs, TabList, Tab, TabPanels, TabPanel,
    WeatherTableComponent,
    TemperatureChartComponent,
    HeatIndexCalculatorComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {}