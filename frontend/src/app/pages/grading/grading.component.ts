import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradingService } from '../../shared/services/grading.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-grading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grading.component.html',
  styleUrls: ['./grading.component.css'],
})
export class GradingComponent implements OnInit {
  darkMode = false;
  scales: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';

  form = {
    name: '',
    isDefault: false,
    grades: [
      { grade: 'A', minScore: 80, maxScore: 100, remark: 'Excellent', points: 12 },
      { grade: 'A-', minScore: 75, maxScore: 79, remark: 'Very Good', points: 11 },
      { grade: 'B+', minScore: 70, maxScore: 74, remark: 'Good', points: 10 },
      { grade: 'B', minScore: 65, maxScore: 69, remark: 'Good', points: 9 },
      { grade: 'B-', minScore: 60, maxScore: 64, remark: 'Fairly Good', points: 8 },
      { grade: 'C+', minScore: 55, maxScore: 59, remark: 'Average', points: 7 },
      { grade: 'C', minScore: 50, maxScore: 54, remark: 'Average', points: 6 },
      { grade: 'C-', minScore: 45, maxScore: 49, remark: 'Below Average', points: 5 },
      { grade: 'D+', minScore: 40, maxScore: 44, remark: 'Below Average', points: 4 },
      { grade: 'D', minScore: 35, maxScore: 39, remark: 'Poor', points: 3 },
      { grade: 'D-', minScore: 30, maxScore: 34, remark: 'Poor', points: 2 },
      { grade: 'E', minScore: 0, maxScore: 29, remark: 'Very Poor', points: 1 },
    ],
  };

  constructor(private gradingService: GradingService, private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe(d => (this.darkMode = d));
    this.loadScales();
  }

  loadScales() {
    this.loading = true;
    this.gradingService.getAll().subscribe({
      next: data => { this.scales = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = {
        name: item.name,
        isDefault: item.isDefault,
        grades: item.grades.map((g: any) => ({ ...g })),
      };
    } else {
      this.editingId = null;
      this.form = {
        name: '',
        isDefault: false,
        grades: [
          { grade: 'A', minScore: 80, maxScore: 100, remark: 'Excellent', points: 12 },
          { grade: 'A-', minScore: 75, maxScore: 79, remark: 'Very Good', points: 11 },
          { grade: 'B+', minScore: 70, maxScore: 74, remark: 'Good', points: 10 },
          { grade: 'B', minScore: 65, maxScore: 69, remark: 'Good', points: 9 },
          { grade: 'B-', minScore: 60, maxScore: 64, remark: 'Fairly Good', points: 8 },
          { grade: 'C+', minScore: 55, maxScore: 59, remark: 'Average', points: 7 },
          { grade: 'C', minScore: 50, maxScore: 54, remark: 'Average', points: 6 },
          { grade: 'C-', minScore: 45, maxScore: 49, remark: 'Below Average', points: 5 },
          { grade: 'D+', minScore: 40, maxScore: 44, remark: 'Below Average', points: 4 },
          { grade: 'D', minScore: 35, maxScore: 39, remark: 'Poor', points: 3 },
          { grade: 'D-', minScore: 30, maxScore: 34, remark: 'Poor', points: 2 },
          { grade: 'E', minScore: 0, maxScore: 29, remark: 'Very Poor', points: 1 },
        ],
      };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  addGrade() {
    this.form.grades.push({ grade: '', minScore: 0, maxScore: 0, remark: '', points: 0 });
  }

  removeGrade(index: number) {
    this.form.grades.splice(index, 1);
  }

  save() {
    const obs = this.editingId
      ? this.gradingService.update(this.editingId, this.form)
      : this.gradingService.create(this.form);

    obs.subscribe({
      next: () => {
        this.success = this.editingId ? 'Grading scale updated!' : 'Grading scale created!';
        this.closeModal();
        this.loadScales();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  deleteScale(id: string) {
    if (!confirm('Delete this grading scale?')) return;
    this.gradingService.delete(id).subscribe({
      next: () => { this.success = 'Scale deleted!'; this.loadScales(); setTimeout(() => (this.success = ''), 3000); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
    });
  }
}
