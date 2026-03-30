import {
  Component,
  OnInit,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { WeatherService } from '../../core/services/weather.service';
import { WeatherRow } from '../../core/models/weather.model';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

Chart.register(...registerables);

type ViewMode = 'all' | 'daily';

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    DatePicker,
    ProgressSpinner,
    TranslocoModule,
  ],
  templateUrl: './temperature-chart.html',
  styleUrls: ['./temperature-chart.scss'],
})
export class TemperatureChartComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly weatherService = inject(WeatherService);
  private readonly translocoService = inject(TranslocoService);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private allRows: WeatherRow[] = [];

  loading = signal(false);
  error = signal<string | null>(null);
  dateRange = signal<Date[]>([]);
  viewMode = signal<ViewMode>('all');

  ngOnInit(): void {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const start = new Date();
    start.setDate(start.getDate() - 7);
    this.dateRange.set([start, end]);

    this.translocoService.langChanges$.subscribe((lang) => {
      this.translocoService.load(lang).subscribe(() => {
        if (this.allRows.length > 0) this.renderChart();
      });
    });
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  loadData(): void {
    const range = this.dateRange();
    const error = this.weatherService.validateDateRange(range);
    if (error) {
      this.error.set(error);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.weatherService
      .getWeatherData(
        this.weatherService.formatDate(range[0]),
        this.weatherService.formatDate(range[1]),
      )
      .subscribe({
        next: (data) => {
          this.allRows = data;
          this.loading.set(false);
          setTimeout(() => this.renderChart(), 0);
        },
        error: () => {
          this.error.set('temperatureChart.loadingError');
          // this.error.set(this.translocoService.translate('temperatureChart.loadingError'));
          this.loading.set(false);
        },
      });
  }

  onViewModeChange(): void {
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.chartCanvas) return;

    const rows = this.viewMode() === 'daily' ? this.aggregateDailyAvg(this.allRows) : this.allRows;

    const labels = rows.map((r) =>
      this.viewMode() === 'daily'
        ? r.datetime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : r.datetime.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
    );

    this.chart?.destroy();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            // label: 'Temperature (°C)',
            label: this.translocoService.translate('temperatureChart.tableTitle'),
            data: rows.map((r) => r.temperature),
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            borderWidth: 2,
            pointRadius: this.viewMode() === 'daily' ? 5 : 0,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#94a3b8' } },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.parsed.y?.toFixed(1)}°C` },
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', maxTicksLimit: 12, maxRotation: 45 },
            grid: { color: '#1e293b' },
          },
          y: {
            ticks: { color: '#64748b', callback: (val) => `${val}°C` },
            grid: { color: '#1e293b' },
          },
        },
      },
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private aggregateDailyAvg(rows: WeatherRow[]): WeatherRow[] {
    const map = new Map<string, { sum: number; count: number; row: WeatherRow }>();
    for (const row of rows) {
      const key = row.datetime.toISOString().split('T')[0];
      if (!map.has(key)) {
        map.set(key, { sum: row.temperature, count: 1, row });
      } else {
        const e = map.get(key)!;
        e.sum += row.temperature;
        e.count++;
      }
    }
    return Array.from(map.values()).map(({ sum, count, row }) => ({
      ...row,
      temperature: parseFloat((sum / count).toFixed(1)),
    }));
  }
}
