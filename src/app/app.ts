import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { FavouritesService } from './core/services/favourites.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  // app-shell.ts alebo public-shell.ts
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter', [style({ opacity: 0 })], { optional: true }),
        query(':leave', [animate('150ms ease-in', style({ opacity: 0 }))], { optional: true }),
        query(':enter', [animate('200ms ease-out', style({ opacity: 1 }))], { optional: true }),
      ]),
    ]),
  ],
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly favouritesService = inject(FavouritesService);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.favouritesService.reloadForUser();
    }
  }
}
