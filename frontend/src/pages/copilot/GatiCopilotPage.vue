<template>
  <div class="copilot-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title flex items-center gap-2">
          <span class="material-icons-outlined text-cyan-400">auto_awesome</span>
          Gati Copilot AI
        </h1>
        <div class="accent-line"></div>
      </div>
      <div class="model-badge">
        <span class="pulse-dot"></span>
        Gati-LLM v2.4 (Logistics Fine-Tuned)
      </div>
    </div>

    <!-- Main Chat Container -->
    <div class="copilot-chat-container">
      <!-- Conversation History -->
      <div class="messages-area" ref="messagesContainer">
        <!-- Intro Banner Card -->
        <div class="intro-card">
          <div class="intro-icon">
            <span class="material-icons-outlined text-3xl text-cyan-400">psychology</span>
          </div>
          <div class="intro-text">
            <h2 class="text-base font-bold text-white mb-1">
              Ask me anything about your fleet, lanes, drivers, outstanding, or compliance — in Hindi, Gujarati, or English.
            </h2>
            <p class="text-xs text-slate-400 leading-relaxed mb-3">
              I can also draft LRs, settlements, and WhatsApp reminders. Every answer shows source records and a confidence score.
            </p>
            <div class="confidence-chip">
              <span class="material-icons-outlined text-xs">verified</span>
              100% confidence
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="chat-bubble-wrap"
          :class="msg.role === 'user' ? 'user-message' : 'ai-message'"
        >
          <div class="bubble-header">
            <span class="sender-name">{{ msg.role === 'user' ? 'You' : 'Gati Copilot' }}</span>
            <span class="timestamp">{{ msg.time }}</span>
            <span v-if="msg.confidence" class="confidence-tag">
              {{ msg.confidence }} confidence
            </span>
          </div>
          <div class="bubble-body">
            <p class="message-text">{{ msg.text }}</p>
            
            <!-- Structured Data Card if present -->
            <div v-if="msg.structuredData" class="structured-box">
              <div class="structured-title">{{ msg.structuredData.title }}</div>
              <div class="structured-grid">
                <div v-for="(v, k) in msg.structuredData.fields" :key="k" class="field-item">
                  <span class="field-k">{{ k }}:</span>
                  <span class="field-v">{{ v }}</span>
                </div>
              </div>
              <div v-if="msg.structuredData.actionLabel" class="mt-2">
                <button class="btn-micro" @click="handleAction(msg.structuredData.actionLabel)">
                  {{ msg.structuredData.actionLabel }} →
                </button>
              </div>
            </div>

            <!-- Source Record References -->
            <div v-if="msg.sources && msg.sources.length" class="sources-row">
              <span class="source-label">Source Records:</span>
              <span v-for="s in msg.sources" :key="s" class="source-tag">{{ s }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Prompt Suggestions -->
      <div class="prompt-chips-row">
        <button
          v-for="chip in samplePrompts"
          :key="chip"
          class="prompt-chip"
          @click="usePrompt(chip)"
        >
          {{ chip }}
        </button>
      </div>

      <!-- Input Footer -->
      <div class="chat-input-bar">
        <input
          v-model="inputQuery"
          type="text"
          placeholder="Ask about your fleet, lanes, drivers, outstanding... or say 'Draft LR from X to Y'"
          class="chat-input"
          @keyup.enter="sendMessage"
        />
        <button class="btn-send" :disabled="!inputQuery.trim()" @click="sendMessage">
          Send ↵
        </button>
      </div>
      <div class="footer-disclaimer">
        AI drafts, people approve · Confidence &lt;85% shown in amber · All actions logged with source references
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  time: string;
  confidence?: string;
  sources?: string[];
  structuredData?: {
    title: string;
    fields: Record<string, string>;
    actionLabel?: string;
  };
}

const inputQuery = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const samplePrompts = [
  'Draft LR: 15 MT FMCG from Ahmedabad to Mumbai',
  'Show outstanding receivables > 30 days',
  'Check fitness and insurance expiries this week',
  'આ મહિને ડીઝલનો કુલ ખર્ચ કેટલો થયો? (Gujarati)',
  'किस गाड़ी का माइलेज 5.0 से कम है? (Hindi)',
];

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    text: 'Namaste! I am your Gati Copilot. I have live access to your 4 fleet vehicles, 5 active bookings, driver balances, and fuel logs. How can I assist your operations today?',
    time: '11:15 AM',
    confidence: '100%',
    sources: ['VehicleMaster', 'TripAllocation', 'FuelLedger'],
  },
  {
    role: 'user',
    text: 'Draft LR from Ahmedabad to Mumbai for Reliance Retail DC with 15 MT FMCG goods',
    time: '11:16 AM',
  },
  {
    role: 'assistant',
    text: 'I have drafted Lorry Receipt LR/240048 for Reliance Retail DC. The rate of ₹2,200/MT has been pre-populated from the customer master contract.',
    time: '11:16 AM',
    confidence: '100%',
    sources: ['PartyMaster:Reliance', 'RateMatrix:AHD-MUM'],
    structuredData: {
      title: 'Draft Lorry Receipt #LR/240048',
      fields: {
        Consignor: 'Reliance Retail DC',
        Route: 'Ahmedabad (AHD) → Mumbai (MUM)',
        Product: 'FMCG Mixed Pallets',
        'Charged Wt': '15 MT',
        Rate: '₹2,200 / MT (Total ₹33,000)',
        'Vehicle Assigned': 'GJ-01-AB-1122 (Tata Prima)',
      },
      actionLabel: 'Confirm & Generate E-Way Bill',
    },
  },
]);

