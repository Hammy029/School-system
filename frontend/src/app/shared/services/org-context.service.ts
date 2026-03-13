import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrgContextService {
  private _orgId$ = new BehaviorSubject<string | null>(null);
  private _branchId$ = new BehaviorSubject<string | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          const orgId = this.extractId(parsed.organizationId);
          const branchId = this.extractId(parsed.branchId);
          this._orgId$.next(orgId);
          this._branchId$.next(branchId);
        } catch { }
      }
    }
  }

  private extractId(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return typeof value._id === 'string' ? value._id : value._id.toString();
    return null;
  }

  get organizationId(): string | null { return this._orgId$.value; }
  get branchId(): string | null { return this._branchId$.value; }
  get organizationId$(): Observable<string | null> { return this._orgId$.asObservable(); }
  get branchId$(): Observable<string | null> { return this._branchId$.asObservable(); }

  setContext(organizationId: string | any, branchId: string | any): void {
    this._orgId$.next(this.extractId(organizationId));
    this._branchId$.next(this.extractId(branchId));
  }

  clearContext(): void {
    this._orgId$.next(null);
    this._branchId$.next(null);
  }

  getApiPrefix(): string {
    const orgId = this._orgId$.value;
    const branchId = this._branchId$.value;
    if (!orgId || !branchId) {
      console.error('OrgContextService: organizationId or branchId not set.');
      return '';
    }
    return `/organizations/${orgId}/branches/${branchId}`;
  }
}
