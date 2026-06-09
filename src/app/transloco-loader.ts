import { inject, Injectable } from "@angular/core";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { HttpClient } from "@angular/common/http";

// Loader for Transloco that requests language JSON files from the public i18n folder.
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    private http = inject(HttpClient);

    // Fetch the translation file for the given language code.
    getTranslation(lang: string) {
        return this.http.get<Translation>(`/i18n/${lang}.json`);
    }
}
