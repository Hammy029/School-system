import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrgContextService } from './org-context.service';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private get apiUrl(): string {
    return `${environment.apiUrl}${this.orgContext.getApiPrefix()}/students`;
  }

  constructor(private http: HttpClient, private orgContext: OrgContextService) {}

  getAll(classId?: string, search?: string): Observable<any[]> {
    const params: any = {};
    if (classId) params.classId = classId;
    if (search) params.search = search;
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getByClass(classId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-class/${classId}`);
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

  getCount(classId?: string): Observable<number> {
    const params: any = {};
    if (classId) params.classId = classId;
    return this.http.get<number>(`${this.apiUrl}/count`, { params });
  }
}
