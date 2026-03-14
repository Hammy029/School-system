import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService, PERMISSION_GROUPS, PermissionGroup } from '../../shared/services/permission.service';

@Component({
  selector: 'app-permissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[85vh]"
          [class]="darkMode ? 'bg-slate-800' : 'bg-white'">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b flex-shrink-0"
            [class]="darkMode ? 'border-slate-700' : 'border-gray-200'">
            <div>
              <h2 class="text-lg font-semibold" [class]="darkMode ? 'text-white' : 'text-gray-900'">
                Manage Permissions
              </h2>
              <p class="text-sm mt-0.5" [class]="darkMode ? 'text-slate-400' : 'text-gray-500'">
                {{ userName }} ({{ userRole }})
              </p>
            </div>
            <button (click)="close()" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                class="w-5 h-5" [class]="darkMode ? 'text-slate-400' : 'text-gray-500'">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Quick actions -->
          <div class="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
            [class]="darkMode ? 'border-slate-700' : 'border-gray-200'">
            <input [(ngModel)]="searchTerm" placeholder="Search permissions..."
              class="flex-1 px-3 py-1.5 rounded-lg border text-sm"
              [class]="darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'" />
            <button (click)="selectAll()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">Select All</button>
            <button (click)="deselectAll()" class="px-3 py-1.5 text-xs font-medium rounded-lg"
              [class]="darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">Clear All</button>
          </div>

          @if (loading) {
            <div class="flex justify-center py-12"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          }

          @if (error) {
            <div class="mx-4 mt-3 p-3 rounded-lg bg-red-100 text-red-800 text-sm">{{ error }}</div>
          }

          <!-- Permission groups -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            @for (group of filteredGroups; track group.name) {
              <div class="rounded-lg border" [class]="darkMode ? 'border-slate-700' : 'border-gray-200'">
                <div class="flex items-center justify-between px-4 py-2.5 cursor-pointer"
                  [class]="darkMode ? 'bg-slate-750 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'"
                  (click)="toggleGroup(group.name)">
                  <div class="flex items-center gap-2">
                    <span>{{ group.icon }}</span>
                    <span class="text-sm font-semibold" [class]="darkMode ? 'text-white' : 'text-gray-900'">{{ group.name }}</span>
                    <span class="text-xs px-1.5 py-0.5 rounded-full"
                      [class]="darkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-500'">
                      {{ getGroupSelectedCount(group) }}/{{ group.permissions.length }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="toggleGroupAll(group, $event)" class="text-xs px-2 py-1 rounded"
                      [class]="isGroupAllSelected(group)
                        ? (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700')
                        : (darkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-600')">
                      {{ isGroupAllSelected(group) ? 'Deselect All' : 'Select All' }}
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-4 h-4 transition-transform"
                      [class.rotate-180]="expandedGroups[group.name]"
                      [class]="darkMode ? 'text-slate-400' : 'text-gray-400'">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                    </svg>
                  </div>
                </div>
                @if (expandedGroups[group.name]) {
                  <div class="px-4 py-3 grid grid-cols-2 gap-2 border-t"
                    [class]="darkMode ? 'border-slate-700' : 'border-gray-200'">
                    @for (perm of group.permissions; track perm.key) {
                      <label class="flex items-center gap-2 py-1 cursor-pointer">
                        <input type="checkbox" [checked]="selectedPermissions.has(perm.key)"
                          (change)="togglePermission(perm.key)"
                          class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span class="text-sm" [class]="darkMode ? 'text-slate-300' : 'text-gray-700'">{{ perm.label }}</span>
                      </label>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between p-4 border-t flex-shrink-0"
            [class]="darkMode ? 'border-slate-700' : 'border-gray-200'">
            <span class="text-sm" [class]="darkMode ? 'text-slate-400' : 'text-gray-500'">
              {{ selectedPermissions.size }} permissions selected
            </span>
            <div class="flex gap-3">
              <button (click)="close()" class="px-4 py-2 rounded-lg text-sm font-medium"
                [class]="darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'">Cancel</button>
              <button (click)="save()" [disabled]="saving" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save Permissions' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class PermissionsModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() userId = '';
  @Input() userName = '';
  @Input() userRole = '';
  @Input() darkMode = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  groups: PermissionGroup[] = [];
  filteredGroups: PermissionGroup[] = [];
  selectedPermissions = new Set<string>();
  expandedGroups: Record<string, boolean> = {};
  searchTerm = '';
  loading = false;
  saving = false;
  error = '';

  constructor(private permissionService: PermissionService) {
    this.groups = PERMISSION_GROUPS;
    this.filteredGroups = this.groups;
    this.groups.forEach(g => (this.expandedGroups[g.name] = true));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.userId) {
      this.loadPermissions();
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.searchTerm = '';
      this.filteredGroups = this.groups;
    }
  }

  loadPermissions() {
    this.loading = true;
    this.error = '';
    this.permissionService.getUserPermissions(this.userId).subscribe({
      next: (perms: string[]) => {
        this.selectedPermissions = new Set(perms);
        this.loading = false;
      },
      error: () => { this.loading = false; this.selectedPermissions = new Set(); },
    });
  }

  togglePermission(key: string) {
    if (this.selectedPermissions.has(key)) {
      this.selectedPermissions.delete(key);
    } else {
      this.selectedPermissions.add(key);
    }
  }

  toggleGroup(name: string) {
    this.expandedGroups[name] = !this.expandedGroups[name];
  }

  isGroupAllSelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => this.selectedPermissions.has(p.key));
  }

  getGroupSelectedCount(group: PermissionGroup): number {
    return group.permissions.filter(p => this.selectedPermissions.has(p.key)).length;
  }

  toggleGroupAll(group: PermissionGroup, event: Event) {
    event.stopPropagation();
    if (this.isGroupAllSelected(group)) {
      group.permissions.forEach(p => this.selectedPermissions.delete(p.key));
    } else {
      group.permissions.forEach(p => this.selectedPermissions.add(p.key));
    }
  }

  selectAll() {
    this.groups.forEach(g => g.permissions.forEach(p => this.selectedPermissions.add(p.key)));
  }

  deselectAll() {
    this.selectedPermissions.clear();
  }

  save() {
    this.saving = true;
    this.error = '';
    this.permissionService.updateUserPermissions(this.userId, Array.from(this.selectedPermissions)).subscribe({
      next: () => { this.saving = false; this.saved.emit(); this.close(); },
      error: (err: any) => { this.saving = false; this.error = err.error?.message || 'Failed to save permissions'; },
    });
  }

  close() { this.closed.emit(); }
}
