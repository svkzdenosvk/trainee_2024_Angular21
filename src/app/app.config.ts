import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';

// Nora theme
import Nora from '@primeng/themes/nora';


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    providePrimeNG({
      theme: { preset: Nora,options: {
      darkModeSelector: 'system', // dark mode by the system
      
    } }
    }),
  ],
};
