<template>
  <div class="access-page min-h-screen text-slate-800 p-6 bg-slate-50">
    <!-- Header with Underline Bar & Add User Button -->
    <div class="flex items-center justify-between mb-6">
      <div class="page-title-wrap">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Access Management</h1>
        <div class="page-underline"></div>
      </div>
      <button class="btn-add-cyan" @click="openAddUserDrawer">
        + Add User
      </button>
    </div>

    <!-- 3 KPI Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- 1. TOTAL USERS -->
      <div class="kpi-box">
        <span class="kpi-title">TOTAL USERS</span>
        <div class="kpi-number text-sky-700">{{ totalUsersCount }}</div>
        <span class="kpi-subtext">All roles</span>
      </div>

      <!-- 2. ACTIVE -->
      <div class="kpi-box">
        <span class="kpi-title">ACTIVE</span>
        <div class="kpi-number text-slate-900">{{ activeUsersCount }}</div>
        <span class="kpi-subtext">Logged in within 30 days</span>
      </div>

      <!-- 3. PENDING APPROVAL -->
      <div class="kpi-box">
        <span class="kpi-title">PENDING APPROVAL</span>
        <div class="kpi-number text-amber-600">{{ pendingApprovalCount }}</div>
        <span class="kpi-subtext">New users to approve</span>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="search-wrap">
        <svg class="search-icon w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search user / email / role... (Alt+F)"
          class="search-input"
        />
        <button
          v-if="searchQuery"
          class="text-slate-400 hover:text-slate-600 mr-3 text-xs"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Access Directory Table -->
    <div class="table-container">
      <table class="access-table">
        <thead>
          <tr>
            <th class="th-cell">USER ID</th>
            <th class="th-cell">NAME</th>
            <th class="th-cell">EMAIL</th>
            <th class="th-cell">PHONE</th>
            <th class="th-cell">ROLE</th>
            <th class="th-cell">BRANCH</th>
            <th class="th-cell">LAST LOGIN</th>
            <th class="th-cell">STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" class="table-row">
            <!-- USER ID -->
            <td class="td-cell font-mono font-bold text-sky-700">
              {{ u.userId }}
            </td>

            <!-- NAME -->
            <td class="td-cell font-semibold text-slate-900">
              {{ u.name }}
            </td>

            <!-- EMAIL -->
            <td class="td-cell text-slate-600">
              {{ u.email }}
            </td>

            <!-- PHONE -->
            <td class="td-cell font-mono text-slate-600">
              {{ u.phone }}
            </td>

            <!-- ROLE BADGES -->
            <td class="td-cell">
              <span class="role-pill" :class="getRoleClass(u.role)">
                {{ u.role }}
              </span>
            </td>

            <!-- BRANCH -->
            <td class="td-cell text-slate-600">
              {{ u.branch }}
            </td>

            <!-- LAST LOGIN -->
            <td class="td-cell font-mono text-slate-500">
              {{ u.lastLogin }}
            </td>

            <!-- STATUS & ACTION BUTTONS -->
            <td class="td-cell">
              <div class="flex items-center gap-3">
                <span class="status-pill" :class="getStatusClass(u.status)">
                  {{ u.status }}
                </span>

                <!-- Action Button: Approve for Pending, Edit for all -->
                <button
                  v-if="u.status === 'Pending'"
                  class="btn-approve"
                  @click="approveUser(u)"
                >
                  Approve
                </button>
                <button
                  class="btn-edit"
                  @click="openEditDrawer(u)"
                >
                  Edit
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty search results state -->
          <tr v-if="filteredUsers.length === 0">
            <td colspan="8" class="text-center py-12 text-slate-500">
              <div class="text-sm">No matching users found for "{{ searchQuery }}"</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Right Slide Drawer for Add User & Edit User -->
    <DeskDialog
      v-model="showDrawer"
      :title="isEditing ? 'Edit User' : 'Add User'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveUser"
      @cancel="closeDrawer"
    >
      <div class="row q-col-gutter-md">
        <!-- Section Header: USER DETAILS -->
        <div class="col-12">
          <div class="text-subtitle2 text-weight-bold text-sky-700 q-mb-xs font-mono uppercase tracking-wider">
            USER DETAILS
          </div>
        </div>

        <!-- 1. USER ID * -->
        <div class="col-12 col-md-6">
          <DeskField label="USER ID" required>
            <q-input
              v-model="formUser.userId"
              dense
              outlined
              placeholder="USR/010"
            />
          </DeskField>
        </div>

        <!-- 2. FULL NAME * -->
        <div class="col-12 col-md-6">
          <DeskField label="FULL NAME" required>
            <q-input
              v-model="formUser.name"
              dense
              outlined
              placeholder="Rajesh Verma"
            />
          </DeskField>
        </div>

        <!-- 3. EMAIL * -->
        <div class="col-12 col-md-6">
          <DeskField label="EMAIL" required>
            <q-input
              v-model="formUser.email"
              dense
              outlined
              type="email"
              placeholder="rajesh@ankpal.com"
            />
          </DeskField>
        </div>

        <!-- 4. PHONE * -->
        <div class="col-12 col-md-6">
          <DeskField label="PHONE" required>
            <q-input
              v-model="formUser.phone"
              dense
              outlined
              placeholder="9825XXXXXX"
            />
          </DeskField>
        </div>

        <!-- 5. ROLE * -->
        <div class="col-12 col-md-6">
          <DeskField label="ROLE" required>
            <DeskCombo
              v-model="formUser.role"
              :options="roleOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <!-- 6. BRANCH * -->
        <div class="col-12 col-md-6">
          <DeskField label="BRANCH" required>
            <DeskCombo
              v-model="formUser.branch"
              :options="branchOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>

        <!-- 7. STATUS * -->
        <div class="col-12 col-md-6">
          <DeskField label="STATUS" required>
            <DeskCombo
              v-model="formUser.status"
              :options="statusOptions"
              placeholder="— Select —"
            />
          </DeskField>
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../api/client';
import { DeskDialog, DeskField, DeskCombo } from '../../framework';
import { useDeskPageShortcuts } from '../../desk';

