import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../shared/services/branch.service';
import { OrganizationService } from '../../shared/services/organization.service';
import { OrgContextService } from '../../shared/services/org-context.service';
import { ThemeService } from '../../shared/services/theme.service';
import { AuthService } from '../../authentication/core/auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ViewModalComponent } from '../../shared/components/view-modal.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, ViewModalComponent],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css'],
})
export class BranchesComponent implements OnInit {
  darkMode = false;
  branches: any[] = [];
  filteredBranches: any[] = [];
  organizations: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';
  searchTerm = '';
  filterStatus = '';
  selectedOrgId = '';
  userRole = '';

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  confirmAction: (() => void) | null = null;

  showView = false;
  viewFields: { label: string; value: string }[] = [];

  statuses = ['active', 'inactive', 'suspended'];
  types = ['main', 'branch'];

  form: any = { name: '', description: '', type: 'branch', status: 'active', phone: '', email: '', address: '' };

  constructor(
    private branchService: BranchService,
    private orgService: OrganizationService,
    private orgContext: OrgContextService,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    const user = this.authService.getUser();
    this.userRole = user?.role || '';
    this.selectedOrgId = this.orgContext.organizationId || '';

    if (this.userRole === 'super_admin') {
      this.orgService.getAll().subscribe({ next: (orgs: any[]) => { this.organizations = orgs; if (!this.selectedOrgId && orgs.length) { this.selectedOrgId = orgs[0]._id; } this.loadBranches(); } });
    } else {
      this.loadBranches();
    }
  }

  loadBranches() {
    if (!this.selectedOrgId) return;
    this.loading = true;
    this.branchService.getByOrganization(this.selectedOrgId).subscribe({
      next: (data: any) => { this.branches = data; this.applyFilters(); this.loading = false; },
      error: () => { this.error = 'Failed to load branches'; this.loading = false; },
    });
  }

  onOrgChange() { this.loadBranches(); }

  applyFilters() {
    this.filteredBranches = this.branches.filter(b => {
      const matchSearch = !this.searchTerm || b.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || b.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || b.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = { name: item.name || '', description: item.description || '', type: item.type || 'branch', status: item.status || 'active', phone: item.phone || '', email: item.email || '', address: item.address || '' };
    } else {
      this.editingId = null;
      this.form = { name: '', description: '', type: 'branch', status: 'active', phone: '', email: '', address: '' };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  save() {
    const obs = this.editingId
      ? this.branchService.update(this.selectedOrgId, this.editingId, this.form)
      : this.branchService.create(this.selectedOrgId, this.form);

    obs.subscribe({
      next: () => { this.success = this.editingId ? 'Branch updated!' : 'Branch created!'; this.closeModal(); this.loadBranches(); setTimeout(() => (this.success = ''), 5000); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  viewBranch(b: any) {
    this.viewFields = [
      { label: 'Name', value: b.name },
      { label: 'Type', value: b.type },
      { label: 'Status', value: b.status },
      { label: 'Phone', value: b.phone || '-' },
      { label: 'Email', value: b.email || '-' },
      { label: 'Address', value: b.address || '-' },
      { label: 'Description', value: b.description || '-' },
      { label: 'Main Branch', value: b.isMainBranch ? 'Yes' : 'No' },
      { label: 'Operational', value: b.isOperational ? 'Yes' : 'No' },
      { label: 'Organization', value: b.organizationId?.name || '-' },
    ];
    this.showView = true;
  }

  confirmSetMain(b: any) {
    this.confirmTitle = 'Set Main Branch';
    this.confirmMessage = `Set "${b.name}" as the main branch?`;
    this.confirmType = 'info';
    this.confirmAction = () => {
      this.branchService.setMain(this.selectedOrgId, b._id).subscribe({ next: () => { this.success = 'Main branch updated!'; this.loadBranches(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed') });
    };
    this.showConfirm = true;
  }

  confirmStatusChange(b: any, status: string) {
    this.confirmTitle = `${status === 'active' ? 'Activate' : status === 'inactive' ? 'Deactivate' : 'Suspend'} Branch`;
    this.confirmMessage = `Set "${b.name}" to ${status}?`;
    this.confirmType = status === 'active' ? 'success' : 'warning';
    this.confirmAction = () => {
      this.branchService.updateStatus(this.selectedOrgId, b._id, status).subscribe({ next: () => { this.success = 'Status updated!'; this.loadBranches(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed') });
    };
    this.showConfirm = true;
  }

  confirmDelete(b: any) {
    this.confirmTitle = 'Delete Branch';
    this.confirmMessage = `Delete "${b.name}"? This cannot be undone.`;
    this.confirmType = 'danger';
    this.confirmAction = () => {
      this.branchService.delete(this.selectedOrgId, b._id).subscribe({ next: () => { this.success = 'Deleted!'; this.loadBranches(); setTimeout(() => (this.success = ''), 3000); }, error: (err: any) => (this.error = err.error?.message || 'Failed') });
    };
    this.showConfirm = true;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = { active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
