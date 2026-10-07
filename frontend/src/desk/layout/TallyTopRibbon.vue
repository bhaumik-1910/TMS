<template>
  <header class="tally-ribbon text-white select-none">
    <!-- Top Bar: Tally Golden / Teal Header with Company & Financial Year -->
    <div class="tally-ribbon-top row items-center justify-between no-wrap q-px-sm">
      <!-- Left: Logo & Company / Operational Details -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <div
          class="tally-badge-logo flex flex-center cursor-pointer"
          @click="$router.push('/dashboard')"
          title="Tally Gateway (Alt+G)"
        >
          <span class="text-weight-bolder font-mono">T</span>
        </div>

        <div class="row items-center q-gutter-x-xs">
          <span class="tally-company-name font-mono text-weight-bold tracking-tight">
            {{ activeOrgName }}
          </span>
          <span class="tally-period-tag font-mono">
            FY 2026-27
          </span>
        </div>
      </div>

      <!-- Center: Tally Top Commands (Company Alt+K, Data Alt+Y, Go To Alt+G, Import Alt+O, Export Alt+E) -->
      <div class="row items-center q-gutter-x-xs no-wrap tally-cmd-bar">
        <button
          type="button"
          class="tally-cmd-btn"
          @click="openOrgDialog"
          title="Company Management (Alt+K)"
        >
          <u>K</u>: Company
        </button>

        <button
          type="button"
          class="tally-cmd-btn"
          @click="openDateDialog"
          title="Change Period / Date (F2)"
        >
          <u>F2</u>: Date
        </button>

        <button
          type="button"
          class="tally-cmd-btn highlight-goto"
          @click="openGoTo"
          title="Go To Navigation Palette (Alt+G / Ctrl+K)"
        >
          <u>G</u>: Go To
        </button>

        <button
          type="button"
          class="tally-cmd-btn"
          @click="triggerExport"
          title="Export Active Grid to Excel (Alt+E)"
        >
          <u>E</u>: Export
        </button>

        <button
          type="button"
          class="tally-cmd-btn"
          @click="openKeysDialog"
          title="Keyboard Shortcuts Guide (F1)"
        >
          <u>F1</u>: Help
        </button>
      </div>

      <!-- Right: User & Status Tags -->
      <div class="row items-center q-gutter-x-sm no-wrap text-caption font-mono">
        <span class="tally-status-pill text-cyan-4">
          <span class="pulse-dot"></span>
          ONLINE
        </span>
        <span class="text-slate-300 text-xs text-weight-medium">
          {{ userName }}
        </span>
      </div>
    </div>

    <!-- Sub Bar: Navigation Menus with Underlined Accelerators -->
    <div class="tally-ribbon-sub row items-center justify-between no-wrap q-px-sm">
      <div class="row items-center q-gutter-x-xs no-wrap">
        <!-- Masters -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          size="sm"
          class="tally-menu-dropdown"
          content-class="tally-menu-popup"
        >
          <template #label>
            <span class="tally-menu-label"><u>M</u>asters</span>
          </template>
          <q-list dense class="tally-menu-list">
            <q-item clickable v-close-popup to="/fleet" class="tally-menu-item">
              <q-item-section avatar><q-icon name="local_shipping" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>V</u>ehicles & Fleet</q-item-section>
              <q-item-section side><kbd>V</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/drivers" class="tally-menu-item">
              <q-item-section avatar><q-icon name="badge" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>D</u>rivers Master</q-item-section>
              <q-item-section side><kbd>D</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/customers" class="tally-menu-item">
              <q-item-section avatar><q-icon name="people" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>C</u>ustomers / Debtors</q-item-section>
              <q-item-section side><kbd>C</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/carriers" class="tally-menu-item">
              <q-item-section avatar><q-icon name="business" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Carriers & <u>V</u>endors</q-item-section>
              <q-item-section side><kbd>P</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/routes" class="tally-menu-item">
              <q-item-section avatar><q-icon name="route" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>R</u>outes & Stations</q-item-section>
              <q-item-section side><kbd>R</kbd></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Operations (Transactions / Vouchers) -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          size="sm"
          class="tally-menu-dropdown"
          content-class="tally-menu-popup"
        >
          <template #label>
            <span class="tally-menu-label"><u>O</u>perations</span>
          </template>
          <q-list dense class="tally-menu-list">
            <q-item clickable v-close-popup to="/lr-consignments" class="tally-menu-item">
              <q-item-section avatar><q-icon name="receipt_long" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>L</u>orry Receipt (LR / Bilty)</q-item-section>
              <q-item-section side><kbd>L</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/orders" class="tally-menu-item">
              <q-item-section avatar><q-icon name="inventory_2" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Booking <u>O</u>rders</q-item-section>
              <q-item-section side><kbd>O</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/dispatch" class="tally-menu-item">
              <q-item-section avatar><q-icon name="send" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Loading & <u>D</u>ispatch</q-item-section>
              <q-item-section side><kbd>D</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/tracking" class="tally-menu-item">
              <q-item-section avatar><q-icon name="my_location" size="14px" color="cyan" /></q-item-section>
              <q-item-section>GPS <u>T</u>racking & Trips</q-item-section>
              <q-item-section side><kbd>T</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/pod" class="tally-menu-item">
              <q-item-section avatar><q-icon name="task_alt" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>P</u>OD & Delivery Proof</q-item-section>
              <q-item-section side><kbd>P</kbd></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Fleet & Fuel -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          size="sm"
          class="tally-menu-dropdown"
          content-class="tally-menu-popup"
        >
          <template #label>
            <span class="tally-menu-label"><u>F</u>leet Expenses</span>
          </template>
          <q-list dense class="tally-menu-list">
            <q-item clickable v-close-popup to="/fuel-entry" class="tally-menu-item">
              <q-item-section avatar><q-icon name="local_gas_station" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>F</u>uel Entry Voucher</q-item-section>
              <q-item-section side><kbd>F</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/driver-advances" class="tally-menu-item">
              <q-item-section avatar><q-icon name="payments" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Driver <u>A</u>dvances</q-item-section>
              <q-item-section side><kbd>A</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/maintenance" class="tally-menu-item">
              <q-item-section avatar><q-icon name="build" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Job Card & <u>M</u>aintenance</q-item-section>
              <q-item-section side><kbd>M</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/tyre-operations" class="tally-menu-item">
              <q-item-section avatar><q-icon name="trip_origin" size="14px" color="cyan" /></q-item-section>
              <q-item-section>T<u>y</u>re Operations</q-item-section>
              <q-item-section side><kbd>Y</kbd></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Billing & Accounts -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          size="sm"
          class="tally-menu-dropdown"
          content-class="tally-menu-popup"
        >
          <template #label>
            <span class="tally-menu-label"><u>B</u>illing</span>
          </template>
          <q-list dense class="tally-menu-list">
            <q-item clickable v-close-popup to="/billing" class="tally-menu-item">
              <q-item-section avatar><q-icon name="request_quote" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Customer Freight <u>I</u>nvoices</q-item-section>
              <q-item-section side><kbd>I</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/purchase-bills" class="tally-menu-item">
              <q-item-section avatar><q-icon name="shopping_cart" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>P</u>urchase & Vendor Bills</q-item-section>
              <q-item-section side><kbd>P</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/settlements" class="tally-menu-item">
              <q-item-section avatar><q-icon name="account_balance_wallet" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Trip <u>S</u>ettlements</q-item-section>
              <q-item-section side><kbd>S</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/accounting-sync" class="tally-menu-item">
              <q-item-section avatar><q-icon name="sync_alt" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Tally / ERP <u>Z</u> Sync</q-item-section>
              <q-item-section side><kbd>Z</kbd></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Reports & Admin -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          size="sm"
          class="tally-menu-dropdown"
          content-class="tally-menu-popup"
        >
          <template #label>
            <span class="tally-menu-label"><u>R</u>eports & Admin</span>
          </template>
          <q-list dense class="tally-menu-list">
            <q-item clickable v-close-popup to="/analytics" class="tally-menu-item">
              <q-item-section avatar><q-icon name="analytics" size="14px" color="cyan" /></q-item-section>
              <q-item-section>MIS & <u>A</u>nalytics</q-item-section>
              <q-item-section side><kbd>A</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/admin/users" class="tally-menu-item">
              <q-item-section avatar><q-icon name="manage_accounts" size="14px" color="cyan" /></q-item-section>
              <q-item-section><u>U</u>sers & Security</q-item-section>
              <q-item-section side><kbd>U</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/admin/roles" class="tally-menu-item">
              <q-item-section avatar><q-icon name="security" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Permissions <u>M</u>atrix</q-item-section>
              <q-item-section side><kbd>M</kbd></q-item-section>
            </q-item>
            <q-item clickable v-close-popup to="/audit-logs" class="tally-menu-item">
              <q-item-section avatar><q-icon name="history" size="14px" color="cyan" /></q-item-section>
              <q-item-section>Audit <u>L</u>ogs</q-item-section>
              <q-item-section side><kbd>L</kbd></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Quick Command Tip on Right -->
      <div class="tally-quick-hint">
        <kbd>Alt+G</kbd> Go To &bull; <kbd>Alt+F</kbd> Search &bull; <kbd>Alt+F3</kbd> Company &bull; <kbd>Ctrl+A</kbd> Accept
      </div>
    </div>

    <!-- Company Picker Modal (Alt+F3 / Alt+K) -->
    <CompanyPickerDialog
      v-model="showCompanySwitcher"
      :companies="availableCompanies"
      :current-company-id="currentCompanyId"
      :user-name="userName"
      :user-email="userEmail"
      :allow-close="true"
      @select="onSwitchCompany"
    />

    <!-- Keyboard Shortcuts Dialog (F1 / Ctrl+Alt+K) -->
    <DeskKeysDialog v-model="showKeysDialog" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import CompanyPickerDialog from '../components/CompanyPickerDialog.vue';
