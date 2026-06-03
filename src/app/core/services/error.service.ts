import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);

  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();

  showError(msg: string, duration = 3500): void {
    this._error.set(msg);
    setTimeout(() => this._error.set(null), duration);
  }

  showSuccess(msg: string, duration = 3000): void {
    this._success.set(msg);
    setTimeout(() => this._success.set(null), duration);
  }

  clear(): void {
    this._error.set(null);
    this._success.set(null);
  }
}