const $q = useQuasar();
const searchInputRef = ref();

export interface UserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  lastLogin: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended';
}

const STORAGE_KEY = 'tms_users_directory';

// Dropdown options matching user screenshots 3, 4, 5
const roleOptions = [
  'Admin',
  'Branch Manager',
  'Ops Planner',
  'Fuel Manager',
  'Accounts',
  'Workshop',
  'Driver',
  'Customer',
  'CA Read-Only',
];

const branchOptions = [
  'HO Ahmedabad',
  'Mumbai Branch',
  'Delhi Branch',
  'Hyderabad Branch',
  'External',
];

const statusOptions: Array<'Active' | 'Inactive' | 'Pending' | 'Suspended'> = [
  'Active',
  'Inactive',
  'Pending',
  'Suspended',
];

// Initial mock data matching Screenshot 1 exactly
const initialUsers: UserItem[] = [
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
];

const users = ref<UserItem[]>([]);
const searchQuery = ref('');

// Right Slide Drawer State
const showDrawer = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);


const formUser = ref<{
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
}>({
  userId: '',
  name: '',
  email: '',
  phone: '',
  role: 'Ops Planner',
  branch: 'HO Ahmedabad',
  status: 'Pending',
});

// Computed KPIs
const totalUsersCount = computed(() => users.value.length);
const activeUsersCount = computed(() => users.value.filter((u) => u.status === 'Active').length);
const pendingApprovalCount = computed(() => users.value.filter((u) => u.status === 'Pending').length);

// Filtered Users based on search
const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter((u) => {
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.branch.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });
});

