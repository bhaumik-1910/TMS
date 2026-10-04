<template>
  <div class="workflow-card">
    <!-- Header -->
    <div class="workflow-header">
      <div class="flex items-center gap-2">
        <div class="workflow-icon-box">
          <q-icon name="hub" size="18px" class="text-cyan-300" />
        </div>
        <div>
          <div class="text-sm font-bold text-white tracking-wide font-sans">
            Workflow State Machine & Lifecycle
          </div>
          <div class="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
            <span>Current Phase:</span>
            <span class="status-tag">{{ currentState }}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="stage-counter font-mono">
          Stage {{ currentStepIndex + 1 }} / {{ steps.length }}
        </span>
        <AppStatusBadge :status="currentState" />
      </div>
    </div>

    <!-- Stepper Flow - Guaranteed Single Line, Responsive Cyber Track -->
    <div class="stepper-container">
      <!-- Background Connecting Rail -->
      <div class="stepper-rail-bg"></div>
      <!-- Active Progress Rail -->
      <div
        class="stepper-rail-progress"
        :style="{ width: progressPercent + '%' }"
      ></div>

      <!-- Step Nodes -->
      <div
        v-for="(step, idx) in steps"
        :key="step"
        class="step-node-col"
      >
        <!-- Node Circle -->
        <div
          class="step-node-circle"
          :class="{
            'step-node-completed': isCompleted(step),
            'step-node-current': isCurrent(step),
            'step-node-pending': !isCompleted(step) && !isCurrent(step),
          }"
        >
          <q-icon v-if="isCompleted(step)" name="check" size="14px" />
          <span v-else>{{ idx + 1 }}</span>
        </div>

        <!-- Node Label -->
        <div
          class="step-node-label"
          :class="{
            'label-completed': isCompleted(step),
            'label-current': isCurrent(step),
            'label-pending': !isCompleted(step) && !isCurrent(step),
          }"
        >
          {{ formatStepName(step) }}
        </div>
      </div>
    </div>

    <!-- Action Bar / Next Step Transition -->
    <div class="workflow-actions-bar">
      <div class="flex items-center gap-2">
        <q-icon name="verified_user" size="16px" class="text-cyan-400" />
        <span class="text-xs text-slate-300 font-medium">
          Next step authorized for your role:
        </span>
      </div>

      <div v-if="availableTransitions && availableTransitions.length > 0" class="flex items-center gap-2">
        <button
          v-for="trans in availableTransitions"
          :key="trans.to || trans.nextState"
          type="button"
          class="cyber-action-btn"
          :disabled="loading"
          @click="onTransition(trans)"
        >
          <q-spinner v-if="loading" size="14px" class="q-mr-xs" />
          <q-icon v-else name="bolt" size="15px" class="q-mr-xs" />
          <span>{{ trans.actionLabel || trans.actionName || 'Proceed Next Stage' }}</span>
        </button>
      </div>

      <div v-else class="text-xs text-slate-400 font-mono italic flex items-center gap-1.5">
        <q-icon name="hourglass_empty" size="14px" class="text-slate-400" />
        <span>Awaiting action from next responsible role (Driver / Dispatcher)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  (e: 'transition', transitionPayload: any, label: string): void;
}>();

const currentStepIndex = computed(() => {
  const idx = props.steps.indexOf(props.currentState);
  return idx !== -1 ? idx : 0;
});

const progressPercent = computed(() => {
  if (props.steps.length <= 1) return 0;
  const pct = (currentStepIndex.value / (props.steps.length - 1)) * 100;
  return Math.min(Math.max(pct, 0), 100);
});

function formatStepName(name: string): string {
  return name.replace('_', ' ');
}

function isCompleted(step: string): boolean {
  const stepIndex = props.steps.indexOf(step);
  return stepIndex !== -1 && stepIndex < currentStepIndex.value;
}

function isCurrent(step: string): boolean {
  return props.currentState === step;
}

function onTransition(trans: any) {
  const targetState = trans.to || trans.nextState;
  const label = trans.actionLabel || trans.actionName;
  emit('transition', trans, label);
}
</script>

<style scoped>
.workflow-card {
  background: linear-gradient(135deg, rgba(11, 20, 44, 0.95) 0%, rgba(7, 13, 29, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.22);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  margin-bottom: 16px;
}

.workflow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.workflow-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-tag {
  color: #00f2fe;
  font-weight: 700;
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
}

.stage-counter {
  font-size: 11px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Stepper Track */
.stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 24px 8px 12px 8px;
  user-select: none;
}

.stepper-rail-bg {
  position: absolute;
  top: 38px;
  left: 24px;
  right: 24px;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  z-index: 1;
}

.stepper-rail-progress {
  position: absolute;
  top: 38px;
  left: 24px;
  max-width: calc(100% - 48px);
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #00f2fe 70%, #38bdf8 100%);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.6);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.step-node-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 3;
  min-width: 60px;
}

.step-node-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-family: monospace;
  font-weight: 700;
  transition: all 0.3s ease;
}

.step-node-completed {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  border: 2px solid #34d399;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.45);
}

.step-node-current {
  background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
  color: #030816;
  border: 2px solid #e0f2fe;
  box-shadow: 0 0 18px rgba(0, 242, 254, 0.7);
  transform: scale(1.15);
  font-weight: 800;
}

.step-node-pending {
  background: #0d172e;
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.step-node-label {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-top: 8px;
  text-align: center;
  white-space: nowrap;
}

.label-completed {
  color: #34d399;
}

.label-current {
  color: #00f2fe;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(0, 242, 254, 0.5);
}

.label-pending {
  color: #64748b;
}

/* Actions Footer */
.workflow-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cyber-action-btn {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #00f2fe 0%, #38bdf8 50%, #2563eb 100%);
  color: #030816;
  font-weight: 800;
  font-size: 12px;
  font-family: monospace;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  box-shadow: 0 0 14px rgba(0, 242, 254, 0.4);
  transition: all 0.2s ease;
}

.cyber-action-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.6);
}

.cyber-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