import DeskKeysDialog from '../keys/DeskKeysDialog.vue';

const router = useRouter();
const authStore = useAuthStore();

const showCompanySwitcher = ref(false);
const showKeysDialog = ref(false);
const availableCompanies = ref<any[]>([]);

const activeOrgName = computed(() => {
  return authStore.user?.organization?.name || 'Demo Roadways Pvt Ltd';
});

const currentCompanyId = computed(() => {
  return Number(authStore.user?.organization?.id) || 1;
});

const userName = computed(() => {
  const u = authStore.user;
  if (!u) return 'ADMIN';
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return name || u.email || 'ADMIN';
});

const userEmail = computed(() => {
  return authStore.user?.email || 'admin@demo.test';
});

function openGoTo() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
}

async function openOrgDialog() {
  const list = await authStore.fetchCompanies();
  if (list && list.length) {
    availableCompanies.value = list;
  } else if (authStore.availableOrganizations?.length) {
    availableCompanies.value = authStore.availableOrganizations;
  } else {
    // Default demo list fallback
    availableCompanies.value = [
      { companyId: 1, code: 'demo', name: 'Demo Roadways Pvt Ltd', role: 'Admin', licenseValidTo: '2027-10-07' },
      { companyId: 2, code: 'demo2', name: 'Second Logistics LLP', role: 'Admin', licenseValidTo: '2027-10-07' },
      { companyId: 3, code: 'swift', name: 'Swift Logistics Pvt Ltd', role: 'Admin', licenseValidTo: '2027-10-07' },
    ];
  }
  showCompanySwitcher.value = true;
}

