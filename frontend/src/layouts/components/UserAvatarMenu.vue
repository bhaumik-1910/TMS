<template>
  <div class="user-avatar-wrapper">
    <q-btn flat round dense no-caps class="user-avatar-btn q-ml-xs">
      <!-- Cyber-Luxe Circular Avatar -->
      <div class="avatar-ring-container">
        <div class="avatar-core">
          <span class="avatar-initials font-mono">{{ userInitials }}</span>
        </div>
        <!-- Live Online Status Pip -->
        <span class="avatar-status-pip"></span>
      </div>

      <!-- Executive Cyber-Dark Dropdown Menu -->
      <q-menu
        anchor="bottom end"
        self="top end"
        :offset="[0, 8]"
        class="user-profile-menu bg-[#0d172b] text-slate-100"
      >
        <!-- User Profile Header Card -->
        <div class="p-4 border-b border-slate-800/80 bg-slate-950/60">
          <div class="flex items-center gap-3">
            <div class="avatar-core-lg">
              <span class="avatar-initials-lg font-mono">{{ userInitials }}</span>
              <span class="avatar-status-pip-lg"></span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-bold text-white truncate tracking-wide font-sans">
                {{ userName }}
              </div>
              <div class="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                {{ userEmail }}
              </div>
              <div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  {{ formattedRole }}
                </span>
                <span class="text-[10px] font-mono text-slate-500">
                  ID: #{{ authStore.user?.id ? String(authStore.user.id).slice(0, 6) : 'SYS-101' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Session Telemetry Banner -->
          <div class="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span class="flex items-center gap-1 text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
              SYSTEM ONLINE
            </span>
            <span class="text-slate-500">GATEWAY 200 OK</span>
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
              <q-icon name="person" size="16px" color="cyan" />
            </q-item-section>
            <q-item-section class="text-slate-200 font-sans font-medium">User Profile & Security</q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="14px" color="slate-600" />
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
              <q-icon name="badge" size="16px" color="cyan" />
            </q-item-section>
            <q-item-section class="text-slate-200 font-sans font-medium">Identity & Access Control</q-item-section>
            <q-item-section side>
              <span class="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1 rounded">ADMIN</span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-close-popup
            to="/dashboard"
            class="profile-menu-item rounded-lg"
          >
            <q-item-section avatar style="min-width: 28px;">
              <q-icon name="dashboard" size="16px" color="cyan" />
            </q-item-section>
            <q-item-section class="text-slate-200 font-sans font-medium">Operations Command Deck</q-item-section>
          </q-item>
        </div>

        <div class="p-1 border-t border-slate-800/80">
          <q-item
            clickable
            v-close-popup
            class="profile-menu-item profile-menu-item--logout rounded-lg"
            @click="handleLogout"
          >
            <q-item-section avatar style="min-width: 28px;">
              <q-icon name="logout" size="16px" color="rose-4" />
            </q-item-section>
            <q-item-section class="text-rose-400 font-sans font-bold">Sign Out</q-item-section>
            <q-item-section side>
              <span class="text-[10px] font-mono text-slate-500">Ctrl+Q</span>
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
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-core {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #07223b 0%, #0369a1 55%, #00f2fe 100%);
  border: 1.5px solid rgba(0, 242, 254, 0.6);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.user-avatar-btn:hover .avatar-core {
  border-color: #00f2fe;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.avatar-initials {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
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
  border: 1.5px solid #000000;
  box-shadow: 0 0 6px #10b981;
}

/* Large Avatar in Dropdown */
.avatar-core-lg {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #07223b 0%, #0369a1 55%, #00f2fe 100%);
  border: 2px solid rgba(0, 242, 254, 0.7);
  box-shadow: 0 0 14px rgba(0, 242, 254, 0.4);
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
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.avatar-status-pip-lg {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 9999px;
  background: #10b981;
  border: 2px solid #0d172b;
  box-shadow: 0 0 8px #10b981;
}

/* Cyber-Luxe Dropdown Menu Container */
:deep(.user-profile-menu),
.user-profile-menu {
  min-width: 270px !important;
  max-width: 320px !important;
  background: #0d172b !important;
  border: 1px solid #1a2744 !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(0, 242, 254, 0.15) !important;
  overflow: hidden;
}

.profile-menu-item {
  color: #cbd5e1;
  min-height: 36px;
  padding: 8px 12px;
  transition: all 0.15s ease;
}

.profile-menu-item:hover {
  background: rgba(0, 242, 254, 0.08) !important;
  color: #00f2fe !important;
}

.profile-menu-item--logout:hover {
  background: rgba(244, 63, 94, 0.12) !important;
  color: #fb7185 !important;
}
</style>
