<template>
  <div class="access-management-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Access Management</h1>
        <div class="accent-line"></div>
      </div>
      <button class="btn-primary" @click="openAddUserModal">
        <span class="material-icons-outlined">person_add</span>
        Add User
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="filter-bar row items-center justify-between no-wrap">
      <div class="row items-center q-gutter-x-sm no-wrap">
        <div class="search-input-wrap">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Search user / role / branch..."
            class="desk-search-input"
          >
            <template #prepend>
              <q-icon name="search" size="18px" color="cyan" />
            </template>
            <template #append v-if="searchQuery">
              <q-icon
                name="cancel"
                size="18px"
                class="cursor-pointer text-slate-400 hover:text-white"
                @click.stop.prevent="searchQuery = ''"
                @mousedown.stop.prevent="searchQuery = ''"
              />
            </template>
          </q-input>
        </div>
        <q-select
          v-model="roleFilter"
          :options="roleFilterOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          popup-content-class="desk-select-menu"
          style="min-width: 170px;"
        >
          <template #prepend>
            <q-icon name="badge" size="16px" color="cyan" />
          </template>
        </q-select>
      </div>

      <div class="row items-center q-gutter-x-xs no-wrap">
        <q-btn
          flat
          dense
          icon="refresh"
          class="desk-grid-refresh-btn"
          :loading="isRefreshing"
          @click="onRefresh"
        >
          <q-tooltip>Refresh Users Directory</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Table matching Figma -->
    <div class="cyber-card table-wrap relative-position">
      <q-inner-loading :showing="isRefreshing" color="cyan" style="background: rgba(10, 15, 29, 0.8); z-index: 10;">
        <q-spinner-dots size="48px" color="cyan" />
        <div class="text-caption text-cyan-300 q-mt-sm font-mono tracking-wider">Syncing users directory...</div>
      </q-inner-loading>
      <table class="cyber-table">
        <thead>
          <tr>
            <th>USER ID</th>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>PHONE</th>
            <th>ROLE</th>
            <th>BRANCH</th>
            <th>LAST LOGIN</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td class="cyan-code font-bold">{{ u.userId }}</td>
            <td class="name-cell font-semibold">{{ u.name }}</td>
            <td class="email-cell text-slate-300">{{ u.email }}</td>
            <td class="phone-cell font-mono">{{ u.phone }}</td>
            <td>
              <span class="role-badge" :class="'role-' + u.role.toLowerCase().replace(/[^a-z0-9]/g, '-')">
                {{ u.role }}
              </span>
            </td>
            <td class="branch-cell">{{ u.branch }}</td>
            <td class="date-cell">{{ u.lastLogin }}</td>
            <td>
              <span class="status-badge" :class="u.status === 'Active' ? 'badge-active' : 'badge-pending'">
                {{ u.status }}
              </span>
            </td>
            <td>
              <button
                class="btn-action"
                :class="{ 'btn-approve': u.status === 'Pending' }"
                @click="handleAction(u)"
              >
                {{ u.status === 'Pending' ? 'Approve' : 'Edit' }}
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="9" class="text-center py-12">
              <div class="column items-center justify-center text-center q-pa-xl">
                <div class="q-mb-sm flex flex-center" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.15); margin: 0 auto;">
                  <q-icon name="search_off" size="28px" class="text-slate-400" />
                </div>
                <div class="text-subtitle1 text-weight-bold text-slate-200">No matching records found</div>
                <div class="text-caption text-slate-500 q-mt-xs">Try adjusting your search terms or clearing active filters.</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit User Desk Dialog matching Image 2 -->
    <DeskDialog
      v-model="showAddModal"
      :title="isEditing ? 'Edit Enterprise User' : 'Create Enterprise User'"
      width="580px"
      :confirm-label="isEditing ? 'Update User' : 'Create User'"
      cancel-label="Cancel"
      @confirm="saveUser"
      @cancel="showAddModal = false"
    >
      <DeskForm @submit="saveUser">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Full Name" required shortcut="1">
              <q-input
                v-model="newUser.name"
                dense
                outlined
                placeholder="e.g. Rahul Sharma"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Email Address" required shortcut="2">
              <q-input
                v-model="newUser.email"
                type="email"
                dense
                outlined
                placeholder="e.g. rahul@ankpal.com"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Mobile Number" required shortcut="3">
              <q-input
                v-model="newUser.phone"
                dense
                outlined
                placeholder="e.g. 9825000010"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="Assigned Role" required shortcut="4">
              <DeskCombo
                v-model="newUser.role"
                :options="roleOptions"
                placeholder="Select role..."
              />
            </DeskField>
          </div>

          <div class="col-12">
            <DeskField label="Assigned Branch" required shortcut="5">
              <DeskCombo
                v-model="newUser.branch"
                :options="branchOptions"
                placeholder="Select branch..."
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { exportToCsv } from '../../utils/exportCsv';
import {
  DeskDialog,
  DeskForm,
  DeskField,
  DeskCombo,
} from '../../framework';