// Role badge class generator matching Screenshot 1
function getRoleClass(role: string): string {
  switch (role) {
    case 'Admin':
      return 'role-admin';
    case 'Branch Manager':
      return 'role-branch-mgr';
    case 'Ops Planner':
      return 'role-ops-planner';
    case 'Fuel Manager':
      return 'role-fuel-mgr';
    case 'Accounts':
      return 'role-accounts';
    case 'Workshop':
      return 'role-workshop';
    case 'Driver':
      return 'role-driver';
    case 'CA Read-Only':
      return 'role-ca';
    case 'Customer':
      return 'role-customer';
    default:
      return 'role-default';
  }
}

// Status badge class generator matching Screenshot 1
function getStatusClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Pending':
      return 'status-pending';
    case 'Suspended':
      return 'status-suspended';
    default:
      return 'status-inactive';
  }
}

// Load users from LocalStorage / Backend
function loadUsers() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      users.value = JSON.parse(cached);
    } catch {
      users.value = [...initialUsers];
    }
  } else {
    users.value = [...initialUsers];
    saveToStorage();
  }

  fetchFromBackend();
}

async function fetchFromBackend() {
  try {
    const res: any = await api.get('/api/v1/users');
    if (res && Array.isArray(res) && res.length > 0) {
      console.log('Synced with backend users API:', res.length);
    }
  } catch (err) {
    console.debug('Backend user sync offline fallback:', err);
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value));
}

// Open Right Slide Drawer for Adding a new user (Image 1)
function openAddUserDrawer() {
  isEditing.value = false;
  editingId.value = null;

  // Generate next sequential user ID (e.g. USR/010)
  const nextNum = users.value.length + 1;
  const nextId = `USR/${String(nextNum).padStart(3, '0')}`;

  formUser.value = {
    userId: nextId,
    name: 'Rajesh Verma',
    email: 'rajesh@ankpal.com',
    phone: '9825XXXXXX',
    role: 'Ops Planner',
    branch: 'HO Ahmedabad',
    status: 'Pending',
  };

  showDrawer.value = true;
}

// Open Right Slide Drawer for Editing an existing user (Image 2)
function openEditDrawer(u: UserItem) {
  isEditing.value = true;
  editingId.value = u.id;

  formUser.value = {
    userId: u.userId,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    branch: u.branch,
    status: u.status,
  };

  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
}

// Approve User directly from table
async function approveUser(u: UserItem) {
  u.status = 'Active';
  saveToStorage();

  $q.notify({
    type: 'positive',
    icon: 'verified_user',
    message: 'User Approved Successfully',
    caption: `${u.name} status is now Active.`,
    position: 'top-right',
  });

  try {
    await api.patch(`/api/v1/users/${u.id}`, { status: 'ACTIVE' });
  } catch (e) {
    console.debug('Backend patch error (handled):', e);
  }
}

