<template>
  <template v-if="isAllowed">
    <slot />
  </template>
  <template v-else>
    <slot name="fallback" />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps<{
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  role?: string;
}>();

const authStore = useAuthStore();

const isAllowed = computed(() => {
  // Super Admin wildcard grants access to all gated components
  if (authStore.isSuperAdmin) return true;

  if (props.role && !authStore.hasRole(props.role)) {
    return false;
  }

  if (props.permission && !authStore.hasPermission(props.permission)) {
    return false;
  }

  if (props.anyPermissions && props.anyPermissions.length > 0) {
    if (!authStore.hasAnyPermission(...props.anyPermissions)) {
      return false;
    }
  }

  if (props.allPermissions && props.allPermissions.length > 0) {
    if (!authStore.hasAllPermissions(...props.allPermissions)) {
      return false;
    }
  }

  return true;
});
</script>
