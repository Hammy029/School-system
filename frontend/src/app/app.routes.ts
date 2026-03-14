import { Routes } from '@angular/router';
import { AuthGuard } from './authentication/core/auth/auth.guard';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { UpdatePasswordComponent } from './authentication/update-password/update-password.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClassesComponent } from './pages/classes/classes.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { StudentsComponent } from './pages/students/students.component';
import { GradingComponent } from './pages/grading/grading.component';
import { PerformanceComponent } from './pages/performance/performance.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { UsersComponent } from './pages/users/users.component';
import { StaffComponent } from './pages/staff/staff.component';
import { TimetableComponent } from './pages/timetable/timetable.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { ApprovalsComponent } from './pages/approvals/approvals.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { BranchesComponent } from './pages/branches/branches.component';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'update-password', component: UpdatePasswordComponent },

  // Protected routes with layout
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user', 'teacher', 'admin', 'super_admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'classes', component: ClassesComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'timetable', component: TimetableComponent },
      { path: 'grading', component: GradingComponent },
      { path: 'performance', component: PerformanceComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'approvals', component: ApprovalsComponent },
      { path: 'organizations', component: OrganizationsComponent },
      { path: 'branches', component: BranchesComponent },
      { path: 'reports', component: ReportsComponent },
    ],
  },

  // Legacy redirect
  { path: 'dashboard', redirectTo: '/app/dashboard', pathMatch: 'full' },

  // Catch-all
  { path: '**', redirectTo: '/login' },
];