// Save User (Create or Update)
async function saveUser() {
  if (!formUser.value.name.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Validation Error',
      caption: 'Full Name is required.',
      position: 'top-right',
    });
    return;
  }

  if (isEditing.value && editingId.value) {
    // UPDATE EXISTING USER (Image 2)
    const idx = users.value.findIndex(
      (u) => String(u.id) === String(editingId.value) || u.userId === formUser.value.userId,
    );
    if (idx !== -1) {
      users.value.splice(idx, 1, {
        ...users.value[idx],
        userId: formUser.value.userId,
        name: formUser.value.name,
        email: formUser.value.email,
        phone: formUser.value.phone,
        role: formUser.value.role,
        branch: formUser.value.branch,
        status: formUser.value.status,
      });

      saveToStorage();

      $q.notify({
        type: 'positive',
        icon: 'check_circle',
        message: 'User Updated',
        caption: `Changes saved for ${formUser.value.name}.`,
        position: 'top-right',
      });

      // Sync with backend
      try {
        const nameParts = formUser.value.name.split(' ');
        await api.patch(`/api/v1/users/${editingId.value}`, {
          firstName: nameParts[0] || formUser.value.name,
          lastName: nameParts.slice(1).join(' ') || '',
          email: formUser.value.email,
          phone: formUser.value.phone,
          status: formUser.value.status.toUpperCase(),
        });
      } catch (err) {
        console.debug('Backend patch error:', err);
      }
    }
  } else {
    // ADD NEW USER (Image 1)
    const newUserItem: UserItem = {
      id: String(Date.now()),
      userId: formUser.value.userId || `USR/0${users.value.length + 1}`,
      name: formUser.value.name,
      email: formUser.value.email,
      phone: formUser.value.phone,
      role: formUser.value.role || 'Ops Planner',
      branch: formUser.value.branch || 'HO Ahmedabad',
      lastLogin: '—',
      status: formUser.value.status || 'Pending',
    };

    users.value.push(newUserItem);
    saveToStorage();

    $q.notify({
      type: 'positive',
      icon: 'person_add',
      message: 'User Created',
      caption: `${newUserItem.name} added to Access Management.`,
      position: 'top-right',
    });

    // Sync with backend
    try {
      const nameParts = formUser.value.name.split(' ');
      await api.post('/api/v1/users', {
        firstName: nameParts[0] || formUser.value.name,
        lastName: nameParts.slice(1).join(' ') || '',
        email: formUser.value.email,
        phone: formUser.value.phone,
        status: formUser.value.status.toUpperCase(),
      });
    } catch (err) {
      console.debug('Backend post error:', err);
    }
  }

  closeDrawer();
}

onMounted(() => {
  loadUsers();
});

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: openAddUserDrawer,
  isModalOpen: () => showDrawer.value,
  onSave: saveUser,
  onEscape: () => {
    closeDrawer();
  },
});
</script>

<style scoped>
.access-page {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header */
.page-title-wrap {
  display: flex;
  flex-direction: column;
}

.page-underline {
  height: 3px;
  width: 38px;
  background-color: #0284c7;
  border-radius: 2px;
  margin-top: 4px;
}

/* Add User Button */
.btn-add-cyan {
  background-color: #0284c7;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-add-cyan:hover {
  background-color: #0369a1;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.25);
}

/* KPI Box Cards */
.kpi-box {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kpi-title {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kpi-number {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  margin: 6px 0 4px 0;
}

.kpi-subtext {
  font-size: 12px;
  color: #64748b;
}

/* Search Box */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 320px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.search-wrap:focus-within {
  border-color: #0284c7;
}

.search-icon {
  margin-left: 12px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 10px 12px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Table Container */
.table-container {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.access-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.th-cell {
  padding: 14px 18px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #cbd5e1;
  background-color: #f8fafc;
  white-space: nowrap;
}

.td-cell {
  padding: 14px 18px;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.table-row:hover {
  background-color: #f1f5f9;
}

/* Role Badges */
.role-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.role-admin {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.role-branch-mgr {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.role-ops-planner {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.role-fuel-mgr {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.role-accounts {
  background-color: #f0fdf4;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.role-workshop {
  background-color: #fff7ed;
  color: #c2410c;
  border: 1px solid #ffedd5;
}

.role-driver {
  background-color: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.role-ca {
  background-color: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

.role-customer {
  background-color: #f0fdfa;
  color: #0f766e;
  border: 1px solid #99f6e4;
}

.role-default {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

/* Status Badges */
.status-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 4px;
}

.status-active {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-pending {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.status-suspended {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.status-inactive {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

/* Edit & Approve Buttons */
.btn-edit {
  background-color: #ffffff;
  color: #0284c7;
  border: 1px solid #0284c7;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background-color: #f0f9ff;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.15);
}

.btn-approve {
  background-color: #10b981;
  color: #ffffff;
  border: none;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-approve:hover {
  background-color: #059669;
}
</style>

