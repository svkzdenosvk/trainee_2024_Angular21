import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
// import { AppLangSwitcher } from '../_app-lang-switcher/app-lang-switcher';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule,/* AppLangSwitcher*/],
  templateUrl: './app-public-nav.html',
  styleUrl: '../../scss/_shells.scss',
})
export class AppPublicNav {
  protected readonly authService = inject(AuthService);

  isOpen = signal(false);

  toggleMenu(): void {
    this.isOpen.update(value => !value);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }
}
