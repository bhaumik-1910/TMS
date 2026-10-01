<template>
  <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
      <div>
        <div class="text-sm font-bold text-slate-900">Workflow State Machine & Lifecycle</div>
        <div class="text-xs text-slate-500">Current Phase: <span class="font-mono font-bold text-blue-600">{{ currentState }}</span></div>
      </div>
      <AppStatusBadge :status="currentState" />
    </div>

    <!-- Stepper Flow -->
    <div class="flex items-center justify-between overflow-x-auto py-2 mb-4 gap-2">
      <div
        v-for="(step, idx) in steps"
        :key="step"
        class="flex items-center shrink-0"
      >
        <div class="flex flex-col items-center">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            :class="isCompleted(step) ? 'bg-emerald-600 text-white shadow-sm' : isCurrent(step) ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'"
          >
            <span v-if="isCompleted(step)">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span
            class="text-[11px] font-semibold mt-1 tracking-tight"
            :class="isCurrent(step) ? 'text-blue-700 font-bold' : isCompleted(step) ? 'text-emerald-700' : 'text-slate-400'"
          >
            {{ formatStepName(step) }}
          </span>
        </div>
        <div
          v-if="idx < steps.length - 1"
          class="w-8 sm:w-12 h-0.5 mx-2 rounded"
          :class="isCompleted(steps[idx + 1]) || isCurrent(steps[idx + 1]) ? 'bg-emerald-500' : 'bg-slate-200'"
        ></div>
      </div>
    </div>

    <!-- Next Available Actions for Authenticated User -->
    <div v-if="availableTransitions.length > 0" class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
      <div class="text-xs text-slate-600 font-medium">
        Next step authorized for your role:
      </div>
      <div class="flex items-center gap-2">
        <q-btn
          v-for="trans in availableTransitions"
          :key="trans.to"
          color="primary"
          dense
          no-caps
          size="sm"
          class="text-weight-bold px-3 py-1"
          :loading="loading"
          @click="onTransition(trans.to, trans.actionLabel)"
        >
          <q-icon name="arrow_forward" size="14px" class="q-mr-xs" />
          {{ trans.actionLabel }}
        </q-btn>
      </div>
    </div>
    <div v-else class="pt-2 text-xs text-slate-400 italic text-right">
      Awaiting action from next responsible role
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppStatusBadge from './AppStatusBadge.vue';

const props = withDefaults(
  defineProps<{
    currentState: string;
    steps?: string[];
    availableTransitions?: any[];
    loading?: boolean;
  }>(),
  {
    steps: () => ['PLANNED', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'],
    availableTransitions: () => [],
    loading: false,
  },
);

const emit = defineEmits<{
  (e: 'transition', targetState: string, label: string): void;
}>();

function formatStepName(name: string): string {
  return name.replace('_', ' ');
}

function isCompleted(step: string): boolean {
  const currentIndex = props.steps.indexOf(props.currentState);
  const stepIndex = props.steps.indexOf(step);
  return stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex;
}

function isCurrent(step: string): boolean {
  return props.currentState === step;
}

function onTransition(targetState: string, label: string) {
  emit('transition', targetState, label);
}
</script>
