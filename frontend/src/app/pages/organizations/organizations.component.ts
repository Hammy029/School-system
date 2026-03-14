import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../shared/services/organization.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ViewModalComponent } from '../../shared/components/view-modal.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, ViewModalComponent],
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
})
export class OrganizationsComponent implements OnInit {
  darkMode = false;
  organizations: any[] = [];
  filteredOrgs: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';
  searchTerm = '';
  filterStatus = '';

  // Confirm dialog
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  confirmAction: (() => void) | null = null;

  // View modal
  showView = false;
  viewFields: { label: string; value: string }[] = [];

  statuses = ['pending', 'active', 'inactive', 'declined', 'expired'];
  packages = ['basic', 'standard', 'premium'];

  form: any = {
    name: '', email: '', phone: '', address: '',
    package: 'basic', hasMultipleBranches: false, maxBranches: 1,
    allowSelfRegistration: false,
    adminUsername: '', adminEmail: '', adminPhone: '', adminPassword: '',
  };

  constructor(
    private orgService: OrganizationService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.loading = true;
    this.orgService.getAll().subscribe({
      next: (data: any) => { this.organizations = data; this.applyFilters(); this.loading = false; },
      error: () => { this.error = 'Failed to load organizations'; this.loading = false; },
    });
  }

  applyFilters() {
    this.filteredOrgs = this.organizations.filter(o => {
      const matchSearch = !this.searchTerm ||
        o.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.org_code?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || o.subscriptionStatus === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = {
        name: item.name || '', email: item.email || '', phone: item.phone || '',
        address: item.address || '', package: item.package || 'basic',
        hasMultipleBranches: item.hasMultipleBranches || false,
        maxBranches: item.maxBranches || 1,
        allowSelfRegistration: item.allowSelfRegistration || false,
        adminUsername: '', adminEmail: '', adminPhone: '', adminPassword: '',
      };
    } else {
      this.editingId = null;
      this.form = {
        name: '', email: '', phone: '', address: '',
        package: 'basic', hasMultipleBranches: false, maxBranches: 1,
        allowSelfRegistration: false,
        adminUsername: '', adminEmail: '', adminPhone: '', adminPassword: '',
      };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  save() {
    const payload = this.editingId
      ? { name: this.form.name, email: this.form.email, phone: this.form.phone, address: this.form.address, package: this.form.package, hasMultipleBranches: this.form.hasMultipleBranches, maxBranches: this.form.maxBranches, allowSelfRegistration: this.form.allowSelfRegistration }
      : this.form;

    const obs = this.editingId
      ? this.orgService.update(this.editingId, payload)
      : this.orgService.create(payload);

    obs.subscribe({
      next: () => {
        this.success = this.editingId ? 'Organization updated!' : 'Organization created!';
        this.closeModal(); this.loadOrganizations();
        setTimeout(() => (this.success = ''), 5000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  viewOrg(org: any) {
    this.viewFields = [
      { label: 'Name', value: org.name },
      { label: 'Org Code', value: org.org_code },
      { label: 'Email', value: org.email || '-' },
      { label: 'Phone', value: org.phone || '-' },
      { label: 'Address', value: org.address || '-' },
      { label: 'Package', value: org.package },
      { label: 'Status', value: org.subscriptionStatus },
      { label: 'Multi-Branch', value: org.hasMultipleBranches ? 'Yes' : 'No' },
      { label: 'Max Branches', value: String(org.maxBranches) },
      { label: 'Active Branches', value: String(org.activeBranchesCount || 0) },
      { label: 'Self Registration', value: org.allowSelfRegistration ? 'Yes' : 'No' },
    ];
    this.showView = true;
  }

  confirmApprove(org: any) {
    this.confirmTitle = 'Approve Organization';
    this.confirmMessage = `Approve "${org.name}"?`;
    this.confirmType = 'success';
    this.confirmAction = () => {
      this.orgService.approve(org._id).subscribe({ next: () => { this.success = 'Approved!'; this.loadOrganizations(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed to approve') });
    };
    this.showConfirm = true;
  }

  confirmDecline(org: any) {
    this.confirmTitle = 'Decline Organization';
    this.confirmMessage = `Decline "${org.name}"?`;
    this.confirmType = 'warning';
    this.confirmAction = () => {
      this.orgService.decline(org._id).subscribe({ next: () => { this.success = 'Declined!'; this.loadOrganizations(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed to decline') });
    };
    this.showConfirm = true;
  }

  confirmActivate(org: any) {
    this.confirmTitle = 'Activate Organization';
    this.confirmMessage = `Activate "${org.name}"?`;
    this.confirmType = 'success';
    this.confirmAction = () => {
      this.orgService.activate(org._id).subscribe({ next: () => { this.success = 'Activated!'; this.loadOrganizations(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed to activate') });
    };
    this.showConfirm = true;
  }

  confirmDeactivate(org: any) {
    this.confirmTitle = 'Deactivate Organization';
    this.confirmMessage = `Deactivate "${org.name}"?`;
    this.confirmType = 'warning';
    this.confirmAction = () => {
      this.orgService.deactivate(org._id).subscribe({ next: () => { this.success = 'Deactivated!'; this.loadOrganizations(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed to deactivate') });
    };
    this.showConfirm = true;
  }

  confirmDelete(org: any) {
    this.confirmTitle = 'Delete Organization';
    this.confirmMessage = `Delete "${org.name}"? This cannot be undone.`;
    this.confirmType = 'danger';
    this.confirmAction = () => {
      this.orgService.delete(org._id).subscribe({ next: () => { this.success = 'Deleted!'; this.loadOrganizations(); setTimeout(() => (this.success = ''), 3000); }, error: () => (this.error = 'Failed to delete') });
    };
    this.showConfirm = true;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
