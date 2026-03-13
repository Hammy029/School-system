import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../shared/services/student.service';
import { ClassService } from '../../shared/services/class.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
})
export class StudentsComponent implements OnInit {
  darkMode = false;
  students: any[] = [];
  classes: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';
  filterClassId = '';
  searchTerm = '';

  form = {
    firstName: '', lastName: '', admissionNumber: '', classId: '',
    dateOfBirth: '', gender: '', parentName: '', parentPhone: '', parentEmail: '',
  };

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.classService.getAll().subscribe({ next: (c: any) => (this.classes = c) });
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.studentService.getAll(this.filterClassId || undefined, this.searchTerm || undefined).subscribe({
      next: (data: any) => { this.students = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = {
        firstName: item.firstName, lastName: item.lastName, admissionNumber: item.admissionNumber,
        classId: item.classId?._id || '', dateOfBirth: item.dateOfBirth ? item.dateOfBirth.substring(0, 10) : '',
        gender: item.gender || '', parentName: item.parentName || '', parentPhone: item.parentPhone || '',
        parentEmail: item.parentEmail || '',
      };
    } else {
      this.editingId = null;
      this.form = { firstName: '', lastName: '', admissionNumber: '', classId: '', dateOfBirth: '', gender: '', parentName: '', parentPhone: '', parentEmail: '' };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  save() {
    const data: any = { ...this.form };
    Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });

    const obs = this.editingId
      ? this.studentService.update(this.editingId, data)
      : this.studentService.create(data);

    obs.subscribe({
      next: () => {
        this.success = this.editingId ? 'Student updated!' : 'Student created!';
        this.closeModal();
        this.loadStudents();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  deleteStudent(id: string) {
    if (!confirm('Delete this student?')) return;
    this.studentService.delete(id).subscribe({
      next: () => { this.success = 'Student deleted!'; this.loadStudents(); setTimeout(() => (this.success = ''), 3000); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
    });
  }
}
