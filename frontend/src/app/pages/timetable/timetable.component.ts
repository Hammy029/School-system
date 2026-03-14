import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService } from '../../shared/services/timetable.service';
import { ClassService } from '../../shared/services/class.service';
import { SubjectService } from '../../shared/services/subject.service';
import { StaffService } from '../../shared/services/staff.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit {
  darkMode = false;
  timetables: any[] = [];
  classes: any[] = [];
  subjects: any[] = [];
  teachers: any[] = [];
  loading = false;
  success = '';
  error = '';

  // Filters
  filterClassId = '';
  filterAcademicYear = '';
  filterTerm = '';

  // Tabs
  activeTab: 'view' | 'generate' = 'view';

  // Generate form
  generateForm = {
    classId: '',
    subjectIds: [] as string[],
    academicYear: '',
    term: '',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '08:00',
    endTime: '16:00',
    slotDuration: 40,
    breakTime: '10:00',
    breakDuration: 30,
  };

  allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  availableSubjects: any[] = [];

  // View modal
  showViewModal = false;
  viewItem: any = null;
  viewFields: { label: string; value: string }[] = [];

  // Confirm dialog
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  pendingDeleteId = '';

  // Display
  displayTimetable: any = null;
  timeSlots: string[] = [];
  displayDays: string[] = [];

  constructor(
    private timetableService: TimetableService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private staffService: StaffService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.classService.getAll().subscribe({ next: (c: any) => (this.classes = c) });
    this.staffService.getTeachers().subscribe({ next: (t: any) => (this.teachers = t) });
    this.loadTimetables();
  }

  loadTimetables() {
    this.loading = true;
    this.timetableService
      .getAll(this.filterClassId || undefined, this.filterAcademicYear || undefined, this.filterTerm || undefined)
      .subscribe({
        next: (data: any) => {
          this.timetables = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onGenerateClassChange() {
    if (this.generateForm.classId) {
      this.subjectService.getAll(this.generateForm.classId).subscribe({
        next: (s: any) => (this.availableSubjects = s),
      });
    } else {
      this.availableSubjects = [];
    }
  }

  toggleSubject(subjectId: string) {
    const idx = this.generateForm.subjectIds.indexOf(subjectId);
    if (idx > -1) {
      this.generateForm.subjectIds.splice(idx, 1);
    } else {
      this.generateForm.subjectIds.push(subjectId);
    }
  }

  isSubjectSelected(subjectId: string): boolean {
    return this.generateForm.subjectIds.includes(subjectId);
  }

  toggleDay(day: string) {
    const idx = this.generateForm.days.indexOf(day);
    if (idx > -1) {
      this.generateForm.days.splice(idx, 1);
    } else {
      this.generateForm.days.push(day);
    }
  }

  isDaySelected(day: string): boolean {
    return this.generateForm.days.includes(day);
  }

  generate() {
    if (!this.generateForm.classId || this.generateForm.subjectIds.length === 0) {
      this.error = 'Please select a class and at least one subject';
      return;
    }
    this.error = '';
    this.timetableService.generate(this.generateForm).subscribe({
      next: () => {
        this.success = 'Timetable generated successfully!';
        this.activeTab = 'view';
        this.filterClassId = this.generateForm.classId;
        this.loadTimetables();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to generate timetable';
      },
    });
  }

  viewTimetable(item: any) {
    this.displayTimetable = item;
    this.buildTimetableGrid(item);
  }

  buildTimetableGrid(tt: any) {
    if (!tt?.slots?.length) return;
    const uniqueTimes = new Set<string>();
    const uniqueDays = new Set<string>();
    tt.slots.forEach((s: any) => {
      uniqueTimes.add(s.startTime);
      uniqueDays.add(s.day);
    });
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.displayDays = dayOrder.filter(d => uniqueDays.has(d));
    this.timeSlots = Array.from(uniqueTimes).sort();
  }

  getSlot(day: string, time: string) {
    if (!this.displayTimetable?.slots) return null;
    return this.displayTimetable.slots.find((s: any) => s.day === day && s.startTime === time);
  }

  confirmDelete(id: string) {
    this.pendingDeleteId = id;
    this.confirmTitle = 'Delete Timetable';
    this.confirmMessage = 'Are you sure you want to delete this timetable? This action cannot be undone.';
    this.confirmType = 'danger';
    this.showConfirmDialog = true;
  }

  onConfirmed() {
    this.showConfirmDialog = false;
    this.timetableService.delete(this.pendingDeleteId).subscribe({
      next: () => {
        this.success = 'Timetable deleted!';
        if (this.displayTimetable?._id === this.pendingDeleteId) {
          this.displayTimetable = null;
        }
        this.loadTimetables();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to delete';
      },
    });
  }

  onCancelled() {
    this.showConfirmDialog = false;
  }

  getClassName(classId: string): string {
    const cls = this.classes.find((c: any) => c._id === classId);
    return cls ? `${cls.name}${cls.section ? ' (' + cls.section + ')' : ''}` : classId;
  }
}
