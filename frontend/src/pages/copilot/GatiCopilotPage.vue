<template>
  <div class="copilot-page flex flex-col p-6 text-slate-100">
    <!-- Header matching user screenshot (Fixed at top) -->
    <div class="page-title-wrap mb-3 flex-shrink-0">
      <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Gati Copilot — AI Assistant</h1>
      <div class="page-underline"></div>
    </div>

    <!-- Top Controls Row: Language Pills & AI Active Status (Fixed at top) -->
    <div class="flex items-center justify-between gap-4 mb-3 flex-shrink-0">
      <!-- Left: Language selector -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-400">Language:</span>
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
      <div class="flex items-center gap-2 text-xs font-medium text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>AI Active</span>
      </div>
    </div>

    <!-- Quick Prompt Suggestions Chips matching user screenshot (Fixed at top) -->
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
            <div class="text-xs font-bold text-cyan-400 mb-1.5">Gati Copilot</div>
            <p class="text-sm text-slate-200 mb-2 leading-relaxed">
              Namaskar! I am <span class="font-bold text-white">Gati Copilot</span>, your AI assistant for Ankpal Gati Shakti TMS.
            </p>
            <p class="text-sm text-slate-300 mb-2 leading-relaxed">
              Ask me anything about your fleet, lanes, drivers, outstanding, or compliance — in Hindi, Gujarati, or English.
            </p>
            <p class="text-sm text-slate-300 mb-3 leading-relaxed">
              I can also draft LRs, settlements, and WhatsApp reminders. Every answer shows source records and a confidence score.
            </p>
            <span class="confidence-badge">
              100% confidence
            </span>
          </div>
        </div>

        <!-- Dynamic Conversation Messages (One Column: User on Right -> Copilot Answer on Left directly underneath) -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="chat-row-wrapper w-full"
          :class="msg.role === 'user' ? 'chat-row-user' : 'chat-row-assistant'"
        >
          <!-- USER MESSAGE: Aligned to the RIGHT SIDE like ChatGPT -->
          <div v-if="msg.role === 'user'" class="user-bubble-box">
            <div class="user-bubble-header flex items-center justify-end gap-1.5 mb-1.5 text-xs text-slate-400 font-semibold">
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
            <!-- Avatar G on the left -->
            <div class="avatar-g flex-shrink-0">
              G
            </div>

            <!-- Assistant Answer Content Bubble -->
            <div class="welcome-bubble flex-1 text-sm">
              <div class="text-xs font-bold text-cyan-400 mb-1.5">Gati Copilot</div>
              <p class="leading-relaxed mb-2 text-slate-200">{{ msg.text }}</p>

              <!-- Structured Data if available -->
              <div v-if="msg.structuredData" class="mt-2.5 p-3 rounded-lg bg-[#060c18] border border-slate-800 text-xs">
                <div class="font-bold text-cyan-400 mb-1.5">{{ msg.structuredData.title }}</div>
                <div class="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                  <div v-for="(v, k) in msg.structuredData.fields" :key="k">
                    <span class="text-slate-500">{{ k }}:</span> {{ v }}
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

        <!-- Thinking Indicator (Directly below user question on the left) -->
        <div v-if="isThinking" class="chat-row-wrapper w-full chat-row-assistant">
          <div class="assistant-bubble-box flex items-start gap-3 w-full">
            <div class="avatar-g flex-shrink-0">
              G
            </div>
            <div class="welcome-bubble flex-1">
              <div class="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Gati Copilot is thinking...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Input Bar (PINNED AT BOTTOM LIKE CHATGPT) -->
    <div class="flex-shrink-0 flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <input
            v-model="inputText"
            type="text"
            placeholder="Ask about your fleet, lanes, drivers, outstanding... or say 'Draft LR from X to Y'"
            class="chat-input-control w-full px-4 py-3 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none"
            @keyup.enter="handleSend"
          />
        </div>
        <button class="btn-send-cyan flex-shrink-0" @click="handleSend">
          Send ↵
        </button>
      </div>

      <!-- Faint Footer Disclaimer matching user screenshot -->
      <div class="text-center text-[11px] text-slate-500">
        AI drafts, people approve • Confidence &lt;85% shown in amber • All actions logged with source references
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

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

  // Add User Message (stacks right below previous messages)
  messages.value.push({
    role: 'user',
    text: q,
  });

  isThinking.value = true;
  scrollToBottom();

  // Generate Context-Aware AI Answer directly below user query
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
      text: 'Identified 2 severe fuel anomalies this week: GJ-05-BT-2211 logged 4.2 km/L (24% variance vs target 5.5) at BPCL Naroda, and GJ-01-AB-1122 logged duplicate fills (580 L total) within 2h 40m at HPCL Adajan.',
      confidence: '98%',
      sources: ['FE/2400086', 'FE/2400082', 'Fuel Audit Log'],
      structuredData: {
        title: 'Flagged Fuel Anomaly Records',
        fields: {
          'GJ-05-BT-2211': '4.2 km/L (Over-fill/odometer flag)',
          'GJ-01-AB-1122': 'Duplicate fill within 2h 40m (580 L)',
          'Action Status': 'Pending Exception Inbox Review',
        },
      },
    });
  } else if (lower.includes('compliance') || lower.includes('expiry')) {
    messages.value.push({
      role: 'assistant',
      text: 'Compliance Status: Vehicle GJ-05-BT-2211 has Insurance expiring on 2025-11-20 (<30 days remaining). Additionally, GJ-01-AC-3444 Fitness is expired and GJ-01-AB-1122 Insurance is expired.',
      confidence: '99%',
      sources: ['VEH/GJ-05-BT-2211', 'Fleet Compliance Master'],
      structuredData: {
        title: 'Expiring Documents in 30 Days',
        fields: {
          'Vehicle': 'GJ-05-BT-2211',
          'Document': 'Comprehensive Insurance',
          'Expiry Date': '2025-11-20 (<30 days)',
          'Dispatch Status': 'Renewal Alert Active',
        },
      },
    });
  } else if (lower.includes('reliance') || lower.includes('outstanding')) {
    messages.value.push({
      role: 'assistant',
      text: 'Customer Outstanding for Reliance Industries: Total outstanding is ₹1,20,000 across 2 freight invoices. Overdue invoice INV/24/1086 (₹1,20,000) was due on 23 Oct 2026. Payment reminder ready.',
      confidence: '95%',
      sources: ['INV/24/1086', 'Customer Ledger: Reliance'],
      structuredData: {
        title: 'Reliance Industries Outstanding Ledger',
        fields: {
          'Total Outstanding': '₹1,20,000',
          'Overdue Days': '9 days',
          'GST Mode': 'RCM 5%',
          'Linked LR': 'LR/240038',
        },
      },
    });
  } else if (lower.includes('driver') || lower.includes('km/l')) {
    messages.value.push({
      role: 'assistant',
      text: 'Top 3 Drivers for October 2026: #1 Kishore Bhai at 6.1 km/L (Score 94, 100% On-Time), #2 Ramesh Alumar at 5.8 km/L (Score 88, 100% On-Time), and #3 Suresh Patel at 5.6 km/L (Score 79, 92% On-Time).',
      confidence: '98%',
      sources: ['Driver Scorecard Oct 2026', 'Telematics Telemetry'],
      structuredData: {
        title: 'Driver Fuel Efficiency Leaders',
        fields: {
          '#1 Kishore Bhai': '6.1 km/L • 100% OT • Score 94',
          '#2 Ramesh Alumar': '5.8 km/L • 100% OT • Score 88',
          '#3 Suresh Patel': '5.6 km/L • 92% OT • Score 79',
        },
      },
    });
  } else if (lower.includes('draft lr') || lower.includes('adani')) {
    messages.value.push({
      role: 'assistant',
      text: 'Draft Lorry Receipt prepared: Consignor Adani Enterprises (Ahmedabad) to Consignee Tata Steels (Mumbai), Material 18 MT TMT Steel Bars, assigned vehicle GJ-01-AB-1122 with Driver Ramesh Alumar. Freight rate ₹38,000.',
      confidence: '94%',
      sources: ['Rate Card: AHD—MUM', 'Fleet Master'],
      structuredData: {
        title: 'Draft Lorry Receipt: LR/240058',
        fields: {
          'Route': 'Ahmedabad → Mumbai',
          'Commodity': '18 MT Steel TMT Bars',
          'Vehicle': 'GJ-01-AB-1122',
          'Agreed Freight': '₹38,000 (RCM)',
        },
      },
    });
  } else {
    messages.value.push({
      role: 'assistant',
      text: `Understood your query: "${query}". Analysing live operational records across bookings, fleet vehicles, trip expenses, and customer ledgers to provide real-time intelligence.`,
      confidence: '92%',
      sources: ['Operational Live Stream', 'Gati TMS Sync'],
    });
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight + 500;
    }
  });
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight + 500;
    }
  }, 100);
}
</script>