const $q = useQuasar();
const isEditing = ref(false);
const editingId = ref<string | null>(null);

interface UserRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  lastLogin: string;
  status: 'Active' | 'Pending';
}

const showAddModal = ref(false);
const searchQuery = ref('');
const roleFilter = ref('ALL');

const roleOptions = [
  'Admin',
  'Branch Manager',
  'Ops Planner',
  'Fuel Manager',
  'Accounts',
  'Workshop',
  'Driver',
  'CA Read-Only',
];

const roleFilterOptions = [
  { label: 'All Roles', value: 'ALL' },
  ...roleOptions.map((r) => ({ label: r, value: r })),
];

const branchOptions = [
  'HO Ahmedabad',
  'Mumbai Branch',
  'Surat Depot',
  'External',
];

function openAddUserModal() {
  isEditing.value = false;
  editingId.value = null;
  newUser.value = {
    name: '',
    email: '',
    phone: '',
    role: 'Ops Planner',
    branch: 'HO Ahmedabad',
  };
  showAddModal.value = true;
}

const users = ref<UserRecord[]>([
  {
    id: '1',
    userId: 'USR/001',
    name: 'Ankit Shah',
    email: 'ankit@ankpal.com',
    phone: '9825000001',
    role: 'Admin',
    branch: 'HO Ahmedabad',
    lastLogin: '2026-10-24',
    status: 'Active',
  },
  {
    id: '2',
    userId: 'USR/002',
    name: 'Ravi Mehta',
    email: 'ravi.m@ankpal.com',
    phone: '9825000002',
    role: 'Branch Manager',
    branch: 'HO Ahmedabad',
    lastLogin: '2026-10-24',
    status: 'Active',
  },
  {
    id: '3',
    userId: 'USR/003',
    name: 'Priya Nair',
    email: 'priya@ankpal.com',
    phone: '9825000003',
    role: 'Ops Planner',
    branch: 'Mumbai Branch',
    lastLogin: '2026-10-23',
    status: 'Active',
  },
  {
    id: '4',
    userId: 'USR/004',
    name: 'Jignesh Patel',
    email: 'jignesh@ankpal.com',
    phone: '9825000004',
    role: 'Fuel Manager',
    branch: 'HO Ahmedabad',
    lastLogin: '2026-10-22',
    status: 'Active',
  },
  {
    id: '5',
    userId: 'USR/005',
    name: 'Smita Joshi',
    email: 'smita@ankpal.com',
    phone: '9825000005',
    role: 'Accounts',
    branch: 'HO Ahmedabad',
    lastLogin: '2026-10-24',
    status: 'Active',
  },
  {
    id: '6',
    userId: 'USR/006',
    name: 'Manoj Kumar',
    email: 'manoj@ankpal.com',
    phone: '9825000006',
    role: 'Workshop',
    branch: 'HO Ahmedabad',
    lastLogin: '2026-10-21',
    status: 'Active',
  },
  {
    id: '7',
    userId: 'USR/007',
    name: 'Devraj Patel',
    email: 'devraj@driver.com',
    phone: '9825000007',
    role: 'Driver',
    branch: 'HO Ahmedabad',
    lastLogin: '2026-10-20',
    status: 'Active',
  },
  {
    id: '8',
    userId: 'USR/008',
    name: 'CA Firm — ACME & Co',
    email: 'ca@acmeaudit.com',
    phone: '9825000008',
    role: 'CA Read-Only',
    branch: 'External',
    lastLogin: '2026-10-15',
    status: 'Active',
  },
  {
    id: '9',
    userId: 'USR/009',
    name: 'New Hire Ops',
    email: 'newops@ankpal.com',
    phone: '9825000009',
    role: 'Ops Planner',
    branch: 'Mumbai Branch',
    lastLogin: '—',
    status: 'Pending',
  },
]);

const newUser = ref({
  name: '',
  email: '',
  phone: '',
  role: 'Ops Planner',
  branch: 'HO Ahmedabad',
});

const isRefreshing = ref(false);

function onRefresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    $q.notify({
      type: 'positive',
      message: 'Users Directory Refreshed',
      caption: 'Enterprise user profiles synced.',
      position: 'top-right',
    });
  }, 600);
}

