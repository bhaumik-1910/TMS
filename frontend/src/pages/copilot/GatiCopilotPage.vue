<template>
  <div class="copilot-page flex flex-col p-6 text-slate-800 bg-slate-50 min-h-screen">
    <!-- Header matching user screenshot (Fixed at top) -->
    <div class="page-title-wrap mb-3 flex-shrink-0">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Gati Copilot — AI Assistant</h1>
      <div class="page-underline"></div>
    </div>

    <!-- Top Controls Row: Language Pills & AI Active Status (Fixed at top) -->
    <div class="flex items-center justify-between gap-4 mb-3 flex-shrink-0">
      <!-- Left: Language selector -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-600">Language:</span>
        <button
          v-for="lang in languages"
          :key="lang"
          class="lang-pill"
          :class="{ 'lang-pill--active': selectedLanguage === lang }"
          @click="selectedLanguage = lang"
        >
          {{ lang }}
        </button>
      </div>

      <!-- Right: AI Active status indicator -->
      <div class="flex items-center gap-2 text-xs font-medium text-slate-600">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-emerald-700 font-semibold">AI Active</span>
      </div>
    </div>

    <!-- Quick Prompt Suggestions Chips (Fixed at top) -->
    <div class="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
      <button
        v-for="chip in quickPrompts"
        :key="chip"
        class="prompt-pill"
        @click="sendQuickPrompt(chip)"
      >
        {{ chip }}
      </button>
    </div>

    <!-- Main Chat Workspace Card (Takes remaining vertical space, NO page scroll) -->
    <div class="chat-workspace-card p-6 flex flex-col flex-1 min-h-0 mb-3 overflow-hidden">
      <!-- ONLY this messages area scrolls! -->
      <div class="messages-scroll-area flex-1 min-h-0 overflow-y-auto pr-3 flex flex-col gap-4" ref="messagesContainer">
        <!-- Initial Welcome Message from Gati Copilot matching screenshot -->
        <div class="chat-msg-row flex items-start gap-3 w-full">
          <!-- Avatar G -->
          <div class="avatar-g flex-shrink-0">
            G
          </div>

          <!-- Welcome Message Bubble -->
          <div class="welcome-bubble flex-1 text-sm">
            <div class="text-xs font-bold text-sky-700 mb-1.5">Gati Copilot</div>
            <p class="text-sm text-slate-800 mb-2 leading-relaxed">
              Namaskar! I am <span class="font-bold text-slate-900">Gati Copilot</span>, your AI assistant for Ankpal Gati Shakti TMS.
            </p>
            <p class="text-sm text-slate-600 mb-2 leading-relaxed">
              Ask me anything about your fleet, lanes, drivers, outstanding, or compliance — in Hindi, Gujarati, or English.
            </p>
            <p class="text-sm text-slate-600 mb-3 leading-relaxed">
              I can also draft LRs, settlements, and WhatsApp reminders. Every answer shows source records and a confidence score.
            </p>
            <span class="confidence-badge">
              100% confidence
            </span>
          </div>
        </div>

        <!-- Dynamic Conversation Messages -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="chat-row-wrapper w-full"
          :class="msg.role === 'user' ? 'chat-row-user' : 'chat-row-assistant'"
        >
          <!-- USER MESSAGE: Aligned to the RIGHT SIDE -->
          <div v-if="msg.role === 'user'" class="user-bubble-box">
            <div class="user-bubble-header flex items-center justify-end gap-1.5 mb-1.5 text-xs text-slate-500 font-semibold">
              <span>You</span>
              <div class="avatar-user-sm">
                <q-icon name="person" size="13px" />
              </div>
            </div>
            <div class="user-bubble-text text-sm leading-relaxed text-white">
              {{ msg.text }}
            </div>
          </div>

          <!-- ASSISTANT MESSAGE: Directly underneath, starting from the LEFT SIDE -->
          <div v-else class="assistant-bubble-box flex items-start gap-3 w-full">
            <div class="avatar-g flex-shrink-0">
              G
            </div>

            <!-- Assistant Answer Content Bubble -->
            <div class="welcome-bubble flex-1 text-sm">
              <div class="text-xs font-bold text-sky-700 mb-1.5">Gati Copilot</div>
              <p class="leading-relaxed mb-2 text-slate-800">{{ msg.text }}</p>

              <!-- Structured Data if available -->
              <div v-if="msg.structuredData" class="mt-2.5 p-3 rounded-lg bg-white border border-slate-200 text-xs shadow-sm">
                <div class="font-bold text-sky-700 mb-1.5">{{ msg.structuredData.title }}</div>
                <div class="grid grid-cols-2 gap-2 text-slate-700 font-mono">
                  <div v-for="(v, k) in msg.structuredData.fields" :key="k">
                    <span class="text-slate-500">{{ k }}:</span> <span class="font-semibold">{{ v }}</span>
                  </div>
                </div>
              </div>

              <!-- Bottom Badges for Assistant -->
              <div class="flex items-center gap-2 mt-2">
                <span v-if="msg.confidence" class="confidence-badge">
                  {{ msg.confidence }} confidence
                </span>
                <span v-if="msg.sources" class="text-[11px] font-mono text-slate-500">
                  Sources: {{ msg.sources.join(', ') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Thinking Indicator -->
        <div v-if="isThinking" class="chat-row-wrapper w-full chat-row-assistant">
          <div class="assistant-bubble-box flex items-start gap-3 w-full">
            <div class="avatar-g flex-shrink-0">
              G
            </div>
            <div class="welcome-bubble flex-1">
              <div class="flex items-center gap-2 text-xs text-sky-600 font-mono">
                <span class="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                Gati Copilot is thinking...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Input Bar -->
    <div class="flex-shrink-0 flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <input
            ref="chatInputRef"
            v-model="inputText"
            type="text"
            placeholder="Ask about your fleet, lanes, drivers, outstanding... or say 'Draft LR from X to Y' (Alt+F)"
            class="chat-input-control w-full px-4 py-3 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            @keyup.enter="handleSend"
          />
        </div>
        <button class="btn-send-cyan flex-shrink-0" @click="handleSend">
          Send ↵
        </button>
      </div>

      <!-- Faint Footer Disclaimer -->
      <div class="text-center text-[11px] text-slate-500">
        AI drafts, people approve • Confidence &lt;85% shown in amber • All actions logged with source references
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useDeskPageShortcuts } from '../../desk';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  confidence?: string;
  sources?: string[];
  structuredData?: {
    title: string;
    fields: Record<string, string>;
  };
}

