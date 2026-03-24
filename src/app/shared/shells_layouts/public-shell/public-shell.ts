import { Component, inject } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CityService } from '../../../core/services/city.service';

@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, RouterLinkActive,RouterLink],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {
   protected cityService = inject(CityService);

}