function usePrompt(text: string) {
  inputQuery.value = text;
  sendMessage();
}

function sendMessage() {
  const q = inputQuery.value.trim();
  if (!q) return;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messages.value.push({
    role: 'user',
    text: q,
    time: now,
  });

  inputQuery.value = '';

  setTimeout(() => {
    generateAiResponse(q, now);
  }, 400);
}

function generateAiResponse(query: string, time: string) {
  const q = query.toLowerCase();

  if (q.includes('ખર્ચ') || q.includes('ડીઝલ') || q.includes('diesel')) {
    messages.value.push({
      role: 'assistant',
      text: 'ઓક્ટોબર ૨૦૨૬ માં કુલ ડીઝલ વપરાશ ૪૨,૮૦૦ લીટર છે અને કુલ ખર્ચ ₹૩,૨૪,૦૦૦ થયો છે. સરેરાશ માઇલેજ ૫.૮ KM/L છે, જે ટાર્ગેટ ૫.૫ કરતાં ઉત્તમ છે.',
      time,
      confidence: '100%',
      sources: ['FuelEntry:FE/240081-86'],
    });
  } else if (q.includes('fitness') || q.includes('insurance') || q.includes('expir')) {
    messages.value.push({
      role: 'assistant',
      text: 'Currently, vehicle GJ-01-AC-3444 has an expired Fitness Certificate (expired 2023-11-02). Vehicle GJ-01-AB-1122 has an expired Insurance policy as of 2025-01-10.',
      time,
      confidence: '100%',
      sources: ['VehicleMaster:Compliance'],
      structuredData: {
        title: 'Compliance Alert Notice',
        fields: {
          'GJ-01-AC-3444': 'Fitness Expired (Blocked from Dispatch)',
          'GJ-01-AB-1122': 'Insurance Expired (Currently In-Transit)',
        },
        actionLabel: 'Open Vehicle Master Compliance',
      },
    });
  } else if (q.includes('outstanding') || q.includes('receivable')) {
    messages.value.push({
      role: 'assistant',
      text: 'Total outstanding receivables stand at ₹1,60,000 across 2 customers. Pidilite Industries has ₹39,200 overdue since 20 Oct 2026.',
      time,
      confidence: '100%',
      sources: ['BillingLedger:INV/24/1086-89'],
    });
  } else {
    messages.value.push({
      role: 'assistant',
      text: `Analyzed query: "${query}". Based on live TMS records, your operational metrics are within standard tolerances. No severe lane delays detected on NH-48.`,
      time,
      confidence: '98%',
      sources: ['GatiCorridorTelemetry', 'DispatchLog'],
    });
  }

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function handleAction(label: string) {
  $q.notify({
    type: 'info',
    icon: 'smart_toy',
    message: `Copilot Action Triggered: ${label}`,
    caption: 'Operational dispatch command executed successfully.',
    position: 'top-right',
  });
}
</script>

<style scoped>
.copilot-page {
  padding: 1.5rem;
  background-color: #070c18;
  min-height: calc(100vh - 64px);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.accent-line {
  width: 44px;
  height: 3px;
  background: #00f2fe;
  border-radius: 2px;
  margin-top: 6px;
}

.model-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background: #00f2fe;
  border-radius: 50%;
  box-shadow: 0 0 8px #00f2fe;
}

.copilot-chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: calc(100vh - 310px);
}

.intro-card {
  display: flex;
  gap: 1rem;
  background: rgba(0, 242, 254, 0.04);
  border: 1px solid rgba(0, 242, 254, 0.18);
  padding: 1.25rem;
  border-radius: 12px;
}

.confidence-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.chat-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.chat-bubble-wrap.user-message {
  align-self: flex-end;
}

.chat-bubble-wrap.ai-message {
  align-self: flex-start;
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
}

.timestamp {
  font-size: 0.7rem;
  color: #64748b;
}

.confidence-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.bubble-body {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.user-message .bubble-body {
  background: #1e3a8a;
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

.ai-message .bubble-body {
  background: #090f1d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border-bottom-left-radius: 2px;
}

.structured-box {
  margin-top: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 242, 254, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
}

.structured-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #00f2fe;
  margin-bottom: 0.5rem;
}

.structured-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.35rem;
  font-size: 0.75rem;
}

.field-k {
  color: #94a3b8;
  margin-right: 0.3rem;
}

.field-v {
  color: #ffffff;
  font-weight: 600;
}

.btn-micro {
  background: #00f2fe;
  color: #070c18;
  border: none;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.sources-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.6rem;
  font-size: 0.7rem;
}

.source-label {
  color: #64748b;
}

.source-tag {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.prompt-chips-row {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.65rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.prompt-chip {
  white-space: nowrap;
  background: #090f1d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.prompt-chip:hover {
  border-color: #00f2fe;
  color: #00f2fe;
}

.chat-input-bar {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  background: #090f1d;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-input {
  flex: 1;
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
}

.chat-input:focus {
  border-color: #00f2fe;
}

.btn-send {
  background: #00f2fe;
  color: #070c18;
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-send:hover:not(:disabled) {
  background: #38bdf8;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
}

.btn-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.footer-disclaimer {
  text-align: center;
  font-size: 0.68rem;
  color: #64748b;
  padding: 0.4rem 1rem 0.6rem 1rem;
  background: #090f1d;
}
</style>
