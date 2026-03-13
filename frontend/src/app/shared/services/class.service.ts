import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrgContextService } from './org-context.service';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private get apiUrl(): string {
    return `${environment.apiUrl}${this.orgContext.getApiPrefix()}/classes`;
  }

  constructor(private http: HttpClient, private orgContext: OrgContextService) {}

  getAll(academicYear?: string): Observable<any[]> {
    const params: any = {};
    if (academicYear) params.academicYear = academicYear;
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
