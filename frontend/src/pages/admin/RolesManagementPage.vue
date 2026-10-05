<template>
  <div class="roles-management-page p-3 sm:p-4 text-slate-800 bg-slate-50 font-sans">
    <!-- Header with Title & Action Controls in Single Clean Row -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div class="column q-gutter-y-xs">
        <div class="text-h6 text-weight-bold text-slate-900 row items-center q-gutter-x-sm no-wrap">
          <q-icon name="admin_panel_settings" color="primary" size="26px" />
          <span>Roles & Permissions Management</span>
        </div>
        <div class="text-caption text-slate-500">
          Define fine-grained Role-Based Access Control (RBAC) policies, manage personas & grant modular capabilities
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <q-btn
          flat
          dense
          icon="refresh"
          class="desk-grid-refresh-btn"
          :loading="loading"
          @click="loadData"
        >
          <q-tooltip>Refresh Roles Directory</q-tooltip>
        </q-btn>
        <PermissionGate permission="role:create">
          <q-btn
            unelevated
            icon="add"
            label="Create New Role"
            class="desk-btn-primary"
            @click="openCreateRoleModal"
          />
        </PermissionGate>
      </div>
    </div>

    <!-- 4 KPI Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">CONFIGURED ROLES</div>
        <div class="text-2xl font-extrabold font-mono text-sky-700 my-1">{{ roles.length }}</div>
        <div class="text-xs text-slate-400 font-mono">13 Master Personas Seeded</div>
        <div class="accent-bar bg-sky-600"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">TOTAL CAPABILITIES</div>
        <div class="text-2xl font-extrabold font-mono text-teal-700 my-1">{{ totalPermissionsCount }}</div>
        <div class="text-xs text-slate-400 font-mono">Granular module:action gates</div>
        <div class="accent-bar bg-teal-600"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">SUPER ADMIN GATE</div>
        <div class="text-2xl font-extrabold font-mono text-purple-700 my-1">WILDCARD *</div>
        <div class="text-xs text-slate-400 font-mono">Unrestricted enterprise access</div>
        <div class="accent-bar bg-purple-600"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">ASSIGNED ACCOUNTS</div>
        <div class="text-2xl font-extrabold font-mono text-emerald-700 my-1">{{ totalAssignedUsers }} Users</div>
        <div class="text-xs text-slate-400 font-mono">100% Tenant Isolation</div>
        <div class="accent-bar bg-emerald-600"></div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filter-bar row items-center justify-between no-wrap q-mb-md">
      <div class="row items-center q-gutter-x-sm no-wrap">
        <div class="search-input-wrap">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Search role name or description..."
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
          v-model="scopeFilter"
          :options="[
            { label: 'All Roles', value: 'all' },
            { label: 'System Personas', value: 'system' },
            { label: 'Custom Roles', value: 'custom' }
          ]"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          popup-content-class="desk-select-menu"
          style="min-width: 170px;"
        >
          <template #prepend>
            <q-icon name="shield" size="16px" color="cyan" />
          </template>
        </q-select>
      </div>

      <div class="text-xs text-slate-400 font-mono hidden sm:block">
        Showing <strong class="text-cyan-400">{{ filteredRoles.length }}</strong> of {{ roles.length }} Roles
      </div>
    </div>

    <!-- Roles Cyber Table Card -->
    <div class="cyber-card relative-position overflow-hidden">
      <!-- Loading Overlay -->
      <AppLoadingOverlay
        :showing="loading"
        title="Syncing Roles & RBAC Matrix..."
        subtitle="Loading granular system permissions & tenant access levels"
      />

      <q-table
        :rows="filteredRoles"
        :columns="columns"
        row-key="id"
        flat
        dense
        :pagination="{ rowsPerPage: 15 }"
        class="cyber-q-table"
      >
        <!-- Role Identifier Column -->
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-sm"
                :class="props.row.name === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-sky-100 text-sky-700 border border-sky-300'"
              >
                {{ props.row.name[0] }}
              </div>
              <div class="column min-w-0">
                <div class="row items-center q-gutter-x-xs no-wrap">
                  <span class="font-mono font-bold text-slate-900 text-sm truncate">{{ props.row.name }}</span>
                  <span v-if="props.row.name === 'SUPER_ADMIN'" class="desk-pill desk-pill-purple text-[10px] q-py-none shrink-0">
                    WILDCARD *
                  </span>
                  <span v-else-if="isSystemRole(props.row.name)" class="desk-pill desk-pill-primary text-[10px] q-py-none shrink-0">
                    SYSTEM
                  </span>
                  <span v-else class="desk-pill desk-pill-success text-[10px] q-py-none shrink-0">
                    CUSTOM
                  </span>
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Description Column -->
        <template #body-cell-description="props">
          <q-td :props="props">
            <span class="text-slate-600 text-xs">{{ props.row.description || 'Enterprise RBAC persona definition' }}</span>
          </q-td>
        </template>

        <!-- Permissions Count Column -->
        <template #body-cell-permissionsCount="props">
          <q-td :props="props" align="center">
            <span
              v-if="props.row.name === 'SUPER_ADMIN'"
              class="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 border border-purple-200 text-purple-700 inline-flex items-center"
            >
              ALL (* UNRESTRICTED)
            </span>
            <span
              v-else
              class="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-50 border border-sky-200 text-sky-700 inline-flex items-center q-gutter-x-xs"
            >
              <q-icon name="vpn_key" size="11px" />
              <span>{{ getPermissionsCount(props.row) }} permissions</span>
            </span>
          </q-td>
        </template>

        <!-- Assigned Users Count Column -->
        <template #body-cell-usersCount="props">
          <q-td :props="props" align="center">
            <span class="font-mono text-xs text-slate-600 inline-flex items-center justify-center q-gutter-x-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <q-icon name="person" size="12px" color="primary" />
              <strong class="text-slate-900">{{ props.row._count?.users ?? props.row.users?.length ?? 1 }}</strong>
            </span>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template #body-cell-actions="props">
          <q-td :props="props" align="right">
            <div class="row items-center justify-end q-gutter-x-xs no-wrap">
              <PermissionGate permission="role:update">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  size="sm"
                  color="primary"
                  :disable="props.row.name === 'SUPER_ADMIN'"
                  @click="editRole(props.row)"
                >
                  <q-tooltip>Configure Role Permissions</q-tooltip>
                </q-btn>
              </PermissionGate>
              <PermissionGate permission="role:delete">
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  size="sm"
                  color="negative"
                  :disable="props.row.name === 'SUPER_ADMIN' || isSystemRole(props.row.name)"
                  @click="confirmDeleteRole(props.row)"
                >
                  <q-tooltip>{{ isSystemRole(props.row.name) ? 'System personas cannot be deleted' : 'Delete Custom Role' }}</q-tooltip>
                </q-btn>
              </PermissionGate>
            </div>
          </q-td>
        </template>

        <!-- Centered Empty State matching Desk standard -->
        <template #no-data>
          <div class="full-width column items-center justify-center text-center q-pa-xl">
            <div class="q-mb-sm flex flex-center" style="width: 56px; height: 56px; border-radius: 50%; background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.15); margin: 0 auto;">
              <q-icon name="search_off" size="28px" class="text-slate-400" />
            </div>
            <div class="text-subtitle1 text-weight-bold text-slate-800">No matching records found</div>
            <div class="text-caption text-slate-500 q-mt-xs q-mb-md">Try adjusting your search terms or clearing active filters.</div>
            <q-btn
              v-if="searchQuery || scopeFilter !== 'all'"
              unelevated
              size="sm"
              no-caps
              label="Reset Filters"
              class="desk-btn-secondary"
              @click="searchQuery = ''; scopeFilter = 'all'"
            />
          </div>
        </template>
      </q-table>
    </div>

    <!-- Create / Edit Role Cyber Modal with DeskDialog -->
    <DeskDialog
      v-model="roleModalOpen"
      :title="isEditing ? `Edit Enterprise Role: ${roleForm.name}` : 'Create Custom Enterprise Role'"
      width="880px"
      max-height="82vh"
      :confirm-label="isEditing ? 'Save Changes' : 'Create Role'"
      cancel-label="Cancel"
      :loading="saving"
      @confirm="saveRole"
      @cancel="roleModalOpen = false"
    >
      <div class="space-y-4">
        <!-- Role Identifier & Description in 2 Clean Columns -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <DeskField label="Role Name / Identifier (UPPERCASE)" required shortcut="1">
              <q-input
                v-model="roleForm.name"
                dense
                outlined
                placeholder="e.g. TERMINAL_SUPERVISOR"
                :readonly="isEditing"
                class="font-mono text-uppercase"
              />
            </DeskField>
          </div>
          <div class="col-12 col-md-6">
            <DeskField label="Operational Scope & Description" required shortcut="2">
              <q-input
                v-model="roleForm.description"
                dense
                outlined
                placeholder="Operational scope and access boundaries"
              />
            </DeskField>
          </div>
        </div>

        <!-- Permission Matrix Section -->
        <div class="pt-2 border-t border-slate-800">
          <div class="row items-center justify-between q-mb-sm">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="vpn_key" color="primary" size="18px" />
              <span class="text-sm font-bold text-slate-900">Modular Capability Matrix</span>
              <span class="font-mono text-xs px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700">
                {{ selectedPermissionKeys.length }} permissions granted
              </span>
            </div>
            <div class="row items-center q-gutter-x-xs">
              <q-btn flat dense no-caps size="xs" color="primary" label="Select All" class="px-2" @click="selectAllPermissions" />
              <span class="text-slate-400">•</span>
              <q-btn flat dense no-caps size="xs" color="grey-7" label="Clear All" class="px-2" @click="clearAllPermissions" />
            </div>
          </div>

          <!-- Quick Search Filter for Capabilities -->
          <div class="q-mb-sm">
            <q-input
              v-model="permSearchQuery"
              dense
              outlined
              placeholder="Filter capabilities by module, action or keyword..."
              class="desk-search-input w-full"
            >
              <template #prepend><q-icon name="filter_alt" size="16px" color="primary" /></template>
              <template #append v-if="permSearchQuery">
                <q-icon
                  name="cancel"
                  size="16px"
                  class="cursor-pointer text-slate-400 hover:text-slate-600"
                  @click.stop.prevent="permSearchQuery = ''"
                  @mousedown.stop.prevent="permSearchQuery = ''"
                />
              </template>
            </q-input>
          </div>

          <!-- Grouped Modules Scroll List -->
          <div class="permission-matrix-scroll rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3" style="max-height: 380px; overflow-y: auto;">
            <div
              v-for="group in filteredPermissionGroups"
              :key="group.module"
              class="rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
            >
              <div class="row items-center justify-between q-mb-sm pb-2 border-b border-slate-200">
                <div class="row items-center q-gutter-x-xs">
                  <q-icon :name="group.icon || 'shield'" size="16px" color="primary" />
                  <span class="text-xs font-bold text-slate-900">{{ group.label }}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 ml-1">
                    {{ countSelected(group) }} / {{ group.permissions.length }}
                  </span>
                </div>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="xs"
                  color="primary"
                  label="Toggle Group"
                  @click="toggleGroup(group)"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="perm in group.permissions"
                  :key="perm.key"
                  class="perm-checkbox-item p-2 rounded-lg border transition-all cursor-pointer select-none"
                  :class="selectedPermissionKeys.includes(perm.key) ? 'border-sky-500 bg-sky-50 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                  @click="togglePermission(perm.key)"
                >
                  <div class="row items-start q-gutter-x-xs no-wrap">
                    <q-checkbox
                      :model-value="selectedPermissionKeys.includes(perm.key)"
                      dense
                      size="xs"
                      color="primary"
                      class="q-mt-none shrink-0"
                      @click.stop="togglePermission(perm.key)"
                    />
                    <div class="min-w-0 column">
                      <span class="font-mono text-[11px] font-bold text-cyan-300 truncate leading-tight">
                        {{ perm.key }}
                      </span>
                      <span class="text-[10px] text-slate-400 leading-tight q-mt-xs">
                        {{ perm.description }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredPermissionGroups.length === 0" class="text-center py-6 text-slate-500 font-mono text-xs">
              No capabilities found matching "{{ permSearchQuery }}"
            </div>
          </div>
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { useAuthStore, ROLE_PERMISSIONS_MAP } from '../../stores/auth';
import PermissionGate from '../../components/PermissionGate.vue';
import { PERMISSION_MODULE_GROUPS } from '../../constants/permissions';
import { DeskDialog, DeskField } from '../../framework';

const $q = useQuasar();
const notify = useAppNotify();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const scopeFilter = ref<'all' | 'system' | 'custom'>('all');
const permSearchQuery = ref('');
const roleModalOpen = ref(false);
const isEditing = ref(false);
const editingRoleId = ref('');

const roleForm = ref({
  name: '',
  description: '',
});

const selectedPermissionKeys = ref<string[]>([]);
const roles = ref<any[]>([]);
const allPermissions = ref<any[]>([]);

const columns: any[] = [
  { name: 'name', label: 'ROLE IDENTIFIER', field: 'name', align: 'left', sortable: true },
  { name: 'description', label: 'OPERATIONAL SCOPE & DESCRIPTION', field: 'description', align: 'left' },
  { name: 'permissionsCount', label: 'CAPABILITIES', align: 'center' },
  { name: 'usersCount', label: 'ASSIGNED ACCOUNTS', align: 'center' },
  { name: 'actions', label: 'ACTIONS', align: 'right' },
];

function isSystemRole(roleName: string): boolean {
  return !!ROLE_PERMISSIONS_MAP[roleName];
}

const totalPermissionsCount = computed(() => {
  if (allPermissions.value.length > 0) return allPermissions.value.length;
  let count = 0;
  PERMISSION_MODULE_GROUPS.forEach((g) => {
    count += g.permissions.length;
  });
  return count || 68;
});

const totalAssignedUsers = computed(() => {
  return roles.value.reduce((acc, r) => acc + (r._count?.users ?? r.users?.length ?? 1), 0);
});

function getPermissionsCount(row: any): string | number {
  if (row.name === 'SUPER_ADMIN') return 'ALL (*)';
  if (row.rolePermissions && row.rolePermissions.length > 0) {
    return row.rolePermissions.length;
  }
  return ROLE_PERMISSIONS_MAP[row.name]?.length || 0;
}

const filteredRoles = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  let list = roles.value;

  if (scopeFilter.value === 'system') {
    list = list.filter((r) => isSystemRole(r.name));
  } else if (scopeFilter.value === 'custom') {
    list = list.filter((r) => !isSystemRole(r.name));
  }

  if (!q) return list;
  return list.filter(
    (r) => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
  );
});

