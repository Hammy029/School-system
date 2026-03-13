import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../shared/services/performance.service';
import { ClassService } from '../../shared/services/class.service';
import { SubjectService } from '../../shared/services/subject.service';
import { StudentService } from '../../shared/services/student.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css'],
})
export class PerformanceComponent implements OnInit {
  darkMode = false;
  classes: any[] = [];
  subjects: any[] = [];
  students: any[] = [];
  performances: any[] = [];
  loading = false;
  saving = false;
  error = '';
  success = '';
  mode: 'view' | 'bulk' = 'view';

  filters = {
    classId: '',
    subjectId: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
    examType: 'End-Term',
  };

  terms = ['Term 1', 'Term 2', 'Term 3'];
  examTypes = ['CAT 1', 'CAT 2', 'Mid-Term', 'End-Term', 'Final'];

  bulkScores: { studentId: string; studentName: string; admNo: string; score: number | null }[] = [];

  constructor(
    private performanceService: PerformanceService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.classService.getAll().subscribe({ next: (c: any) => (this.classes = c) });
    this.subjectService.getAll().subscribe({ next: (s: any) => (this.subjects = s) });
  }

  onClassChange() {
    if (this.filters.classId) {
      this.studentService.getByClass(this.filters.classId).subscribe({
        next: (s: any) => {
          this.students = s;
          this.bulkScores = s.map((stu: any) => ({
            studentId: stu._id,
            studentName: `${stu.firstName} ${stu.lastName}`,
            admNo: stu.admissionNumber,
            score: null,
          }));
        },
      });
      this.subjectService.getAll(this.filters.classId).subscribe({ next: (s: any) => { if (s.length > 0) this.subjects = s; } });
    }
  }

  loadPerformances() {
    this.loading = true;
    this.performanceService.getAll(this.filters).subscribe({
      next: (data: any) => {
        this.performances = data;
        this.loading = false;
        // Pre-fill bulk scores if data exists
        if (this.mode === 'bulk' && data.length > 0) {
          for (const p of data) {
            const existing = this.bulkScores.find(b => b.studentId === (p.studentId as any)?._id);
            if (existing) existing.score = p.score;
          }
        }
      },
      error: () => { this.loading = false; },
    });
  }

  switchToBulk() {
    this.mode = 'bulk';
    if (this.filters.classId) {
      this.loadPerformances();
    }
  }

  switchToView() {
    this.mode = 'view';
    this.loadPerformances();
  }

  saveBulkScores() {
    if (!this.filters.classId || !this.filters.subjectId) {
      this.error = 'Select a class and subject';
      return;
    }
    const scores = this.bulkScores
      .filter(b => b.score !== null && b.score !== undefined)
      .map(b => ({ studentId: b.studentId, score: b.score! }));

    if (scores.length === 0) {
      this.error = 'Enter at least one score';
      return;
    }

    this.saving = true;
    this.error = '';
    this.performanceService.bulkCreate({
      subjectId: this.filters.subjectId,
      classId: this.filters.classId,
      academicYear: this.filters.academicYear,
      term: this.filters.term,
      examType: this.filters.examType,
      scores,
    }).subscribe({
      next: (result: any) => {
        this.success = `Saved! ${result.created} created, ${result.updated} updated.`;
        this.saving = false;
        setTimeout(() => (this.success = ''), 4000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to save scores';
        this.saving = false;
      },
    });
  }

  deletePerformance(id: string) {
    if (!confirm('Delete this record?')) return;
    this.performanceService.delete(id).subscribe({
      next: () => { this.loadPerformances(); },
    });
  }
}
