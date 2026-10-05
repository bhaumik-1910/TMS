<template>
  <footer class="desk-status-bar font-mono select-none">
    <div class="row items-center q-gutter-x-md no-wrap">
      <!-- Active Organization -->
      <span class="status-chip highlight">
        <q-icon name="apartment" size="13px" class="q-mr-xs text-cyan-4" />
        <strong>{{ orgName }}</strong>
      </span>

      <!-- Financial Period -->
      <span class="status-chip">
        <q-icon name="date_range" size="13px" class="q-mr-xs text-slate-400" />
        FY 2026-27 (1-Apr-2026 to 31-Mar-2027)
      </span>

      <!-- User & Role -->
      <span class="status-chip">
        <q-icon name="account_circle" size="13px" class="q-mr-xs text-cyan-4" />
        {{ userName }} &bull; <span class="text-cyan-3">{{ roleName }}</span>
      </span>
    </div>

    <!-- Right Side: Key Shortcuts Legend -->
    <div class="row items-center q-gutter-x-sm no-wrap text-caption status-keys">
      <span><kbd>Alt+M</kbd> Masters</span>
      <span><kbd>Alt+O</kbd> Operations</span>
      <span><kbd>Alt+G</kbd> Go To</span>
      <span><kbd>F2</kbd> Date</span>
      <span><kbd>Ctrl+A</kbd> Accept</span>
      <span><kbd>Esc</kbd> Quit</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const orgName = computed(() => {
  return authStore.user?.organization?.name || 'ANKPAL FREIGHT SYSTEM';
});

const userName = computed(() => {
  const u = authStore.user;
  if (!u) return 'ADMIN';
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  return name || u.email || 'ADMIN';
});

const roleName = computed(() => {
  return authStore.activeRole || 'OPERATIONS_MANAGER';
});
</script>

<style scoped>
.desk-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  background: #f8fafc;
  border-top: 1px solid #cbd5e1;
  padding: 0 12px;
  font-size: 0.72rem;
  color: #475569;
  z-index: 100;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  color: #334155;
}

.status-chip.highlight {
  color: #0284c7;
  font-weight: 700;
}

.status-keys {
  color: #64748b;
  font-size: 0.68rem;
}

.status-keys kbd {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0284c7;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
