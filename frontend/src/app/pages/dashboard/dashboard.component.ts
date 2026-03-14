import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../authentication/core/auth/auth.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ClassService } from '../../shared/services/class.service';
import { StudentService } from '../../shared/services/student.service';
import { SubjectService } from '../../shared/services/subject.service';
import { StaffService } from '../../shared/services/staff.service';
import { ApprovalService } from '../../shared/services/approval.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterLink],
})
export class DashboardComponent implements OnInit {
  user: any;
  darkMode = false;
  stats = { classes: 0, students: 0, subjects: 0, staff: 0, pendingApprovals: 0 };

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private classService: ClassService,
    private studentService: StudentService,
    private subjectService: SubjectService,
    private staffService: StaffService,
    private approvalService: ApprovalService,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.themeService.darkMode$.subscribe(d => (this.darkMode = d));
    this.classService.getCount().subscribe({ next: c => (this.stats.classes = c), error: () => {} });
    this.studentService.getCount().subscribe({ next: c => (this.stats.students = c), error: () => {} });
    this.subjectService.getCount().subscribe({ next: c => (this.stats.subjects = c), error: () => {} });
    this.staffService.getCount().subscribe({ next: c => (this.stats.staff = c), error: () => {} });
    this.approvalService.getPending().subscribe({ next: (data: any[]) => (this.stats.pendingApprovals = data.length), error: () => {} });
  }
}
