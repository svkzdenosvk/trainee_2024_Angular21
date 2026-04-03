import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-auth',
  imports: [TranslocoModule],
  templateUrl: './nav-auth.html',
  styleUrl: './nav-auth.scss',
})
export class NavAuth {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
}
