import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../shared/services/class.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css'],
})
export class ClassesComponent implements OnInit {
  darkMode = false;
  classes: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';

  form = { name: '', section: '', academicYear: new Date().getFullYear().toString(), teacher: '' };

  constructor(private classService: ClassService, private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe(d => (this.darkMode = d));
    this.loadClasses();
  }

  loadClasses() {
    this.loading = true;
    this.classService.getAll().subscribe({
      next: data => { this.classes = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openModal(item?: any) {
    this.error = '';
    this.success = '';
    if (item) {
      this.editingId = item._id;
      this.form = { name: item.name, section: item.section || '', academicYear: item.academicYear, teacher: item.teacher?._id || '' };
    } else {
      this.editingId = null;
      this.form = { name: '', section: '', academicYear: new Date().getFullYear().toString(), teacher: '' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  save() {
    const data: any = { ...this.form };
    if (!data.teacher) delete data.teacher;
    if (!data.section) delete data.section;

    const obs = this.editingId
      ? this.classService.update(this.editingId, data)
      : this.classService.create(data);

    obs.subscribe({
      next: () => {
        this.success = this.editingId ? 'Class updated!' : 'Class created!';
        this.closeModal();
        this.loadClasses();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to save class';
      },
    });
  }

  deleteClass(id: string) {
    if (!confirm('Delete this class?')) return;
    this.classService.delete(id).subscribe({
      next: () => {
        this.success = 'Class deleted!';
        this.loadClasses();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
    });
  }
}
