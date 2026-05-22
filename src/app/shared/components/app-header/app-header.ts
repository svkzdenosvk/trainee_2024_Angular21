import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <h1>{{ cityName() ? cityName() + ' ' : '' }}{{ 'header.title' | transloco }}</h1>
      <p>{{ 'header.subtitle' | transloco }}</p>
    </header>
  `,
  styleUrl: './app-header.scss',
})
export class AppHeader {
  cityName = input<string | null | undefined>();
}
