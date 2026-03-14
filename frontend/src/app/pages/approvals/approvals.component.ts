import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../shared/services/approval.service';
import { ThemeService } from '../../shared/services/theme.service';
import { AuthService } from '../../authentication/core/auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ViewModalComponent } from '../../shared/components/view-modal.component';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, ViewModalComponent],
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css'],
})
export class ApprovalsComponent implements OnInit {
  darkMode = false;
  user: any;
  activeTab: 'pending' | 'all' | 'submit' = 'pending';

  approvals: any[] = [];
  pendingApprovals: any[] = [];
  loading = false;
  success = '';
  error = '';

  // Submit form
  submitForm: any = {
    type: 'results',
    title: '',
    description: '',
    steps: [{ role: 'admin' }],
    metadata: {},
  };
  approvalTypes = ['results', 'report', 'fee_waiver', 'student_transfer', 'other'];
  approvalRoles = ['teacher', 'admin', 'super_admin'];

  // Process form
  showProcessModal = false;
  processItem: any = null;
  processAction: 'approved' | 'rejected' = 'approved';
  processComment = '';

  // View
  showViewModal = false;
  viewFields: { label: string; value: string }[] = [];

  // Confirm
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  pendingDeleteId = '';

  constructor(
    private approvalService: ApprovalService,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.loadAll();
    this.loadPending();
  }

  loadAll() {
    this.loading = true;
    this.approvalService.getAll().subscribe({
      next: (data: any) => { this.approvals = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  loadPending() {
    this.approvalService.getPending().subscribe({
      next: (data: any) => (this.pendingApprovals = data),
    });
  }

  // Submit new approval
  addStep() {
    this.submitForm.steps.push({ role: 'admin' });
  }

  removeStep(index: number) {
    if (this.submitForm.steps.length > 1) {
      this.submitForm.steps.splice(index, 1);
    }
  }

  submitApproval() {
    if (!this.submitForm.title) {
      this.error = 'Title is required';
      return;
    }
    this.error = '';
    this.approvalService.create(this.submitForm).subscribe({
      next: () => {
        this.success = 'Approval request submitted!';
        this.activeTab = 'all';
        this.loadAll();
        this.loadPending();
        this.submitForm = { type: 'results', title: '', description: '', steps: [{ role: 'admin' }], metadata: {} };
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to submit'; },
    });
  }

  // Process approval
  openProcessModal(item: any) {
    this.processItem = item;
    this.processAction = 'approved';
    this.processComment = '';
    this.showProcessModal = true;
  }

  processApproval() {
    this.approvalService.processStep(this.processItem._id, {
      action: this.processAction,
      comment: this.processComment,
    }).subscribe({
      next: () => {
        this.success = `Approval ${this.processAction}!`;
        this.showProcessModal = false;
        this.loadAll();
        this.loadPending();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to process'; },
    });
  }

  // View details
  viewApproval(item: any) {
    this.viewFields = [
      { label: 'Type', value: item.type },
      { label: 'Title', value: item.title },
      { label: 'Description', value: item.description || '-' },
      { label: 'Submitted By', value: item.submittedBy?.username || '-' },
      { label: 'Status', value: item.status },
      { label: 'Current Step', value: `${item.currentStep + 1} of ${item.steps?.length || 0}` },
      { label: 'Created', value: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' },
    ];
    this.showViewModal = true;
  }

  // Delete
  confirmDelete(id: string) {
    this.pendingDeleteId = id;
    this.confirmTitle = 'Delete Approval';
    this.confirmMessage = 'Are you sure you want to delete this approval request?';
    this.confirmType = 'danger';
    this.showConfirmDialog = true;
  }

  onConfirmed() {
    this.showConfirmDialog = false;
    this.approvalService.delete(this.pendingDeleteId).subscribe({
      next: () => {
        this.success = 'Approval deleted!';
        this.loadAll();
        this.loadPending();
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; },
    });
  }

  onCancelled() { this.showConfirmDialog = false; }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStepStatusClass(status: string): string {
    switch (status) {
      case 'approved': return this.darkMode ? 'text-green-400' : 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': return this.darkMode ? 'text-yellow-400' : 'text-yellow-600';
      default: return '';
    }
  }
}
