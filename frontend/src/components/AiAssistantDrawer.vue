<template>
  <div>
    <!-- Floating AI Trigger Button -->
    <q-btn
      round
      color="primary"
      icon="auto_awesome"
      size="lg"
      class="fixed-bottom-right q-ma-lg tms-ai-fab z-top"
      @click="isOpen = true"
    >
      <q-tooltip anchor="top middle" self="bottom middle">AI Transportation Assistant</q-tooltip>
    </q-btn>

    <!-- AI Dialog / Drawer -->
    <q-dialog v-model="isOpen" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width: 440px; max-width: 90vw;" class="column no-wrap full-height bg-white">
        <!-- AI Header -->
        <div class="row items-center justify-between q-pa-md bg-slate-900 text-white" style="background-color: #0f172a;">
          <div class="row items-center q-gutter-x-sm">
            <q-avatar size="32px" color="blue-7" text-color="white" icon="auto_awesome" />
            <div>
              <div class="text-subtitle2 text-weight-bold">TMS Intelligence AI</div>
              <div class="text-caption text-grey-4" style="font-size: 0.7rem;">Real-time Telemetry & Logistics Analysis</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense color="white" @click="isOpen = false" />
        </div>

        <!-- Chat Messages Area -->
        <q-scroll-area class="col q-pa-md bg-grey-1" style="background-color: #f8fafc;">
          <!-- Suggested Quick Prompts -->
          <div v-if="messages.length === 1" class="q-mb-md">
            <div class="text-caption text-weight-semibold text-grey-7 q-mb-sm text-uppercase" style="letter-spacing: 0.05em;">
              Suggested Operational Inquiries:
            </div>
            <div class="column q-gutter-y-xs">
              <q-btn
                v-for="(prompt, idx) in suggestedPrompts"
                :key="idx"
                flat
                dense
                no-caps
                align="left"
                class="bg-white tms-card q-pa-xs text-caption text-slate-800"
                @click="sendQuery(prompt)"
              >
                <q-icon name="subdirectory_arrow_right" size="14px" class="q-mr-xs text-primary" />
                {{ prompt }}
              </q-btn>
            </div>
          </div>

          <!-- Message bubbles -->
          <div v-for="(msg, i) in messages" :key="i" class="q-mb-md">
            <!-- User bubble -->
            <div v-if="msg.sender === 'user'" class="row justify-end q-mb-xs">
              <div class="bg-primary text-white q-pa-sm rounded-borders" style="max-width: 85%; font-size: 0.85rem; border-radius: 8px;">
                {{ msg.text }}
              </div>
            </div>

            <!-- AI bubble -->
            <div v-else class="row justify-start q-mb-xs">
              <div class="bg-white tms-card q-pa-md text-slate-900" style="max-width: 95%; font-size: 0.85rem; border-radius: 8px;">
                <div class="row items-center q-mb-xs text-caption text-weight-bold text-primary">
                  <q-icon name="auto_awesome" size="14px" class="q-mr-xs" />
                  TMS AI Agent
                </div>
                <div class="q-mb-sm" style="line-height: 1.45;">
                  {{ msg.text }}
                </div>

                <!-- Structured Data Card if response contains data -->
                <div v-if="msg.data && msg.data.length" class="q-mt-sm q-pa-xs bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
                  <div
                    v-for="(item, itemIdx) in msg.data"
                    :key="itemIdx"
                    class="q-pa-xs row justify-between text-caption font-mono"
                    style="border-bottom: 1px solid #f1f5f9;"
                  >
                    <span class="text-weight-medium">{{ item.shipmentNumber || item.vehicleNumber || item.name || item.metric || item.title }}</span>
                    <span class="text-grey-7">{{ item.status || item.capacityWeight || item.rating || item.value || item.type }}</span>
                  </div>
                </div>

                <!-- Suggested Action Chips -->
                <div v-if="msg.actions && msg.actions.length" class="q-mt-sm">
                  <div class="text-caption text-weight-semibold text-grey-6 q-mb-xs">Recommended Actions:</div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="(act, actIdx) in msg.actions"
                      :key="actIdx"
                      dense
                      size="sm"
                      color="indigo-1"
                      text-color="indigo-9"
                      icon="arrow_forward"
                    >
                      {{ act }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="row items-center q-gutter-x-sm text-caption text-grey-6 q-pa-sm">
            <q-spinner-dots size="20px" color="primary" />
            <span>Analyzing real-time logistics telemetry...</span>
          </div>
        </q-scroll-area>

        <!-- Input Bar -->
        <div class="q-pa-sm bg-white" style="border-top: 1px solid var(--surface-border);">
          <q-input
            v-model="inputQuery"
            dense
            outlined
            placeholder="Ask AI about shipments, delays, fleet, carriers..."
            class="full-width"
            :disable="loading"
            @keyup.enter="handleSend"
          >
            <template #append>
              <q-btn round dense flat icon="send" color="primary" :disable="!inputQuery.trim() || loading" @click="handleSend" />
            </template>
          </q-input>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../api/client';

const isOpen = ref(false);
const inputQuery = ref('');
const loading = ref(false);

const suggestedPrompts = [
  "Show today's delayed or at-risk shipments.",
  "Which carrier has the highest on-time delivery?",
  "Which vehicles are underutilized?",
  "Find fleet and driver documents expiring soon.",
];

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  data?: any[];
  actions?: string[];
}

const messages = ref<ChatMessage[]>([
  {
    sender: 'ai',
    text: 'Hello! I am your TMS Logistics Intelligence Assistant. Ask me anything regarding live shipments, route delays, vehicle utilization, or carrier performance.',
  },
]);

async function sendQuery(queryText: string) {
  if (!queryText.trim()) return;

  messages.value.push({
    sender: 'user',
    text: queryText,
  });

  loading.value = true;
  try {
    const res: any = await api.post('/api/v1/ai/query', { query: queryText });
    const payload = res.data || res;

    messages.value.push({
      sender: 'ai',
      text: payload.summary || 'Analysis complete.',
      data: payload.data || [],
      actions: payload.suggestedActions || [],
    });
  } catch (err: any) {
    messages.value.push({
      sender: 'ai',
      text: 'Apologies, could not process this request right now. Please try again.',
    });
  } finally {
    loading.value = false;
  }
}

function handleSend() {
  if (!inputQuery.value.trim()) return;
  const q = inputQuery.value;
  inputQuery.value = '';
  sendQuery(q);
}
</script>