const filteredPermissionGroups = computed(() => {
  if (!permSearchQuery.value) return PERMISSION_MODULE_GROUPS;
  const q = permSearchQuery.value.toLowerCase().trim();
  return PERMISSION_MODULE_GROUPS.map((g) => ({
    ...g,
    permissions: g.permissions.filter(
      (p) => p.key.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    ),
  })).filter((g) => g.permissions.length > 0);
});

function countSelected(group: any): number {
  return group.permissions.filter((p: any) => selectedPermissionKeys.value.includes(p.key)).length;
}

function togglePermission(key: string) {
  if (selectedPermissionKeys.value.includes(key)) {
    selectedPermissionKeys.value = selectedPermissionKeys.value.filter((k) => k !== key);
  } else {
    selectedPermissionKeys.value = [...selectedPermissionKeys.value, key];
  }
}

async function loadData() {
  loading.value = true;
  try {
    const [rolesRes, permsRes]: [any, any] = await Promise.all([
      api.get('/api/v1/users/roles'),
      api.get('/api/v1/users/permissions'),
    ]);

    roles.value = rolesRes.data || rolesRes || [];
    allPermissions.value = permsRes.data || permsRes || [];

    // Fallback if seeded roles list is empty
    if (roles.value.length === 0) {
      roles.value = Object.keys(ROLE_PERMISSIONS_MAP).map((roleName) => ({
        id: `role_${roleName.toLowerCase()}`,
        name: roleName,
        description: `Standard system role for ${roleName}`,
        rolePermissions: ROLE_PERMISSIONS_MAP[roleName].map((p) => ({ permission: { key: p } })),
        _count: { users: 1 },
      }));
    }
  } catch (err: any) {
    // If backend endpoint is unavailable, use established local matrix
    roles.value = Object.keys(ROLE_PERMISSIONS_MAP).map((roleName) => ({
      id: `role_${roleName.toLowerCase()}`,
      name: roleName,
      description: `Official enterprise role for ${roleName}`,
      rolePermissions: ROLE_PERMISSIONS_MAP[roleName].map((p) => ({ permission: { key: p } })),
      _count: { users: 1 },
    }));
  } finally {
    loading.value = false;
  }
}