<style scoped>
.copilot-page {
  background-color: #050b18;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow: hidden;
}

/* Header with cyan underline bar */
.page-title-wrap {
  display: flex;
  flex-direction: column;
}

.page-underline {
  height: 3px;
  width: 38px;
  background-color: #00e5ff;
  border-radius: 2px;
  margin-top: 4px;
}

/* Language Pill Buttons */
.lang-pill {
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #0b1728;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-pill:hover {
  color: #ffffff;
  background-color: #12223a;
}

.lang-pill--active {
  background-color: #00e5ff !important;
  color: #050b18 !important;
  border-color: #00e5ff !important;
}

/* Quick Prompt Suggestion Pills */
.prompt-pill {
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background-color: #081426;
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.prompt-pill:hover {
  background-color: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.25);
}

/* Main Chat Workspace Card */
.chat-workspace-card {
  background-color: #081224;
  border: 1px solid #162540;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
}

.messages-scroll-area {
  display: flex !important;
  flex-direction: column !important;
  flex-wrap: nowrap !important;
  gap: 16px !important;
  width: 100% !important;
  scroll-behavior: smooth;
}

/* Chat Rows: Single column layout with Question on Right and Answer on Left */
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

/* User Message: Right-aligned bubble like ChatGPT */
.user-bubble-box {
  max-width: 78%;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-bubble-text {
  background-color: #0c1d38;
  border: 1px solid rgba(0, 229, 255, 0.4);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  border-radius: 16px 16px 3px 16px;
  padding: 12px 18px;
  word-break: break-word;
}

.avatar-user-sm {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background-color: #162c4e;
  border: 1px solid rgba(0, 229, 255, 0.5);
  color: #00e5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Assistant Message: Left-aligned starting from avatar like ChatGPT */
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

/* Sleek Cyber Dark Scrollbar */
.messages-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.messages-scroll-area::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.messages-scroll-area::-webkit-scrollbar-thumb {
  background: #1e3a66;
  border-radius: 3px;
}

.messages-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #00e5ff;
}

/* Avatar G */
.avatar-g {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: #00e5ff;
  color: #050b18;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Welcome & Assistant Message Bubble */
.welcome-bubble {
  background-color: rgba(9, 18, 36, 0.75);
  border: 1px solid rgba(0, 229, 255, 0.25);
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
  background-color: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-family: monospace, sans-serif;
}

/* Chat Input Bar */
.chat-input-control {
  background-color: #091527;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.2s ease;
}

.chat-input-control:focus {
  border-color: #00e5ff;
}

/* Send Button */
.btn-send-cyan {
  background-color: #00e5ff;
  color: #050b18;
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
  background-color: #33ebff;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
}
</style>
