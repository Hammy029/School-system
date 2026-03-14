import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../shared/services/payment.service';
import { StudentService } from '../../shared/services/student.service';
import { ClassService } from '../../shared/services/class.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ViewModalComponent } from '../../shared/components/view-modal.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, ViewModalComponent],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit {
  darkMode = false;
  activeTab: 'payments' | 'fees' | 'balance' = 'payments';

  // Payments
  payments: any[] = [];
  students: any[] = [];
  classes: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';

  filterStudentId = '';
  filterStatus = '';

  form: any = {
    studentId: '', academicYear: '', term: '', feeType: 'tuition',
    amount: 0, amountPaid: 0, receiptNumber: '', paymentMethod: 'cash',
    referenceNumber: '', paymentDate: '', notes: '',
  };

  feeTypes = ['tuition', 'transport', 'boarding', 'uniform', 'books', 'exam', 'other'];
  paymentMethods = ['cash', 'bank_transfer', 'mpesa', 'cheque', 'other'];
  paymentStatuses = ['pending', 'partial', 'completed', 'refunded'];

  // Fee Structure
  fees: any[] = [];
  showFeeModal = false;
  editingFeeId: string | null = null;
  feeForm: any = { classId: '', academicYear: '', term: '', feeType: 'tuition', amount: 0, description: '' };

  // Balance
  balanceStudentId = '';
  balanceYear = '';
  balanceTerm = '';
  balanceResult: any = null;

  // View modal
  showViewModal = false;
  viewFields: { label: string; value: string }[] = [];

  // Confirm dialog
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  pendingDeleteId = '';
  pendingDeleteType: 'payment' | 'fee' = 'payment';

  constructor(
    private paymentService: PaymentService,
    private studentService: StudentService,
    private classService: ClassService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.studentService.getAll().subscribe({ next: (s: any) => (this.students = s) });
    this.classService.getAll().subscribe({ next: (c: any) => (this.classes = c) });
    this.loadPayments();
    this.loadFees();
  }

  loadPayments() {
    this.loading = true;
    const filters: any = {};
    if (this.filterStudentId) filters.studentId = this.filterStudentId;
    if (this.filterStatus) filters.status = this.filterStatus;
    this.paymentService.getAll(filters).subscribe({
      next: (data: any) => { this.payments = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  loadFees() {
    this.paymentService.getAllFees().subscribe({
      next: (data: any) => (this.fees = data),
    });
  }

  // Payment CRUD
  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = {
        studentId: item.studentId?._id || item.studentId || '',
        academicYear: item.academicYear || '',
        term: item.term || '',
        feeType: item.feeType || 'tuition',
        amount: item.amount || 0,
        amountPaid: item.amountPaid || 0,
        receiptNumber: item.receiptNumber || '',
        paymentMethod: item.paymentMethod || 'cash',
        referenceNumber: item.referenceNumber || '',
        paymentDate: item.paymentDate ? item.paymentDate.substring(0, 10) : '',
        notes: item.notes || '',
      };
    } else {
      this.editingId = null;
      this.form = {
        studentId: '', academicYear: '', term: '', feeType: 'tuition',
        amount: 0, amountPaid: 0, receiptNumber: '', paymentMethod: 'cash',
        referenceNumber: '', paymentDate: '', notes: '',
      };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  save() {
    const data = { ...this.form };
    if (!data.studentId) { this.error = 'Student is required'; return; }

    const obs = this.editingId
      ? this.paymentService.update(this.editingId, data)
      : this.paymentService.create(data);

    obs.subscribe({
      next: () => {
        this.success = this.editingId ? 'Payment updated!' : 'Payment recorded!';
        this.closeModal();
        this.loadPayments();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  viewPayment(item: any) {
    this.viewFields = [
      { label: 'Student', value: item.studentId?.name || item.studentId?.admissionNumber || '-' },
      { label: 'Academic Year', value: item.academicYear },
      { label: 'Term', value: item.term },
      { label: 'Fee Type', value: item.feeType },
      { label: 'Amount', value: item.amount?.toLocaleString() },
      { label: 'Amount Paid', value: item.amountPaid?.toLocaleString() },
      { label: 'Balance', value: ((item.amount || 0) - (item.amountPaid || 0)).toLocaleString() },
      { label: 'Receipt No.', value: item.receiptNumber || '-' },
      { label: 'Payment Method', value: item.paymentMethod || '-' },
      { label: 'Reference No.', value: item.referenceNumber || '-' },
      { label: 'Payment Date', value: item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : '-' },
      { label: 'Status', value: item.status || '-' },
      { label: 'Notes', value: item.notes || '-' },
    ];
    this.showViewModal = true;
  }

  confirmDeletePayment(id: string) {
    this.pendingDeleteId = id;
    this.pendingDeleteType = 'payment';
    this.confirmTitle = 'Delete Payment';
    this.confirmMessage = 'Are you sure you want to delete this payment record?';
    this.confirmType = 'danger';
    this.showConfirmDialog = true;
  }

  // Fee Structure CRUD
  openFeeModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingFeeId = item._id;
      this.feeForm = {
        classId: item.classId?._id || item.classId || '',
        academicYear: item.academicYear || '',
        term: item.term || '',
        feeType: item.feeType || 'tuition',
        amount: item.amount || 0,
        description: item.description || '',
      };
    } else {
      this.editingFeeId = null;
      this.feeForm = { classId: '', academicYear: '', term: '', feeType: 'tuition', amount: 0, description: '' };
    }
    this.showFeeModal = true;
  }

  closeFeeModal() { this.showFeeModal = false; this.editingFeeId = null; }

  saveFee() {
    const data = { ...this.feeForm };
    if (!data.classId) delete data.classId;

    const obs = this.editingFeeId
      ? this.paymentService.updateFee(this.editingFeeId, data)
      : this.paymentService.createFee(data);

    obs.subscribe({
      next: () => {
        this.success = this.editingFeeId ? 'Fee structure updated!' : 'Fee structure created!';
        this.closeFeeModal();
        this.loadFees();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  confirmDeleteFee(id: string) {
    this.pendingDeleteId = id;
    this.pendingDeleteType = 'fee';
    this.confirmTitle = 'Delete Fee Structure';
    this.confirmMessage = 'Are you sure you want to delete this fee structure?';
    this.confirmType = 'danger';
    this.showConfirmDialog = true;
  }

  onConfirmed() {
    this.showConfirmDialog = false;
    if (this.pendingDeleteType === 'payment') {
      this.paymentService.delete(this.pendingDeleteId).subscribe({
        next: () => { this.success = 'Payment deleted!'; this.loadPayments(); setTimeout(() => (this.success = ''), 3000); },
        error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
      });
    } else {
      this.paymentService.deleteFee(this.pendingDeleteId).subscribe({
        next: () => { this.success = 'Fee structure deleted!'; this.loadFees(); setTimeout(() => (this.success = ''), 3000); },
        error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
      });
    }
  }

  onCancelled() { this.showConfirmDialog = false; }

  // Balance
  checkBalance() {
    if (!this.balanceStudentId || !this.balanceYear || !this.balanceTerm) {
      this.error = 'Please fill in all balance query fields';
      return;
    }
    this.paymentService.getBalance(this.balanceStudentId, this.balanceYear, this.balanceTerm).subscribe({
      next: (data: any) => (this.balanceResult = data),
      error: (err: any) => { this.error = err.error?.message || 'Failed to fetch balance'; },
    });
  }

  getStudentName(studentId: any): string {
    if (typeof studentId === 'object') return studentId?.name || studentId?.admissionNumber || '-';
    const s = this.students.find((st: any) => st._id === studentId);
    return s ? s.name : '-';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
