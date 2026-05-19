import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AppLangSwitcher } from '../_app-lang-switcher/app-lang-switcher';

@Component({
  selector: 'app-nav-auth',
  imports: [TranslocoModule, AppLangSwitcher],
  templateUrl: './app-nav-auth.html',
  styleUrl: './app-nav-auth.scss',
})
export class AppNavAuth {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
}
