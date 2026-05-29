import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button'; 

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [TranslocoModule, ButtonModule],
  templateUrl: './error-page.html',
  styleUrls: ['./error-page.scss'],
})
export class ErrorPageComponent {
  private router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    window.location.reload();
  }
}
