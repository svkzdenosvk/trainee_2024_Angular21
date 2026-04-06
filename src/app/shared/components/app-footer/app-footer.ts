import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslocoModule],
  template: `<footer class="app-footer">{{ 'footer' | transloco }}</footer>`,
  styles: [`
    .app-footer {
  text-align: center;
  padding: 1rem;
  color: #475569;
  font-size: 0.8rem;
  border-top: 1px solid #1e293b;
  margin-top: 1.5rem;
}`],
})
export class AppFooter {}