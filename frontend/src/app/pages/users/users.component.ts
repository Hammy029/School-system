import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { ThemeService } from '../../shared/services/theme.service';
import { AuthService } from '../../authentication/core/auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ViewModalComponent } from '../../shared/components/view-modal.component';
import { PermissionsModalComponent } from '../../shared/components/permissions-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, ViewModalComponent, PermissionsModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  darkMode = false;
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  showModal = false;
  editingId: string | null = null;
  error = '';
  success = '';
  searchTerm = '';
  filterRole = '';
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

  // Permissions modal
  showPermissions = false;
  selectedUserId = '';
  selectedUserName = '';
  selectedUserRole = '';

  roles = ['user', 'teacher', 'admin', 'super_admin'];
  form = { username: '', email: '', phone_no: '', role: 'user' };

  constructor(
    private userService: UserService,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe((d: boolean) => (this.darkMode = d));
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data: any) => { this.users = data; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole = !this.filterRole || u.role === this.filterRole;
      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'approved' && u.isApproved) ||
        (this.filterStatus === 'pending' && !u.isApproved);
      return matchSearch && matchRole && matchStatus;
    });
  }

  openModal(item?: any) {
    this.error = '';
    if (item) {
      this.editingId = item._id;
      this.form = { username: item.username, email: item.email, phone_no: item.phone_no || '', role: item.role };
    } else {
      this.editingId = null;
      this.form = { username: '', email: '', phone_no: '', role: 'user' };
    }
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.editingId = null; }

  save() {
    const obs = this.editingId
      ? this.userService.update(this.editingId, this.form)
      : this.userService.create(this.form);

    obs.subscribe({
      next: (res: any) => {
        this.success = this.editingId ? 'User updated!' : `User created! ${res.temporaryPassword ? 'Temp password: ' + res.temporaryPassword : ''}`;
        this.closeModal();
        this.loadUsers();
        setTimeout(() => (this.success = ''), 5000);
      },
      error: (err: any) => { this.error = err.error?.message || 'Failed to save'; },
    });
  }

  viewUser(user: any) {
    this.viewFields = [
      { label: 'Username', value: user.username },
      { label: 'Email', value: user.email },
      { label: 'Phone', value: user.phone_no || '-' },
      { label: 'Role', value: user.role },
      { label: 'Status', value: user.isApproved ? 'Approved' : 'Pending Approval' },
      { label: 'Created', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-' },
    ];
    this.showView = true;
  }

  confirmDelete(user: any) {
    this.confirmTitle = 'Delete User';
    this.confirmMessage = `Are you sure you want to delete "${user.username}"? This action cannot be undone.`;
    this.confirmType = 'danger';
    this.confirmAction = () => {
      this.userService.delete(user._id).subscribe({
        next: () => { this.success = 'User deleted!'; this.loadUsers(); this.showConfirm = false; setTimeout(() => (this.success = ''), 3000); },
        error: (err: any) => { this.error = err.error?.message || 'Failed to delete'; this.showConfirm = false; },
      });
    };
    this.showConfirm = true;
  }

  confirmApprove(user: any) {
    this.confirmTitle = 'Approve User';
    this.confirmMessage = `Approve "${user.username}" to access the system?`;
    this.confirmType = 'success';
    this.confirmAction = () => {
      this.userService.approve(user._id).subscribe({
        next: () => { this.success = 'User approved!'; this.loadUsers(); this.showConfirm = false; setTimeout(() => (this.success = ''), 3000); },
        error: (err: any) => { this.error = err.error?.message || 'Failed to approve'; this.showConfirm = false; },
      });
    };
    this.showConfirm = true;
  }

  confirmReject(user: any) {
    this.confirmTitle = 'Reject User';
    this.confirmMessage = `Reject and remove "${user.username}"? This will permanently delete the account.`;
    this.confirmType = 'danger';
    this.confirmAction = () => {
      this.userService.reject(user._id).subscribe({
        next: () => { this.success = 'User rejected!'; this.loadUsers(); this.showConfirm = false; setTimeout(() => (this.success = ''), 3000); },
        error: (err: any) => { this.error = err.error?.message || 'Failed to reject'; this.showConfirm = false; },
      });
    };
    this.showConfirm = true;
  }

  openPermissions(user: any) {
    this.selectedUserId = user._id;
    this.selectedUserName = user.username;
    this.selectedUserRole = user.role;
    this.showPermissions = true;
  }

  onPermissionsSaved() {
    this.success = 'Permissions updated!';
    setTimeout(() => (this.success = ''), 3000);
  }
}
