import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum SchoolPermission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_ORGANIZATIONS = 'VIEW_ORGANIZATIONS',
  CREATE_ORGANIZATION = 'CREATE_ORGANIZATION',
  EDIT_ORGANIZATION = 'EDIT_ORGANIZATION',
  DELETE_ORGANIZATION = 'DELETE_ORGANIZATION',
  APPROVE_ORGANIZATION = 'APPROVE_ORGANIZATION',
  VIEW_BRANCHES = 'VIEW_BRANCHES',
  CREATE_BRANCH = 'CREATE_BRANCH',
  EDIT_BRANCH = 'EDIT_BRANCH',
  DELETE_BRANCH = 'DELETE_BRANCH',
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USER = 'CREATE_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',
  APPROVE_USER = 'APPROVE_USER',
  MANAGE_USER_PERMISSIONS = 'MANAGE_USER_PERMISSIONS',
  VIEW_STAFF = 'VIEW_STAFF',
  CREATE_STAFF = 'CREATE_STAFF',
  EDIT_STAFF = 'EDIT_STAFF',
  DELETE_STAFF = 'DELETE_STAFF',
  VIEW_CLASSES = 'VIEW_CLASSES',
  CREATE_CLASS = 'CREATE_CLASS',
  EDIT_CLASS = 'EDIT_CLASS',
  DELETE_CLASS = 'DELETE_CLASS',
  VIEW_SUBJECTS = 'VIEW_SUBJECTS',
  CREATE_SUBJECT = 'CREATE_SUBJECT',
  EDIT_SUBJECT = 'EDIT_SUBJECT',
  DELETE_SUBJECT = 'DELETE_SUBJECT',
  VIEW_STUDENTS = 'VIEW_STUDENTS',
  CREATE_STUDENT = 'CREATE_STUDENT',
  EDIT_STUDENT = 'EDIT_STUDENT',
  DELETE_STUDENT = 'DELETE_STUDENT',
  VIEW_TIMETABLE = 'VIEW_TIMETABLE',
  CREATE_TIMETABLE = 'CREATE_TIMETABLE',
  EDIT_TIMETABLE = 'EDIT_TIMETABLE',
  DELETE_TIMETABLE = 'DELETE_TIMETABLE',
  VIEW_GRADES = 'VIEW_GRADES',
  CREATE_GRADE = 'CREATE_GRADE',
  EDIT_GRADE = 'EDIT_GRADE',
  DELETE_GRADE = 'DELETE_GRADE',
  VIEW_PERFORMANCE = 'VIEW_PERFORMANCE',
  GENERATE_REPORTS = 'GENERATE_REPORTS',
  VIEW_PAYMENTS = 'VIEW_PAYMENTS',
  CREATE_PAYMENT = 'CREATE_PAYMENT',
  EDIT_PAYMENT = 'EDIT_PAYMENT',
  DELETE_PAYMENT = 'DELETE_PAYMENT',
  VIEW_FEE_STRUCTURE = 'VIEW_FEE_STRUCTURE',
  MANAGE_FEE_STRUCTURE = 'MANAGE_FEE_STRUCTURE',
  INITIATE_MPESA_PAYMENT = 'INITIATE_MPESA_PAYMENT',
  VIEW_MPESA_TRANSACTIONS = 'VIEW_MPESA_TRANSACTIONS',
  DELETE_MPESA_TRANSACTION = 'DELETE_MPESA_TRANSACTION',
  VIEW_APPROVALS = 'VIEW_APPROVALS',
  MANAGE_APPROVALS = 'MANAGE_APPROVALS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
}

