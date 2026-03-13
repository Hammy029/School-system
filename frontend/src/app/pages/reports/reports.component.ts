import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../shared/services/performance.service';
import { ClassService } from '../../shared/services/class.service';
import { StudentService } from '../../shared/services/student.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  darkMode = false;
  classes: any[] = [];
  students: any[] = [];
  loading = false;
  error = '';
  reportType: 'student' | 'class' = 'student';

  filters = {
    classId: '',
    studentId: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
  };

  terms = ['Term 1', 'Term 2', 'Term 3'];
  studentReport: any = null;
  classReport: any = null;

  constructor(
    private performanceService: PerformanceService,
    private classService: ClassService,
    private studentService: StudentService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.classService.getAll().subscribe({ next: (c: any) => (this.classes = c) });
  }

  onClassChange() {
    if (this.filters.classId) {
      this.studentService.getByClass(this.filters.classId).subscribe({
        next: (s: any) => (this.students = s),
      });
    }
  }

  generateReport() {
    this.error = '';
    this.studentReport = null;
    this.classReport = null;
    this.loading = true;

    if (this.reportType === 'student') {
      if (!this.filters.studentId) {
        this.error = 'Please select a student';
        this.loading = false;
        return;
      }
      this.performanceService.getStudentReport(this.filters.studentId, this.filters.academicYear, this.filters.term).subscribe({
        next: (data: any) => { this.studentReport = data; this.loading = false; },
        error: (err: any) => { this.error = err.error?.message || 'Failed to generate report'; this.loading = false; },
      });
    } else {
      if (!this.filters.classId) {
        this.error = 'Please select a class';
        this.loading = false;
        return;
      }
      this.performanceService.getClassReport(this.filters.classId, this.filters.academicYear, this.filters.term).subscribe({
        next: (data: any) => { this.classReport = data; this.loading = false; },
        error: (err: any) => { this.error = err.error?.message || 'Failed to generate report'; this.loading = false; },
      });
    }
  }

  printReport() {
    window.print();
  }

  getScoreColor(score: number): string {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getGradeBg(score: number): string {
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }
}