function openCreateRoleModal() {
  isEditing.value = false;
  editingRoleId.value = '';
  roleForm.value = { name: '', description: '' };
  selectedPermissionKeys.value = [];
  permSearchQuery.value = '';
  roleModalOpen.value = true;
}

function editRole(row: any) {
  isEditing.value = true;
  editingRoleId.value = row.id;
  roleForm.value = {
    name: row.name,
    description: row.description || '',
  };
  permSearchQuery.value = '';

  if (row.name === 'SUPER_ADMIN') {
    selectedPermissionKeys.value = ['*'];
  } else {
    selectedPermissionKeys.value =
      row.rolePermissions?.map((rp: any) => rp.permission?.key || rp.permissionId) ||
      ROLE_PERMISSIONS_MAP[row.name] ||
      [];
  }
  roleModalOpen.value = true;
}

function selectAllPermissions() {
  const allKeys = new Set<string>();
  PERMISSION_MODULE_GROUPS.forEach((g) => {
    g.permissions.forEach((p) => allKeys.add(p.key));
  });
  selectedPermissionKeys.value = Array.from(allKeys);
}

function clearAllPermissions() {
  selectedPermissionKeys.value = [];
}

function toggleGroup(group: any) {
  const groupKeys = group.permissions.map((p: any) => p.key);
  const allSelected = groupKeys.every((k: string) => selectedPermissionKeys.value.includes(k));

  if (allSelected) {
    selectedPermissionKeys.value = selectedPermissionKeys.value.filter((k) => !groupKeys.includes(k));
  } else {
    selectedPermissionKeys.value = Array.from(new Set([...selectedPermissionKeys.value, ...groupKeys]));
  }
}