export interface PermissionGroup {
  name: string;
  icon: string;
  permissions: { key: SchoolPermission; label: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Dashboard',
    icon: '📊',
    permissions: [
      { key: SchoolPermission.VIEW_DASHBOARD, label: 'View Dashboard' },
    ],
  },
  {
    name: 'Organizations',
    icon: '🏢',
    permissions: [
      { key: SchoolPermission.VIEW_ORGANIZATIONS, label: 'View Organizations' },
      { key: SchoolPermission.CREATE_ORGANIZATION, label: 'Create Organization' },
      { key: SchoolPermission.EDIT_ORGANIZATION, label: 'Edit Organization' },
      { key: SchoolPermission.DELETE_ORGANIZATION, label: 'Delete Organization' },
      { key: SchoolPermission.APPROVE_ORGANIZATION, label: 'Approve Organization' },
    ],
  },
  {
    name: 'Branches',
    icon: '🏪',
    permissions: [
      { key: SchoolPermission.VIEW_BRANCHES, label: 'View Branches' },
      { key: SchoolPermission.CREATE_BRANCH, label: 'Create Branch' },
      { key: SchoolPermission.EDIT_BRANCH, label: 'Edit Branch' },
      { key: SchoolPermission.DELETE_BRANCH, label: 'Delete Branch' },
    ],
  },
  {
    name: 'User Management',
    icon: '👤',
    permissions: [
      { key: SchoolPermission.VIEW_USERS, label: 'View Users' },
      { key: SchoolPermission.CREATE_USER, label: 'Create User' },
      { key: SchoolPermission.EDIT_USER, label: 'Edit User' },
      { key: SchoolPermission.DELETE_USER, label: 'Delete User' },
      { key: SchoolPermission.APPROVE_USER, label: 'Approve User' },
      { key: SchoolPermission.MANAGE_USER_PERMISSIONS, label: 'Manage Permissions' },
    ],
  },
  {
    name: 'Staff',
    icon: '🪪',
    permissions: [
      { key: SchoolPermission.VIEW_STAFF, label: 'View Staff' },
      { key: SchoolPermission.CREATE_STAFF, label: 'Create Staff' },
      { key: SchoolPermission.EDIT_STAFF, label: 'Edit Staff' },
      { key: SchoolPermission.DELETE_STAFF, label: 'Delete Staff' },
    ],
  },
  {
    name: 'Classes',
    icon: '🏫',
    permissions: [
      { key: SchoolPermission.VIEW_CLASSES, label: 'View Classes' },
      { key: SchoolPermission.CREATE_CLASS, label: 'Create Class' },
      { key: SchoolPermission.EDIT_CLASS, label: 'Edit Class' },
      { key: SchoolPermission.DELETE_CLASS, label: 'Delete Class' },
    ],
  },
  {
    name: 'Subjects',
    icon: '📚',
    permissions: [
      { key: SchoolPermission.VIEW_SUBJECTS, label: 'View Subjects' },
      { key: SchoolPermission.CREATE_SUBJECT, label: 'Create Subject' },
      { key: SchoolPermission.EDIT_SUBJECT, label: 'Edit Subject' },
      { key: SchoolPermission.DELETE_SUBJECT, label: 'Delete Subject' },
    ],
  },
  {
    name: 'Students',
    icon: '🎓',
    permissions: [
      { key: SchoolPermission.VIEW_STUDENTS, label: 'View Students' },
      { key: SchoolPermission.CREATE_STUDENT, label: 'Create Student' },
      { key: SchoolPermission.EDIT_STUDENT, label: 'Edit Student' },
      { key: SchoolPermission.DELETE_STUDENT, label: 'Delete Student' },
    ],
  },
  {
    name: 'Timetable',
    icon: '📅',
    permissions: [
      { key: SchoolPermission.VIEW_TIMETABLE, label: 'View Timetable' },
      { key: SchoolPermission.CREATE_TIMETABLE, label: 'Create Timetable' },
      { key: SchoolPermission.EDIT_TIMETABLE, label: 'Edit Timetable' },
      { key: SchoolPermission.DELETE_TIMETABLE, label: 'Delete Timetable' },
    ],
  },
  {
    name: 'Grading',
    icon: '⭐',
    permissions: [
      { key: SchoolPermission.VIEW_GRADES, label: 'View Grades' },
      { key: SchoolPermission.CREATE_GRADE, label: 'Create Grade' },
      { key: SchoolPermission.EDIT_GRADE, label: 'Edit Grade' },
      { key: SchoolPermission.DELETE_GRADE, label: 'Delete Grade' },
    ],
  },
  {
    name: 'Performance',
    icon: '📈',
    permissions: [
      { key: SchoolPermission.VIEW_PERFORMANCE, label: 'View Performance' },
      { key: SchoolPermission.GENERATE_REPORTS, label: 'Generate Reports' },
    ],
  },
  {
    name: 'Payments',
    icon: '💳',
    permissions: [
      { key: SchoolPermission.VIEW_PAYMENTS, label: 'View Payments' },
      { key: SchoolPermission.CREATE_PAYMENT, label: 'Create Payment' },
      { key: SchoolPermission.EDIT_PAYMENT, label: 'Edit Payment' },
      { key: SchoolPermission.DELETE_PAYMENT, label: 'Delete Payment' },
      { key: SchoolPermission.VIEW_FEE_STRUCTURE, label: 'View Fee Structure' },
      { key: SchoolPermission.MANAGE_FEE_STRUCTURE, label: 'Manage Fee Structure' },
    ],
  },
  {
    name: 'M-Pesa',
    icon: '📱',
    permissions: [
      { key: SchoolPermission.INITIATE_MPESA_PAYMENT, label: 'Initiate M-Pesa Payment' },
      { key: SchoolPermission.VIEW_MPESA_TRANSACTIONS, label: 'View M-Pesa Transactions' },
      { key: SchoolPermission.DELETE_MPESA_TRANSACTION, label: 'Delete M-Pesa Transaction' },
    ],
  },
  {
    name: 'Approvals',
    icon: '✅',
    permissions: [
      { key: SchoolPermission.VIEW_APPROVALS, label: 'View Approvals' },
      { key: SchoolPermission.MANAGE_APPROVALS, label: 'Manage Approvals' },
    ],
  },
  {
    name: 'Reports & System',
    icon: '⚙️',
    permissions: [
      { key: SchoolPermission.VIEW_REPORTS, label: 'View Reports' },
      { key: SchoolPermission.EXPORT_REPORTS, label: 'Export Reports' },
      { key: SchoolPermission.SYSTEM_SETTINGS, label: 'System Settings' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/auth/permissions`;
  private _currentPermissions$ = new BehaviorSubject<string[]>([]);
  currentPermissions$ = this._currentPermissions$.asObservable();

  constructor(private http: HttpClient) {}

  getUserPermissions(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}`);
  }

  updateUserPermissions(userId: string, permissions: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, { permissions });
  }

  getMyPermissions(): Observable<{ permissions: string[]; role: string }> {
    return this.http.get<{ permissions: string[]; role: string }>(`${this.apiUrl}/me`);
  }

  loadCurrentUserPermissions(): void {
    this.getMyPermissions().subscribe({
      next: (res) => this._currentPermissions$.next(res.permissions),
    });
  }

  hasPermission(permission: string): boolean {
    return this._currentPermissions$.value.includes(permission);
  }

  getPermissionGroups(): PermissionGroup[] {
    return PERMISSION_GROUPS;
  }
}
