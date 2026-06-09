import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { AuthService } from './core/services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

// Root application component. It simply hosts the router outlet.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}