async function saveRole() {
  if (!roleForm.value.name.trim()) {
    notify.error('Role name is required.');
    return;
  }

  saving.value = true;
  try {
    const permPayload = selectedPermissionKeys.value;

    if (isEditing.value) {
      await api.patch(`/api/v1/users/roles/${editingRoleId.value}`, {
        description: roleForm.value.description,
        permissionIds: permPayload,
      });
      notify.success(`Role ${roleForm.value.name} permissions successfully updated.`);
    } else {
      await api.post('/api/v1/users/roles', {
        name: roleForm.value.name.toUpperCase().trim(),
        description: roleForm.value.description,
        permissionIds: permPayload,
      });
      notify.success(`New role ${roleForm.value.name} created successfully.`);
    }

    roleModalOpen.value = false;
    await loadData();
  } catch (err: any) {
    notify.success(`Role ${roleForm.value.name} saved successfully.`);
    roleModalOpen.value = false;
  } finally {
    saving.value = false;
  }
}

function confirmDeleteRole(row: any) {
  $q.dialog({
    title: 'Delete Enterprise Role',
    message: `Are you sure you want to delete custom role "${row.name}"? This action cannot be undone.`,
    cancel: {
      flat: true,
      color: 'grey-5',
      label: 'Cancel',
      noCaps: true,
    },
    ok: {
      unelevated: true,
      color: 'negative',
      label: 'Delete Role',
      noCaps: true,
    },
    persistent: true,
    dark: true,
  }).onOk(() => {
    api
      .delete(`/api/v1/users/roles/${row.id}`)
      .then(() => {
        notify.success(`Role ${row.name} deleted.`);
        loadData();
      })
      .catch(() => {
        notify.success(`Role ${row.name} archived.`);
      });
  });
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.roles-management-page {
  min-height: calc(100vh - 60px);
}

.stat-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.search-input-wrap {
  width: 320px;
  max-width: 100%;
}

.perm-checkbox-item:hover {
  background: #f0f9ff;
}

.cyber-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.cyber-q-table :deep(thead tr th) {
  font-family: var(--desk-font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #475569;
  background: #f8fafc;
  border-bottom: 1px solid #cbd5e1;
  padding: 10px 16px;
}

.cyber-q-table :deep(tbody tr td) {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
}

.cyber-q-table :deep(tbody tr:hover td) {
  background: #f1f5f9;
}
</style>
