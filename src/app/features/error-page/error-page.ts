import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';

const LANG_KEY = 'app_lang';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [TranslocoModule, ButtonModule],
  templateUrl: './error-page.html',
  styleUrls: ['./error-page.scss'],
})
export class ErrorPageComponent implements OnDestroy, OnInit {
  private router = inject(Router);
  private readonly translocoService = inject(TranslocoService);
  // private langChangeSubscription: any;
   private langChangeSubscription?: Subscription;

  ngOnInit() {
    // Ensure the error page uses the current app language setting.
    const currentLang = localStorage.getItem(LANG_KEY) ?? this.translocoService.getActiveLang();
    this.translocoService.setActiveLang(currentLang);

    // spy changes in language
    // this.langChangeSubscription = this.translocoService.langChanges$.subscribe((lang) => {
    this.langChangeSubscription = this.translocoService.langChanges$.subscribe(() => {
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

  // Reload the page to retry the failed operation.
  retry(): void {
    window.location.reload();
  }
}
