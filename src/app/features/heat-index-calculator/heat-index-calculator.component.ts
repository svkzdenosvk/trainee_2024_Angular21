import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeatIndexService } from '../../core/services/heat-index.service';
import { HeatIndexEntry, TemperatureUnit } from '../../core/models/weather.model';

@Component({
  selector: 'app-heat-index-calculator',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, InputNumberModule,
    SelectButtonModule, ButtonModule, DividerModule, TableModule, TooltipModule
  ],
  templateUrl: './heat-index-calculator.component.html',
  styleUrls: ['./heat-index-calculator.component.scss']
})
export class HeatIndexCalculatorComponent implements OnInit {
  private readonly heatIndexService = inject(HeatIndexService);

  temperature = signal<number>(30);
  humidity = signal<number>(60);
  unit = signal<TemperatureUnit>('°C');
  heatIndex = signal<number | null>(null);
  history = signal<HeatIndexEntry[]>([]);

  unitOptions = [
    { label: '°C', value: '°C' },
    { label: '°F', value: '°F' }
  ];

  readonly minTemp = computed(() => this.heatIndexService.getMinTemp(this.unit()));

  readonly heatIndexLabel = computed(() => {
    const hi = this.heatIndex();
    if (hi === null) return null;
    if (hi >= 54) return { text: 'Extreme Danger', color: '#7f1d1d' };
    if (hi >= 41) return { text: 'Danger', color: '#ef4444' };
    if (hi >= 32) return { text: 'Extreme Caution', color: '#f97316' };
    if (hi >= 27) return { text: 'Caution', color: '#eab308' };
    return { text: 'Safe', color: '#22c55e' };
  });

  ngOnInit(): void {
    this.history.set(this.heatIndexService.loadHistory());
  }

  calculate(): void {
    const result = this.heatIndexService.calculate(
      this.temperature(),
      this.humidity(),
      this.unit()
    );
    this.heatIndex.set(result);

    if (result !== null) {
      const entry: HeatIndexEntry = {
        temperature: this.temperature(),
        humidity: this.humidity(),
        heatIndex: result,
        unit: this.unit(),
        timestamp: new Date()
      };
      this.history.set(this.heatIndexService.saveToHistory(entry));
    }
  }

  onUnitChange(newUnit: TemperatureUnit): void {
    const current = this.temperature();
    if (newUnit === '°F') {
      this.temperature.set(parseFloat(this.heatIndexService.toFahrenheit(current).toFixed(1)));
    } else {
      this.temperature.set(parseFloat(this.heatIndexService.toCelsius(current).toFixed(1)));
    }
    this.unit.set(newUnit);
    this.heatIndex.set(null);
  }

  clearHistory(): void {
    this.heatIndexService.clearHistory();
    this.history.set([]);
  }
}
