<template>
  <div class="row full-height window-height flex-center bg-slate-50 q-pa-lg text-center">
    <div style="max-width: 520px;">
      <!-- Shield / Key Icon -->
      <div class="q-mb-md">
        <q-avatar size="84px" color="red-1" text-color="negative">
          <q-icon name="gpp_bad" size="48px" />
        </q-avatar>
      </div>

      <div class="text-caption font-mono text-weight-bold text-negative text-uppercase q-mb-xs" style="letter-spacing: 0.1em;">
        HTTP 403 FORBIDDEN
      </div>

      <h1 class="text-h4 text-weight-bolder text-slate-900 q-ma-none q-mb-sm">
        Access Restricted
      </h1>

      <p class="text-body2 text-slate-600 q-mb-lg leading-normal">
        Your current role (<strong class="text-slate-900 font-mono">{{ authStore.currentRole }}</strong>) does not have the required permissions to access this enterprise module or perform this action.
      </p>

      <q-card flat bordered class="q-pa-md bg-white q-mb-xl text-left rounded-borders" style="border-color: #e2e8f0;">
        <div class="row items-center justify-between text-caption">
          <span class="text-grey-6">Active Organization:</span>
          <strong class="text-slate-800">{{ authStore.organizationName }}</strong>
        </div>
        <div class="row items-center justify-between text-caption q-mt-xs">
          <span class="text-grey-6">Role Scope:</span>
          <q-badge color="primary" class="font-mono">{{ authStore.currentRole }}</q-badge>
        </div>
      </q-card>

      <div class="row justify-center q-gutter-sm">
        <q-btn
          color="primary"
          unelevated
          no-caps
          label="Return to Dashboard"
          icon="dashboard"
          to="/dashboard"
          class="text-weight-bold"
        />
        <q-btn
          outline
          color="slate-800"
          no-caps
          label="Switch Persona Role"
          icon="manage_accounts"
          to="/auth/login"
          class="bg-white"
        />
      </div>

      <div class="text-caption text-grey-5 q-mt-xl font-mono" style="font-size: 0.7rem;">
        Security Audit Event Logged • Organization Isolation Policy Enforced
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
</script>
