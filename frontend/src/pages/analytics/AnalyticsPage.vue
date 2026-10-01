<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports</h1>
        <div class="accent-line"></div>
      </div>
      <div class="period-selector">
        <q-select
          v-model="selectedPeriod"
          :options="periodOptions"
          dense
          outlined
          emit-value
          map-options
          class="desk-filter-select"
          popup-content-class="desk-select-menu"
          style="min-width: 230px;"
        />
      </div>
    </div>

    <!-- Charts & Intelligence Grid matching Figma -->
    <div class="reports-grid">
      <!-- 1. Fleet Utilisation — Days -->
      <div class="cyber-card p-4">
        <h2 class="card-title">Fleet Utilisation — Days</h2>
        <div class="chart-container">
          <div class="bar-chart-body">
            <div v-for="unit in fleetUtil" :key="unit.reg" class="stacked-bar-group">
              <div class="stacked-bar">
                <div class="bar-segment bar-maint" :style="{ height: unit.maintPct + '%' }"></div>
                <div class="bar-segment bar-idle" :style="{ height: unit.idlePct + '%' }"></div>
                <div class="bar-segment bar-run" :style="{ height: unit.runPct + '%' }"></div>
              </div>
              <div class="bar-label">{{ unit.reg }}</div>
            </div>
          </div>
          <!-- Legend -->
          <div class="chart-legend">
            <span class="legend-item"><span class="dot dot-run"></span> Running</span>
            <span class="legend-item"><span class="dot dot-idle"></span> Idle</span>
            <span class="legend-item"><span class="dot dot-maint"></span> Maintenance</span>
          </div>
        </div>
      </div>

      <!-- 2. Lane P&L — Revenue vs Cost (₹L) -->
      <div class="cyber-card p-4">
        <h2 class="card-title">Lane P&L — Revenue vs Cost (₹L)</h2>
        <div class="chart-container">
          <div class="bar-chart-body">
            <div v-for="lane in lanePnl" :key="lane.name" class="grouped-bar-group">
              <div class="dual-bars">
                <div class="bar-bar bar-rev" :style="{ height: (lane.rev / 3.5) * 100 + '%' }"></div>
                <div class="bar-bar bar-cost" :style="{ height: (lane.cost / 3.5) * 100 + '%' }"></div>
              </div>
              <div class="bar-label">{{ lane.name }}</div>
            </div>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="dot dot-rev"></span> Revenue</span>
            <span class="legend-item"><span class="dot dot-cost"></span> Cost</span>
          </div>
        </div>
      </div>

      <!-- 3. Fuel Efficiency Trend (km/L) -->
      <div class="cyber-card p-4">
        <h2 class="card-title">Fuel Efficiency Trend (km/L)</h2>
        <div class="chart-container">
          <svg viewBox="0 0 400 160" class="line-svg">
            <!-- Grid lines -->
            <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
            <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
            <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
            <line x1="40" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.06)" />

            <!-- Axis labels -->
            <text x="15" y="25" fill="#64748b" font-size="10">6.0</text>
            <text x="15" y="65" fill="#64748b" font-size="10">5.7</text>
            <text x="15" y="105" fill="#64748b" font-size="10">5.4</text>
            <text x="15" y="145" fill="#64748b" font-size="10">4.8</text>

            <!-- Line Path -->
            <path
              d="M 60 100 Q 110 120 130 115 T 190 90 T 250 105 T 310 75 T 370 125"
              fill="none"
              stroke="#00f2fe"
              stroke-width="3"
            />

            <!-- Points -->
            <circle cx="60" cy="100" r="4" fill="#00f2fe" />
            <circle cx="130" cy="115" r="4" fill="#00f2fe" />
            <circle cx="190" cy="90" r="4" fill="#00f2fe" />
            <circle cx="250" cy="105" r="4" fill="#00f2fe" />
            <circle cx="310" cy="75" r="4" fill="#00f2fe" />
            <circle cx="370" cy="125" r="4" fill="#00f2fe" />

            <!-- Months -->
            <text x="50" y="155" fill="#94a3b8" font-size="9">May</text>
            <text x="120" y="155" fill="#94a3b8" font-size="9">Jun</text>
            <text x="180" y="155" fill="#94a3b8" font-size="9">Jul</text>
            <text x="240" y="155" fill="#94a3b8" font-size="9">Aug</text>
            <text x="300" y="155" fill="#94a3b8" font-size="9">Sep</text>
            <text x="360" y="155" fill="#94a3b8" font-size="9">Oct</text>
          </svg>
        </div>
      </div>

      <!-- 4. Receivables Ageing (₹) -->
      <div class="cyber-card p-4">
        <h2 class="card-title">Receivables Ageing (₹)</h2>
        <div class="flex items-center justify-between h-48">
          <!-- Pie SVG -->
          <svg viewBox="0 0 100 100" class="w-36 h-36">
            <!-- 0-30 days (45%) -->
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" stroke-width="20" stroke-dasharray="113 251" stroke-dashoffset="0" />
            <!-- 31-60 days (25%) -->
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" stroke-width="20" stroke-dasharray="62 251" stroke-dashoffset="-113" />
            <!-- 61-90 days (18%) -->
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" stroke-width="20" stroke-dasharray="45 251" stroke-dashoffset="-175" />
            <!-- 90+ days (12%) -->
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" stroke-width="20" stroke-dasharray="31 251" stroke-dashoffset="-220" />
          </svg>
          <!-- Breakdown -->
          <div class="flex flex-col gap-2 flex-1 ml-4 text-xs">
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 0-30 days</span>
              <span class="font-bold text-white">₹62K</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-amber-400"></span> 31-60 days</span>
              <span class="font-bold text-white">₹39K</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> 61-90 days</span>
              <span class="font-bold text-white">₹28K</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> 90+ days</span>
              <span class="font-bold text-white">₹16K</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Compliance Alerts Table -->
      <div class="cyber-card p-4">
        <h2 class="card-title">Compliance Alerts</h2>
        <div class="alerts-body flex flex-col gap-2 mt-2">
          <div class="alert-strip">
            <span class="cyan-code font-bold">GJ-01-AC-3444</span>
            <span class="text-xs text-slate-300">Fitness</span>
            <span class="text-xs text-slate-400">2023-11-02</span>
            <span class="badge-expired">Expired</span>
          </div>
          <div class="alert-strip">
            <span class="cyan-code font-bold">GJ-01-AB-1122</span>
            <span class="text-xs text-slate-300">Insurance</span>
            <span class="text-xs text-slate-400">2025-01-10</span>
            <span class="badge-expired">Expired</span>
          </div>
          <div class="alert-strip">
            <span class="cyan-code font-bold">MH-14-DX-9000</span>
            <span class="text-xs text-slate-300">PUC Renewal</span>
            <span class="text-xs text-slate-400">2025-10-30</span>
            <span class="badge-due">Due Soon</span>
          </div>
        </div>
      </div>

      <!-- 6. Driver Performance — Oct 2026 -->
      <div class="cyber-card p-4">
        <h2 class="card-title">Driver Performance — Oct 2026</h2>
        <div class="driver-body flex flex-col gap-2 mt-2">
          <div class="driver-strip">
            <span class="font-bold text-cyan-400">#1 Kishore Bhai</span>
            <span class="text-xs text-slate-300">6.1 km/L</span>
            <span class="text-xs text-emerald-400 font-semibold">100% OT</span>
            <span class="badge-score">Score 94</span>
          </div>
          <div class="driver-strip">
            <span class="font-bold text-white">#2 Ramesh Alumar</span>
            <span class="text-xs text-slate-300">5.8 km/L</span>
            <span class="text-xs text-emerald-400 font-semibold">96% OT</span>
            <span class="badge-score">Score 89</span>
          </div>
          <div class="driver-strip">
            <span class="font-bold text-white">#3 Suresh Patel</span>
            <span class="text-xs text-slate-300">5.4 km/L</span>
            <span class="text-xs text-amber-400 font-semibold">91% OT</span>
            <span class="badge-score">Score 82</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedPeriod = ref('October 2026 (Current MTD)');
