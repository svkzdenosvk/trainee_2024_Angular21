import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { CityService } from './core/services/city.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // templateUrl: './app.html',
  template: `<router-outlet />`,
  styleUrls: [],

})
export class App {
 
}
