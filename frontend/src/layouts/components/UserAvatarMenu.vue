<template>
  <div class="user-avatar-wrapper">
    <q-btn flat round dense no-caps class="user-avatar-btn q-ml-xs">
      <!-- High-Contrast Clean Circular Avatar -->
      <div class="avatar-ring-container">
        <div class="avatar-core">
          <span class="avatar-initials font-mono">{{ userInitials }}</span>
        </div>
        <!-- Live Online Status Pip -->
        <span class="avatar-status-pip"></span>
      </div>

      <!-- Professional White Dropdown Menu -->
      <q-menu
        anchor="bottom end"
        self="top end"
        :offset="[0, 8]"
        class="user-profile-menu bg-white text-slate-800"
      >
        <!-- User Profile Header Card -->
        <div class="p-4 border-b border-slate-200 bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="avatar-core-lg">
              <span class="avatar-initials-lg font-mono">{{ userInitials }}</span>
              <span class="avatar-status-pip-lg"></span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-bold text-slate-900 truncate tracking-wide font-sans">
                {{ userName }}
              </div>
              <div class="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                {{ userEmail }}
              </div>
              <div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                  {{ formattedRole }}
                </span>
                <span class="text-[10px] font-mono text-slate-400">
                  ID: #{{ authStore.user?.id ? String(authStore.user.id).slice(0, 6) : 'SYS-101' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Session Telemetry Banner -->
          <div class="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span class="flex items-center gap-1 text-emerald-700 font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              SYSTEM ONLINE
            </span>
            <span class="text-slate-400">GATEWAY 200 OK</span>
          </div>
        </div>

        <!-- Menu Action Navigation -->
        <div class="py-1.5 px-1 space-y-0.5 text-xs font-mono">
          <q-item
            clickable
            v-close-popup
            to="/settings"
            class="profile-menu-item rounded-lg"
          >
            <q-item-section avatar style="min-width: 28px;">
              <q-icon name="person" size="16px" color="primary" />
            </q-item-section>
            <q-item-section class="text-slate-700 font-sans font-medium">User Profile & Security</q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="14px" color="grey-6" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            to="/admin/users"
            class="profile-menu-item rounded-lg"
            v-if="authStore.currentRole === 'SUPER_ADMIN' || authStore.currentRole === 'ADMIN'"
          >
            <q-item-section avatar style="min-width: 28px;">
              <q-icon name="badge" size="16px" color="primary" />
            </q-item-section>
            <q-item-section class="text-slate-700 font-sans font-medium">Identity & Access Control</q-item-section>
            <q-item-section side>
              <span class="text-[9px] font-mono text-sky-800 bg-sky-100 border border-sky-200 px-1 rounded font-bold">ADMIN</span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            to="/dashboard"
            class="profile-menu-item rounded-lg"
          >
            <q-item-section avatar style="min-width: 28px;">
              <q-icon name="dashboard" size="16px" color="primary" />
            </q-item-section>
            <q-item-section class="text-slate-700 font-sans font-medium">Operations Command Deck</q-item-section>
          </q-item>
        </div>

        <div class="p-1 border-t border-slate-200">
          <q-item
            clickable
            v-close-popup
            class="profile-menu-item profile-menu-item--logout rounded-lg"
            @click="handleLogout"
          >
            <q-item-section avatar style="min-width: 28px;">
              <q-icon name="logout" size="16px" color="negative" />
            </q-item-section>
            <q-item-section class="text-rose-600 font-sans font-bold">Sign Out</q-item-section>
            <q-item-section side>
              <span class="text-[10px] font-mono text-slate-400">Ctrl+Q</span>
            </q-item-section>
          </q-item>
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userName = computed(() => {
  if (authStore.user) {
    return `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim() || 'Admin User';
  }
  return 'Admin User';
});

const userEmail = computed(() => authStore.user?.email || 'admin@tms.com');

const userInitials = computed(() => {
  const parts = userName.value.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] || 'AD').toUpperCase();
});

const formattedRole = computed(() => {
  const r = authStore.currentRole || 'ADMIN';
  return r.replace(/_/g, ' ');
});

function handleLogout() {
  authStore.logout();
  router.push('/auth/login');
}
</script>

<style scoped>
.user-avatar-wrapper {
  display: inline-flex;
  align-items: center;
}

.user-avatar-btn {
  padding: 0 !important;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.avatar-ring-container {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-core {
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: #0284c7;
  border: 1.5px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.user-avatar-btn:hover .avatar-core {
  border-color: #0284c7;
  box-shadow: 0 0 8px rgba(2, 132, 199, 0.3);
  transform: scale(1.05);
}

.avatar-initials {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
  user-select: none;
}

/* Online Status Pip */
.avatar-status-pip {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  background: #10b981;
  border: 1.5px solid #ffffff;
}

/* Large Avatar in Dropdown */
.avatar-core-lg {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: #0284c7;
  border: 2px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials-lg {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #ffffff;
}

.avatar-status-pip-lg {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 9999px;
  background: #10b981;
  border: 2px solid #ffffff;
}

/* Dropdown Menu Container */
:deep(.user-profile-menu),
.user-profile-menu {
  min-width: 270px !important;
  max-width: 320px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
  overflow: hidden;
}

.profile-menu-item {
  color: #334155;
  min-height: 36px;
  padding: 8px 12px;
  transition: all 0.12s ease;
}

.profile-menu-item:hover {
  background: #f1f5f9 !important;
  color: #0284c7 !important;
}

.profile-menu-item--logout:hover {
  background: #fff1f2 !important;
  color: #e11d48 !important;
}
</style>
