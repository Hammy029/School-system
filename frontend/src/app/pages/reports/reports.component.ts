import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
export class ReportsComponent implements OnInit, AfterViewChecked {
  darkMode = false;
  classes: any[] = [];
  students: any[] = [];
  loading = false;
  error = '';
  reportType: 'student' | 'class' = 'student';
  private chartDrawn = false;

  filters = {
    classId: '',
    studentId: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
  };

  terms = ['Term 1', 'Term 2', 'Term 3'];
  studentReport: any = null;
  classReport: any = null;

  @ViewChild('perfChart') perfChartRef!: ElementRef<HTMLCanvasElement>;

  chartColors = [
    '#16a34a', '#dc2626', '#2563eb', '#d97706', '#7c3aed',
    '#0891b2', '#be185d', '#65a30d', '#ea580c', '#4f46e5',
  ];

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

  ngAfterViewChecked() {
    if (this.studentReport && this.perfChartRef && !this.chartDrawn) {
      this.drawChart();
      this.chartDrawn = true;
    }
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
    this.chartDrawn = false;
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

  getScoreColorRaw(score: number): string {
    if (score >= 70) return '#16a34a';
    if (score >= 50) return '#ca8a04';
    return '#dc2626';
  }

  getGradeBg(score: number): string {
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }

  getGrade(score: number): string {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  }

  getRemark(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Below Avg';
    return 'Poor';
  }

  getUniqueExamTypes(): string[] {
    if (!this.studentReport?.subjects) return [];
    const types = new Set<string>();
    for (const subj of this.studentReport.subjects) {
      for (const exam of subj.exams) {
        types.add(exam.examType);
      }
    }
    return Array.from(types);
  }

  getExamScore(subj: any, examType: string): number | null {
    const exam = subj.exams.find((e: any) => e.examType === examType);
    return exam ? exam.score : null;
  }

  private drawChart() {
    const canvas = this.perfChartRef?.nativeElement;
    if (!canvas || !this.studentReport?.subjects?.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const subjects = this.studentReport.subjects;
    const examTypes = this.getUniqueExamTypes();
    if (examTypes.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 60, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines and Y-axis labels
    ctx.strokeStyle = '#e5e7eb';
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartH / 5) * i;
      const val = 100 - i * 20;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(val.toString(), padding.left - 8, y + 4);
    }

    // X-axis labels (subjects)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#374151';
    ctx.font = '10px sans-serif';
    const xStep = subjects.length > 1 ? chartW / (subjects.length - 1) : chartW;
    for (let i = 0; i < subjects.length; i++) {
      const x = padding.left + (subjects.length > 1 ? xStep * i : chartW / 2);
      const label = subjects[i].subjectCode || subjects[i].subjectName.substring(0, 6);
      ctx.save();
      ctx.translate(x, h - padding.bottom + 14);
      ctx.rotate(-0.4);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    // Draw lines for each exam type
    for (let eIdx = 0; eIdx < examTypes.length; eIdx++) {
      const color = this.chartColors[eIdx % this.chartColors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let started = false;

      for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
        const score = this.getExamScore(subjects[sIdx], examTypes[eIdx]);
        if (score === null) continue;

        const x = padding.left + (subjects.length > 1 ? xStep * sIdx : chartW / 2);
        const y = padding.top + chartH - (score / 100) * chartH;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw dots
      ctx.fillStyle = color;
      for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
        const score = this.getExamScore(subjects[sIdx], examTypes[eIdx]);
        if (score === null) continue;
        const x = padding.left + (subjects.length > 1 ? xStep * sIdx : chartW / 2);
        const y = padding.top + chartH - (score / 100) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw average line
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    let avgStarted = false;
    for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
      const avg = subjects[sIdx].average;
      const x = padding.left + (subjects.length > 1 ? xStep * sIdx : chartW / 2);
      const y = padding.top + chartH - (avg / 100) * chartH;
      if (!avgStarted) { ctx.moveTo(x, y); avgStarted = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