async function onSwitchCompany(companyId: number) {
  try {
    await authStore.switchCompany(companyId);
    showCompanySwitcher.value = false;
    window.location.reload();
  } catch (err) {
    console.error('Failed to switch company:', err);
  }
}

function openDateDialog() {
  window.dispatchEvent(new CustomEvent('desk:open-date-dialog'));
}

function triggerExport() {
  window.dispatchEvent(new CustomEvent('desk:export-active-grid'));
}

function openKeysDialog() {
  showKeysDialog.value = true;
  window.dispatchEvent(new CustomEvent('desk:open-keys-dialog'));
}

function handleGlobalRibbonKeys(e: KeyboardEvent) {
  // Alt+F3 or Alt+K -> Switch Company
  if (e.altKey && (e.key === 'F3' || e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    e.stopPropagation();
    openOrgDialog();
    return;
  }

  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    const key = e.key.toLowerCase();
    switch (key) {
      case 'k':
        e.preventDefault();
        openOrgDialog();
        break;
      case 'g':
        e.preventDefault();
        openGoTo();
        break;
      case 'e':
        e.preventDefault();
        triggerExport();
        break;
      case 'm':
        e.preventDefault();
        router.push('/fleet');
        break;
      case 'o':
        e.preventDefault();
        router.push('/lr-consignments');
        break;
      case 'b':
        e.preventDefault();
        router.push('/billing');
        break;
      case 'r':
        e.preventDefault();
        router.push('/analytics');
        break;
    }
  } else if (e.key === 'F1' && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    openKeysDialog();
  } else if (e.key === 'F2' && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    openDateDialog();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalRibbonKeys);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalRibbonKeys);
});
</script>

