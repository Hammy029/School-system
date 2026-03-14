import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../shared/services/subject.service';
import { ClassService } from '../../shared/services/class.service';
import { StaffService } from '../../shared/services/staff.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
})
export class SubjectsComponent implements OnInit {
  darkMode = false;
  subjects: any[] = [];
  classes: any[] = [];
  teachers: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';
  filterClassId = '';

  form = { name: '', code: '', classId: '', teacher: '' };

  constructor(
    private subjectService: SubjectService,
    private classService: ClassService,
    private staffService: StaffService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.classService.getAll().subscribe({ next: (c: any) => (this.classes = c) });
    this.staffService.getTeachers().subscribe({ next: (t: any) => (this.teachers = t) });
    this.loadSubjects();
  }

  loadSubjects() {
    this.loading = true;
    this.subjectService.getAll(this.filterClassId || undefined).subscribe({
      next: (data: any) => { this.subjects = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = { name: item.name, code: item.code, classId: item.classId?._id || '', teacher: item.teacher?._id || '' };
    } else {
      this.editingId = null;
      this.form = { name: '', code: '', classId: '', teacher: '' };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  save() {
    const data: any = { ...this.form };
    if (!data.classId) delete data.classId;
    if (!data.teacher) delete data.teacher;

    const obs = this.editingId
      ? this.subjectService.update(this.editingId, data)
      : this.subjectService.create(data);

    obs.subscribe({
      next: () => {
        this.success = this.editingId ? 'Subject updated!' : 'Subject created!';
        this.closeModal();
        this.loadSubjects();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  deleteSubject(id: string) {
    if (!confirm('Delete this subject?')) return;
    this.subjectService.delete(id).subscribe({
      next: () => { this.success = 'Subject deleted!'; this.loadSubjects(); setTimeout(() => (this.success = ''), 3000); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
    });
  }
}
