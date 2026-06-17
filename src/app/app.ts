import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Root application component. It simply hosts the router outlet.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}