const chatInputRef = ref();
const languages = ['English', 'Hindi', 'Gujarati'];
const selectedLanguage = ref('English');

const quickPrompts = [
  'Which lane lost money last month?',
  'Show fuel anomalies this week',
  'Which vehicles have compliance expiry in 30 days?',
  'What is the outstanding from Reliance?',
  'Top 3 drivers by km/L this month',
  'Draft LR from Adani AHD to MUM 18 MT Steel',
];

const inputText = ref('');
const isThinking = ref(false);
const messages = ref<Message[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);

function sendQuickPrompt(promptText: string) {
  inputText.value = promptText;
  handleSend();
}

function handleSend() {
  if (!inputText.value.trim()) return;
  const q = inputText.value.trim();
  inputText.value = '';

  // Add User Message
  messages.value.push({
    role: 'user',
    text: q,
  });

  isThinking.value = true;
  scrollToBottom();

  // Generate Context-Aware AI Answer
  setTimeout(() => {
    isThinking.value = false;
    generateAiResponse(q);
    scrollToBottom();
  }, 450);
}

function generateAiResponse(query: string) {
  const lower = query.toLowerCase();

  if (lower.includes('lane') || lower.includes('lost money')) {
    messages.value.push({
      role: 'assistant',
      text: 'Lane Analysis for Sep/Oct 2026: The Ahmedabad to Delhi (AHD—DEL) lane incurred an operational deficit with Revenue of ₹1.7L vs Cost of ₹2.1L (-₹40,000 net margin), primarily due to empty return miles on the Jaipur—Rewari corridor.',
      confidence: '96%',
      sources: ['TR/240076', 'TR/240078', 'Lane P&L Register'],
      structuredData: {
        title: 'Lane Deficit Summary: AHD—DEL',
        fields: {
          'Revenue': '₹1,70,000',
          'Operating Cost': '₹2,10,000',
          'Deficit Margin': '-₹40,000 (-23.5%)',
          'Empty Miles': '380 KM',
        },
      },
    });
  } else if (lower.includes('fuel') || lower.includes('anomalies')) {
    messages.value.push({
      role: 'assistant',
      text: 'Fuel Anomaly Detection (Past 7 Days): 2 abnormal drops detected. Vehicle GJ-01-AC-3444 recorded 3.8 km/L vs fleet average of 5.35 km/L (-29% discrepancy) on Oct 3 during Surat—Hyderabad route.',
      confidence: '94%',
      sources: ['FUEL-LOG-891', 'GPS-ODOMETER-3444'],
      structuredData: {
        title: 'Fuel Anomaly Log',
        fields: {
          'Vehicle': 'GJ-01-AC-3444 (32ft MX)',
          'Driver': 'Ramesh Alumar',
          'Recorded Mileage': '3.8 km/L',
          'Expected Baseline': '5.35 km/L',
        },
      },
    });
  } else if (lower.includes('compliance') || lower.includes('expiry')) {
    messages.value.push({
      role: 'assistant',
      text: 'Compliance Status: 2 vehicles require immediate action. GJ-01-AC-3444 Fitness expired on 2023-11-02. GJ-01-AB-1122 Insurance expired on 2025-01-10. GJ-05-BT-2211 Insurance expires in 15 days.',
      confidence: '100%',
      sources: ['Parivahan Vahan Sync', 'Policy Registry'],
      structuredData: {
        title: 'Urgent Compliance Warnings',
        fields: {
          'Expired Fitness': 'GJ-01-AC-3444',
          'Expired Insurance': 'GJ-01-AB-1122',
          'Expiring <30 Days': 'GJ-05-BT-2211',
          'Total At Risk': '3 Vehicles',
        },
      },
    });
  } else if (lower.includes('reliance') || lower.includes('outstanding')) {
    messages.value.push({
      role: 'assistant',
      text: 'Outstanding from Reliance Industries: Total ledger balance is ₹4,82,500 across 6 freight invoices. ₹3,12,000 is overdue >45 days. Would you like me to generate a WhatsApp reminder ledger summary?',
      confidence: '98%',
      sources: ['Accounts Receivable', 'Ledger REL-9901'],
      structuredData: {
        title: 'Customer Ledger: Reliance Industries',
        fields: {
          'Total Outstanding': '₹4,82,500',
          'Overdue (>45d)': '₹3,12,000',
          'Pending Invoices': '6 Bills',
          'Last Payment Received': '₹1,50,000 (18 Sep)',
        },
      },
    });
  } else if (lower.includes('driver') || lower.includes('top 3') || lower.includes('km/l')) {
    messages.value.push({
      role: 'assistant',
      text: 'Top Fleet Drivers for Oct 2026: #1 Kishore Bhai (6.1 km/L, 100% On-Time, Score 94), #2 Ramesh Alumar (5.8 km/L, 100% On-Time, Score 88), #3 Suresh Patel (5.6 km/L, 92% On-Time, Score 79).',
      confidence: '95%',
      sources: ['Driver Trip Logs', 'FASTag Transit Records'],
    });
  } else if (lower.includes('draft lr') || lower.includes('lr')) {
    messages.value.push({
      role: 'assistant',
      text: 'Draft Lorry Receipt ready for approval: Consignor: Adani Port Logistics (AHD) → Consignee: Tata Projects (MUM). Cargo: 18 MT Structural Steel. Vehicle: GJ-01-AB-1122. Standard Freight: ₹42,500.',
      confidence: '92%',
      sources: ['Master Contract MC-2026-08', 'Lane Freight Rate Matrix'],
      structuredData: {
        title: 'Draft LR Preview #DRAFT-LR-2026-99',
        fields: {
          'Consignor': 'Adani Logistics (Ahmedabad)',
          'Consignee': 'Tata Projects (Mumbai Hub)',
          'Weight': '18.00 Metric Tons',
          'Freight': '₹42,500 (TO PAY)',
        },
      },
    });
  } else {
    messages.value.push({
      role: 'assistant',
      text: `Understood query: "${query}". Cross-referencing operational masters, FASTag logs, and billing ledger. All related parameters appear stable with no major exceptions flagged.`,
      confidence: '91%',
      sources: ['TMS Operational Index'],
    });
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

// Hotkey: Alt+F focuses chat input
useDeskPageShortcuts({
  onFocusSearch: () => {
    chatInputRef.value?.focus();
  },
});
</script>

<style scoped>
.copilot-page {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  height: calc(100vh - 48px);
  overflow: hidden;
  box-sizing: border-box;
}

/* Header */
.page-title-wrap {
  display: flex;
  flex-direction: column;
}

.page-underline {
  height: 3px;
  width: 38px;
  background-color: #0284c7;
  border-radius: 2px;
  margin-top: 4px;
}

/* Language Pill Buttons */
.lang-pill {
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-pill:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

.lang-pill--active {
  background-color: #0284c7 !important;
  color: #ffffff !important;
  border-color: #0284c7 !important;
}

/* Quick Prompt Suggestion Pills */
.prompt-pill {
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background-color: #ffffff;
  color: #0369a1;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.prompt-pill:hover {
  background-color: #f0f9ff;
  border-color: #0284c7;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.15);
}

/* Main Chat Workspace Card */
.chat-workspace-card {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.messages-scroll-area {
  display: flex !important;
  flex-direction: column !important;
  flex-wrap: nowrap !important;
  gap: 16px !important;
  width: 100% !important;
  scroll-behavior: smooth;
}

/* Chat Rows */
.chat-row-wrapper {
  display: flex !important;
  width: 100% !important;
  clear: both !important;
  margin-bottom: 4px;
}

.chat-row-user {
  justify-content: flex-end !important;
  align-self: flex-end !important;
}

.chat-row-assistant {
  justify-content: flex-start !important;
  align-self: flex-start !important;
}

/* User Message Bubble */
.user-bubble-box {
  max-width: 78%;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-bubble-text {
  background-color: #0284c7;
  border: 1px solid #0284c7;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.2);
  border-radius: 16px 16px 3px 16px;
  padding: 12px 18px;
  word-break: break-word;
}

.avatar-user-sm {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background-color: #e2e8f0;
  border: 1px solid #cbd5e1;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Assistant Message */
.assistant-bubble-box {
  width: 100% !important;
  max-width: 88% !important;
  margin-right: auto;
}

/* Initial Welcome Row */
.chat-msg-row {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  width: 100% !important;
  max-width: 88% !important;
  clear: both !important;
}

/* Avatar G */
.avatar-g {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: #0284c7;
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Welcome & Assistant Message Bubble */
.welcome-bubble {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 20px;
  width: 100% !important;
  box-sizing: border-box;
}

/* 100% Confidence Badge */
.confidence-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  font-family: monospace, sans-serif;
}

/* Chat Input Bar */
.chat-input-control {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  transition: border-color 0.2s ease;
}

.chat-input-control:focus {
  border-color: #0284c7;
}

/* Send Button */
.btn-send-cyan {
  background-color: #0284c7;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  height: 44px;
  padding: 0 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.btn-send-cyan:hover {
  background-color: #0369a1;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
}
</style>