const periodOptions = [
  'October 2026 (Current MTD)',
  'September 2026',
  'Q3 2026',
];

const fleetUtil = [
  { reg: 'AB-1122', maintPct: 25, idlePct: 20, runPct: 55 },
  { reg: 'AC-3444', maintPct: 50, idlePct: 15, runPct: 35 },
  { reg: 'DX-9000', maintPct: 15, idlePct: 25, runPct: 60 },
  { reg: 'TR-7788', maintPct: 10, idlePct: 20, runPct: 70 },
  { reg: 'BT-2211', maintPct: 20, idlePct: 35, runPct: 45 },
];

const lanePnl = [
  { name: 'AHD→DEL', rev: 2.1, cost: 2.4 },
  { name: 'SRT→HYD', rev: 2.6, cost: 2.3 },
  { name: 'MUM→NAS', rev: 1.4, cost: 1.5 },
  { name: 'AHD→MUM', rev: 3.3, cost: 2.7 },
  { name: 'AHD→PNE', rev: 1.8, cost: 1.6 },
];
</script>

<style scoped>
.reports-page {
  padding: 1.5rem;
  background-color: #070c18;
  min-height: calc(100vh - 64px);
  color: #e2e8f0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
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

.cyber-select {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  outline: none;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.cyber-card {
  background: #0d172b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.chart-container {
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar-chart-body {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.stacked-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 44px;
}

.stacked-bar {
  width: 24px;
  height: 120px;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.bar-segment {
  width: 100%;
}

.bar-run { background: #00f2fe; }
.bar-idle { background: #fbbf24; }
.bar-maint { background: #ef4444; }

.bar-label {
  font-size: 0.68rem;
  color: #94a3b8;
}

.grouped-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.dual-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
}

.bar-bar {
  width: 14px;
  border-radius: 3px 3px 0 0;
}

.bar-rev { background: #00f2fe; }
.bar-cost { background: #f87171; }

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 0.75rem;
  font-size: 0.72rem;
  color: #94a3b8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.dot-run { background: #00f2fe; }
.dot-idle { background: #fbbf24; }
.dot-maint { background: #ef4444; }
.dot-rev { background: #00f2fe; }
.dot-cost { background: #f87171; }

.line-svg {
  width: 100%;
  height: 160px;
}

.alert-strip, .driver-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #070c18;
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.cyan-code {
  color: #00f2fe;
}

.badge-expired {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.badge-due {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.badge-score {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}
</style>