const filteredUsers = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  return users.value.filter(u => {
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.userId.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.branch.toLowerCase().includes(q);
    const matchRole = roleFilter.value === 'ALL' || u.role === roleFilter.value;
    return matchSearch && matchRole;
  });
});

function handleAction(u: UserRecord) {
  if (u.status === 'Pending') {
    u.status = 'Active';
    $q.notify({
      type: 'positive',
      icon: 'verified_user',
      message: 'Access Credentials Approved',
      caption: `Active privileges granted for ${u.name} (${u.role}).`,
      position: 'top-right',
    });
  } else {
    isEditing.value = true;
    editingId.value = u.id;
    newUser.value = {
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      branch: u.branch,
    };
    showAddModal.value = true;
  }
}

function saveUser() {
  if (!newUser.value.name) return;

  if (isEditing.value && editingId.value) {
    const idx = users.value.findIndex((u) => u.id === editingId.value);
    if (idx !== -1) {
      users.value[idx] = {
        ...users.value[idx],
        name: newUser.value.name,
        email: newUser.value.email || users.value[idx].email,
        phone: newUser.value.phone || users.value[idx].phone,
        role: newUser.value.role,
        branch: newUser.value.branch,
      };
      $q.notify({
        type: 'positive',
        message: 'User Permissions Updated',
        caption: `Changes saved for ${newUser.value.name}.`,
        position: 'top-right',
      });
    }
  } else {
    const num = users.value.length + 1;
    users.value.push({
      id: String(Date.now()),
      userId: `USR/00${num}`,
      name: newUser.value.name,
      email: newUser.value.email || `user${num}@ankpal.com`,
      phone: newUser.value.phone || '9825000099',
      role: newUser.value.role,
      branch: newUser.value.branch,
      lastLogin: '—',
      status: 'Pending',
    });
    $q.notify({
      type: 'positive',
      message: 'User Created Successfully',
      caption: `Access invite sent to ${newUser.value.name}.`,
      position: 'top-right',
    });
  }

  showAddModal.value = false;
  isEditing.value = false;
  editingId.value = null;
  newUser.value = { name: '', email: '', phone: '', role: 'Ops Planner', branch: 'HO Ahmedabad' };
}

function exportUsersCsv() {
  exportToCsv(
    'enterprise_users_directory',
    [
      { label: 'User ID', field: 'userId' },
      { label: 'Full Name', field: 'name' },
      { label: 'Email Address', field: 'email' },
      { label: 'Phone', field: 'phone' },
      { label: 'Role / Designation', field: 'role' },
      { label: 'Operating Branch', field: 'branch' },
      { label: 'Last Login', field: 'lastLogin' },
      { label: 'Status', field: 'status' },
    ],
    users.value,
  );
  $q.notify({
    type: 'positive',
    message: 'User Directory Exported',
    caption: `${users.value.length} users exported to CSV.`,
    position: 'top-right',
  });
}
</script>

<style scoped>
.access-management-page {
  padding: 1.5rem;
  background-color: #070c18;
  min-height: calc(100vh - 64px);
  color: #e2e8f0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.accent-line {
  width: 44px;
  height: 3px;
  background: #00f2fe;
  border-radius: 2px;
  margin-top: 6px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #00f2fe;
  color: #070c18;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #38bdf8;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
}

.btn-secondary {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input-wrap {
  position: relative;
  width: 340px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1.1rem;
}

.cyber-input {
  width: 100%;
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 0.55rem 0.75rem 0.55rem 2.2rem;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
}

.cyber-input:focus {
  border-color: #00f2fe;
}

.cyber-select {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  outline: none;
}

.cyber-card {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

.cyber-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.cyber-table th {
  background: rgba(255, 255, 255, 0.02);
  color: #00f2fe;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
}

.cyan-code {
  color: #00f2fe;
}

.name-cell {
  color: #ffffff;
}

.role-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.18rem 0.55rem;
  border-radius: 4px;
}

.role-admin {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.role-branch-manager {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
}

.role-ops-planner {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.role-fuel-manager {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.role-accounts {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.role-workshop {
  background: rgba(249, 115, 22, 0.15);
  color: #fb923c;
}

.role-driver {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.role-ca-read-only {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.status-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 6px;
}

.badge-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.btn-action {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-action:hover {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
}

.btn-approve {
  background: #00f2fe;
  color: #070c18;
  font-weight: 700;
  border: none;
}

.btn-approve:hover {
  background: #38bdf8;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: #0d172b;
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 12px;
  width: 520px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.25rem;
}

.modal-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.35rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
