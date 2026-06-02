import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

const LANG_KEY = 'app_lang';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [TranslocoModule, ButtonModule],
  templateUrl: './error-page.html',
  styleUrls: ['./error-page.scss'],
})
export class ErrorPageComponent {
  private router = inject(Router);
  private readonly translocoService = inject(TranslocoService);
  private langChangeSubscription: any;

  ngOnInit() {
    // explicitly set language based on localStorage or default
    const currentLang = localStorage.getItem(LANG_KEY) ?? this.translocoService.getActiveLang();
    this.translocoService.setActiveLang(currentLang);

    // spy changes in language
    this.langChangeSubscription = this.translocoService.langChanges$.subscribe((lang) => {
      // language has been changed automatically
    });
  }
  ngOnDestroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
  goHome(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    window.location.reload();
  }
}
