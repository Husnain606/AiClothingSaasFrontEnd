import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsAdminService } from '../services/settings-admin.service';
import { TenantUserDto, CreateTenantUserRequest, TenantRole } from '../models/settings-admin.model';
import { ToastService } from '../../shared/services/toast.service';
import { DataTableComponent, DataTableColumn } from '../../shared/components/data-table/data-table.component';

const ASSIGNABLE_ROLES: TenantRole[] = [
  'AdminOwner',
  'StoreManager',
  'InventoryManager',
  'OrderManager',
  'ContentManager',
];

@Component({
  selector: 'app-tenant-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './tenant-users.component.html',
})
export class TenantUsersComponent implements OnInit {
  columns: DataTableColumn<TenantUserDto>[] = [
    { key: 'email', header: 'Email' },
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'roles', header: 'Roles', cellTemplate: 'custom' },
    { key: 'id', header: 'Actions', cellTemplate: 'custom' },
  ];
  users: TenantUserDto[] = [];
  roles = ASSIGNABLE_ROLES;
  newUser: CreateTenantUserRequest = { email: '', firstName: '', lastName: '', role: 'StoreManager' };
  loading = false;

  constructor(
    private settings: SettingsAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.settings.getUsers().subscribe((users) => {
      this.users = users;
      this.loading = false;
    });
  }

  onCreate(): void {
    this.settings.createUser(this.newUser).subscribe({
      next: () => {
        this.toast.success('User created.');
        this.newUser = { email: '', firstName: '', lastName: '', role: 'StoreManager' };
        this.load();
      },
      error: () => this.toast.error('Failed to create user.'),
    });
  }

  onAssignRole(user: TenantUserDto, role: TenantRole): void {
    this.settings.assignRole(user.id, role).subscribe({
      next: () => {
        this.toast.success('Role updated.');
        this.load();
      },
      error: () => this.toast.error('Failed to update role.'),
    });
  }

  onDelete(user: TenantUserDto): void {
    this.settings.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.success('User removed.');
        this.load();
      },
      error: () => this.toast.error('Failed to remove user.'),
    });
  }
}