<style scoped>
.tally-ribbon {
  background: #060c18;
  border-bottom: 1px solid rgba(0, 242, 254, 0.22);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tally-ribbon-top {
  height: 34px;
  background: #091322;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: inherit;
}

.tally-badge-logo {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #00f2fe, #0284c7);
  color: #030712;
  border-radius: 4px;
  font-size: 13px;
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.5);
}

.tally-company-name {
  font-size: 0.85rem;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.tally-period-tag {
  font-size: 0.68rem;
  background: rgba(0, 242, 254, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(0, 242, 254, 0.25);
  padding: 1px 6px;
  border-radius: 4px;
}

.tally-cmd-bar {
  display: flex;
  gap: 4px;
}

.tally-cmd-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.tally-cmd-btn:hover {
  background: rgba(0, 242, 254, 0.14);
  color: #00f2fe;
  border-color: rgba(0, 242, 254, 0.3);
}

.tally-cmd-btn.highlight-goto {
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.08);
  border-color: rgba(0, 242, 254, 0.25);
}

.tally-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 1px 6px;
  border-radius: 10px;
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 6px #10b981;
}

.tally-ribbon-sub {
  height: 28px;
  background: #060b14;
}

.tally-menu-dropdown {
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0 6px;
  border-radius: 4px;
}

.tally-menu-dropdown:hover {
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
}

.tally-quick-hint {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.65rem;
  color: #64748b;
}

.tally-quick-hint kbd {
  background: #111e33;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #38bdf8;
  padding: 1px 4px;
  border-radius: 3px;
}

:global(.tally-menu-popup) {
  background: #091322 !important;
  border: 1px solid rgba(0, 242, 254, 0.25) !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85) !important;
  min-width: 220px;
}

:global(.tally-menu-list) {
  padding: 4px 0;
}

:global(.tally-menu-item) {
  font-size: 0.8rem;
  color: #cbd5e1 !important;
  min-height: 30px;
  padding: 2px 10px;
  transition: all 0.12s ease;
}

:global(.tally-menu-item:hover) {
  background: rgba(0, 242, 254, 0.14) !important;
  color: #00f2fe !important;
}

:global(.tally-menu-item kbd) {
  font-size: 9px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #0f1c32;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #38bdf8;
  padding: 1px 5px;
  border-radius: 3px;
}
</style>
