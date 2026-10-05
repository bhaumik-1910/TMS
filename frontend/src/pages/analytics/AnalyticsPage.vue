<template>
  <div class="reports-page min-h-screen text-slate-800 p-6 bg-slate-50">
    <!-- Header -->
    <div class="page-title-wrap mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 mb-1">Reports & Analytics</h1>
      <div class="page-underline"></div>
    </div>

    <!-- 4 KPI Box Cards matching Row 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- 1. FLEET UTILISATION (Active Card) -->
      <div class="kpi-box kpi-box--active">
        <span class="kpi-title">FLEET UTILISATION</span>
        <div class="kpi-amount text-sky-600">74%</div>
        <span class="kpi-subtext">Running / Total days</span>
      </div>

      <!-- 2. AVG FUEL EFFICIENCY -->
      <div class="kpi-box">
        <span class="kpi-title">AVG FUEL EFFICIENCY</span>
        <div class="kpi-amount text-slate-900">5.35 km/L</div>
        <span class="kpi-subtext">Oct 2026 fleet avg</span>
      </div>

      <!-- 3. TOTAL REVENUE -->
      <div class="kpi-box">
        <span class="kpi-title">TOTAL REVENUE</span>
        <div class="kpi-amount text-slate-900">₹18.4L</div>
        <span class="kpi-subtext">Oct 2026 billed</span>
      </div>

      <!-- 4. NET MARGIN -->
      <div class="kpi-box">
        <span class="kpi-title">NET MARGIN</span>
        <div class="kpi-amount text-slate-900">8.2%</div>
        <span class="kpi-subtext">Revenue - Cost</span>
      </div>
    </div>

    <!-- Row 2: Fleet Utilisation & Lane P&L -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <!-- Left: Fleet Utilisation — Days -->
      <div class="report-card p-5">
        <h2 class="card-title mb-4">Fleet Utilisation — Days</h2>
        <div class="chart-wrapper">
          <svg viewBox="0 0 500 220" class="w-full h-48 overflow-visible">
            <!-- Grid lines & Y Axis -->
            <g class="grid-lines text-slate-500 font-mono text-[10px]">
              <!-- 32 -->
              <line x1="45" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="24" text-anchor="end" fill="#64748b">32</text>

              <!-- 24 -->
              <line x1="45" y1="60" x2="480" y2="60" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="64" text-anchor="end" fill="#64748b">24</text>

              <!-- 16 -->
              <line x1="45" y1="100" x2="480" y2="100" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="104" text-anchor="end" fill="#64748b">16</text>

              <!-- 8 -->
              <line x1="45" y1="140" x2="480" y2="140" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="144" text-anchor="end" fill="#64748b">8</text>

              <!-- 0 Axis Line -->
              <line x1="45" y1="180" x2="480" y2="180" stroke="#cbd5e1" />
              <text x="32" y="184" text-anchor="end" fill="#64748b">0</text>
            </g>

            <!-- Stacked Bars (5 Vehicles) -->
            <!-- 1. AB-1122 -->
            <g transform="translate(65, 0)">
              <rect x="0" y="85" width="48" height="95" fill="#0284c7" rx="2" />
              <rect x="0" y="55" width="48" height="30" fill="#f59e0b" rx="2" />
              <rect x="0" y="32" width="48" height="23" fill="#ef4444" rx="2" />
              <text x="24" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">AB-1122</text>
            </g>

            <!-- 2. AC-3444 -->
            <g transform="translate(150, 0)">
              <rect x="0" y="125" width="48" height="55" fill="#0284c7" rx="2" />
              <rect x="0" y="110" width="48" height="15" fill="#f59e0b" rx="2" />
              <rect x="0" y="35" width="48" height="75" fill="#ef4444" rx="2" />
              <text x="24" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">AC-3444</text>
            </g>

            <!-- 3. DX-9000 -->
            <g transform="translate(235, 0)">
              <rect x="0" y="75" width="48" height="105" fill="#0284c7" rx="2" />
              <rect x="0" y="45" width="48" height="30" fill="#f59e0b" rx="2" />
              <rect x="0" y="32" width="48" height="13" fill="#ef4444" rx="2" />
              <text x="24" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">DX-9000</text>
            </g>

            <!-- 4. TR-7798 -->
            <g transform="translate(320, 0)">
              <rect x="0" y="80" width="48" height="100" fill="#0284c7" rx="2" />
              <rect x="0" y="45" width="48" height="35" fill="#f59e0b" rx="2" />
              <rect x="0" y="32" width="48" height="13" fill="#ef4444" rx="2" />
              <text x="24" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">TR-7798</text>
            </g>

            <!-- 5. BT-2211 -->
            <g transform="translate(405, 0)">
              <rect x="0" y="100" width="48" height="80" fill="#0284c7" rx="2" />
              <rect x="0" y="52" width="48" height="48" fill="#f59e0b" rx="2" />
              <rect x="0" y="32" width="48" height="20" fill="#ef4444" rx="2" />
              <text x="24" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">BT-2211</text>
            </g>
          </svg>

          <!-- Centered Legend -->
          <div class="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 font-medium">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Idle</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Running</span>
          </div>
        </div>
      </div>

      <!-- Right: Lane P&L — Revenue vs Cost (₹L) -->
      <div class="report-card p-5">
        <h2 class="card-title mb-4">Lane P&L — Revenue vs Cost (₹L)</h2>
        <div class="chart-wrapper">
          <svg viewBox="0 0 500 220" class="w-full h-48 overflow-visible">
            <!-- Grid lines & Y Axis -->
            <g class="grid-lines text-slate-500 font-mono text-[10px]">
              <!-- 3.2 -->
              <line x1="45" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="24" text-anchor="end" fill="#64748b">3.2</text>

              <!-- 2.4 -->
              <line x1="45" y1="60" x2="480" y2="60" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="64" text-anchor="end" fill="#64748b">2.4</text>

              <!-- 1.6 -->
              <line x1="45" y1="100" x2="480" y2="100" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="104" text-anchor="end" fill="#64748b">1.6</text>

              <!-- 0.8 -->
              <line x1="45" y1="140" x2="480" y2="140" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="144" text-anchor="end" fill="#64748b">0.8</text>

              <!-- 0 Axis Line -->
              <line x1="45" y1="180" x2="480" y2="180" stroke="#cbd5e1" />
              <text x="32" y="184" text-anchor="end" fill="#64748b">0</text>
            </g>

            <!-- Grouped Bars (5 Lanes: Revenue Blue, Cost Rose) -->
            <!-- 1. AHD—DEL -->
            <g transform="translate(65, 0)">
              <rect x="0" y="95" width="28" height="85" fill="#0284c7" rx="2" />
              <rect x="30" y="75" width="28" height="105" fill="#ef4444" rx="2" />
              <text x="29" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">AHD—DEL</text>
            </g>

            <!-- 2. SRT—HYD -->
            <g transform="translate(150, 0)">
              <rect x="0" y="60" width="28" height="120" fill="#0284c7" rx="2" />
              <rect x="30" y="80" width="28" height="100" fill="#ef4444" rx="2" />
              <text x="29" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">SRT—HYD</text>
            </g>

            <!-- 3. MUM—NAS -->
            <g transform="translate(235, 0)">
              <rect x="0" y="125" width="28" height="55" fill="#0284c7" rx="2" />
              <rect x="30" y="125" width="28" height="55" fill="#ef4444" rx="2" />
              <text x="29" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">MUM—NAS</text>
            </g>

            <!-- 4. AHD—MUM -->
            <g transform="translate(320, 0)">
              <rect x="0" y="20" width="28" height="160" fill="#0284c7" rx="2" />
              <rect x="30" y="50" width="28" height="130" fill="#ef4444" rx="2" />
              <text x="29" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">AHD—MUM</text>
            </g>

            <!-- 5. AHD—PNE -->
            <g transform="translate(405, 0)">
              <rect x="0" y="105" width="28" height="75" fill="#0284c7" rx="2" />
              <rect x="30" y="115" width="28" height="65" fill="#ef4444" rx="2" />
              <text x="29" y="196" text-anchor="middle" fill="#475569" font-size="10" font-family="monospace" font-weight="600">AHD—PNE</text>
            </g>
          </svg>

          <!-- Centered Legend -->
          <div class="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 font-medium">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Cost</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-sky-600"></span> Revenue</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Fuel Efficiency Trend & Receivables Ageing -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <!-- Left: Fuel Efficiency Trend (km/L) -->
      <div class="report-card p-5">
        <h2 class="card-title mb-4">Fuel Efficiency Trend (km/L)</h2>
        <div class="chart-wrapper">
          <svg viewBox="0 0 500 200" class="w-full h-48 overflow-visible">
            <!-- Grid lines & Y Axis -->
            <g class="grid-lines text-slate-500 font-mono text-[10px]">
              <!-- 6.0 -->
              <line x1="45" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="24" text-anchor="end" fill="#64748b">6.0</text>

              <!-- 5.7 -->
              <line x1="45" y1="55" x2="480" y2="55" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="59" text-anchor="end" fill="#64748b">5.7</text>

              <!-- 5.4 -->
              <line x1="45" y1="90" x2="480" y2="90" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="94" text-anchor="end" fill="#64748b">5.4</text>

              <!-- 5.1 -->
              <line x1="45" y1="125" x2="480" y2="125" stroke="#e2e8f0" stroke-dasharray="3,3" />
              <text x="32" y="129" text-anchor="end" fill="#64748b">5.1</text>

              <!-- 4.8 Axis Line -->
              <line x1="45" y1="160" x2="480" y2="160" stroke="#cbd5e1" />
              <text x="32" y="164" text-anchor="end" fill="#64748b">4.8</text>
            </g>

            <!-- Spline Line Path -->
            <path
              d="M 65 95 C 105 105, 115 115, 145 115 C 185 115, 195 78, 225 78 C 265 78, 275 102, 305 102 C 345 102, 355 60, 385 60 C 425 60, 435 138, 465 138"
              fill="none"
              stroke="#0284c7"
              stroke-width="2.5"
            />

            <!-- Dots on Points -->
            <circle cx="65" cy="95" r="4" fill="#0284c7" />
            <circle cx="145" cy="115" r="4" fill="#0284c7" />
            <circle cx="225" cy="78" r="4" fill="#0284c7" />
            <circle cx="305" cy="102" r="4" fill="#0284c7" />
            <circle cx="385" cy="60" r="4" fill="#0284c7" />
            <circle cx="465" cy="138" r="4" fill="#0284c7" />

            <!-- Months X Axis Labels -->
            <g class="text-[10px] font-mono" fill="#64748b">
              <text x="65" y="178" text-anchor="middle">May</text>
              <text x="145" y="178" text-anchor="middle">Jun</text>
              <text x="225" y="178" text-anchor="middle">Jul</text>
              <text x="305" y="178" text-anchor="middle">Aug</text>
              <text x="385" y="178" text-anchor="middle">Sep</text>
              <text x="465" y="178" text-anchor="middle">Oct</text>
            </g>
          </svg>
        </div>
      </div>

      <!-- Right: Receivables Ageing (₹) -->
      <div class="report-card p-5">
        <h2 class="card-title mb-4">Receivables Ageing (₹)</h2>
        <div class="flex items-center justify-between h-48 px-4">
          <!-- Pie Chart SVG -->
          <div class="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" class="w-36 h-36 transform -rotate-90">
              <!-- 0-30 days (Green #10b981): 48% -->
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#10b981"
                stroke-width="24"
                stroke-dasharray="114 239"
                stroke-dashoffset="0"
              />
              <!-- 31-60 days (Coral Red #ef4444): 23% -->
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#ef4444"
                stroke-width="24"
                stroke-dasharray="55 239"
                stroke-dashoffset="-114"
              />
              <!-- 61-90 days (Orange #f97316): 16% -->
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f97316"
                stroke-width="24"
                stroke-dasharray="38 239"
                stroke-dashoffset="-169"
              />
              <!-- 90+ days (Amber #f59e0b): 13% -->
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f59e0b"
                stroke-width="24"
                stroke-dasharray="32 239"
                stroke-dashoffset="-207"
              />
            </svg>
          </div>

          <!-- Legend with exact amounts -->
          <div class="flex flex-col gap-3 flex-1 max-w-[210px] ml-6 text-xs font-mono">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-600 font-sans">
                <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                0-30 days
              </span>
              <span class="font-bold text-slate-800 font-mono">₹62K</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-600 font-sans">
                <span class="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                31-60 days
              </span>
              <span class="font-bold text-slate-800 font-mono">₹30K</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-600 font-sans">
                <span class="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                61-90 days
              </span>
              <span class="font-bold text-slate-800 font-mono">₹20K</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-slate-600 font-sans">
                <span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                90+ days
              </span>
              <span class="font-bold text-slate-800 font-mono">₹16K</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Compliance Alerts & Driver Performance -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left: Compliance Alerts -->
      <div class="report-card p-5">
        <h2 class="card-title mb-4">Compliance Alerts</h2>
        <div class="flex flex-col gap-2.5">
          <!-- Item 1: GJ-01-AC-3444 -->
          <div class="alert-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="font-mono text-xs font-bold text-sky-700">GJ-01-AC-3444</span>
            <span class="text-xs text-slate-600">Fitness</span>
            <span class="text-xs text-slate-400 font-mono">2023-11-02</span>
            <span class="badge-pill badge-expired">Expired</span>
          </div>

          <!-- Item 2: GJ-01-AB-1122 -->
          <div class="alert-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="font-mono text-xs font-bold text-sky-700">GJ-01-AB-1122</span>
            <span class="text-xs text-slate-600">Insurance</span>
            <span class="text-xs text-slate-400 font-mono">2025-01-10</span>
            <span class="badge-pill badge-expired">Expired</span>
          </div>

          <!-- Item 3: GJ-05-BT-2211 -->
          <div class="alert-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="font-mono text-xs font-bold text-sky-700">GJ-05-BT-2211</span>
            <span class="text-xs text-slate-600">Insurance</span>
            <span class="text-xs text-slate-400 font-mono">2025-11-20</span>
            <span class="badge-pill badge-warning">&lt;30 days</span>
          </div>

          <!-- Item 4: MH-14-DX-9000 -->
          <div class="alert-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="font-mono text-xs font-bold text-sky-700">MH-14-DX-9000</span>
            <span class="text-xs text-slate-600">PUC</span>
            <span class="text-xs text-slate-400 font-mono">2027-03-15</span>
            <span class="badge-pill badge-valid">Valid</span>
          </div>

          <!-- Item 5: RJ-13-TR-7798 -->
          <div class="alert-row flex items-center justify-between py-2">
            <span class="font-mono text-xs font-bold text-sky-700">RJ-13-TR-7798</span>
            <span class="text-xs text-slate-600">Permit</span>
            <span class="text-xs text-slate-400 font-mono">2028-12-01</span>
            <span class="badge-pill badge-valid">Valid</span>
          </div>
        </div>
      </div>

      <!-- Right: Driver Performance -->
      <div class="report-card p-5">
        <h2 class="card-title mb-4">Driver Performance — Oct 2026</h2>
        <div class="flex flex-col gap-2.5">
          <!-- Driver 1: Kishore Bhai -->
          <div class="driver-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-xs font-semibold text-sky-700">#1 Kishore Bhai</span>
            <span class="text-xs text-slate-600 font-mono">6.1 km/L  100% OT</span>
            <span class="badge-pill badge-valid">Score 94</span>
          </div>

          <!-- Driver 2: Ramesh Alumar -->
          <div class="driver-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-xs font-semibold text-slate-800">#2 Ramesh Alumar</span>
            <span class="text-xs text-slate-600 font-mono">5.8 km/L  100% OT</span>
            <span class="badge-pill badge-valid">Score 88</span>
          </div>

          <!-- Driver 3: Suresh Patel -->
          <div class="driver-row flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-xs font-semibold text-slate-800">#3 Suresh Patel</span>
            <span class="text-xs text-slate-600 font-mono">5.6 km/L  92% OT</span>
            <span class="badge-pill badge-warning">Score 79</span>
          </div>

          <!-- Driver 4: Devraj Patel -->
          <div class="driver-row flex items-center justify-between py-2">
            <span class="text-xs font-semibold text-slate-800">#4 Devraj Patel</span>
            <span class="text-xs text-slate-600 font-mono">5.1 km/L  100% OT</span>
            <span class="badge-pill badge-warning">Score 72</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Reports & Analytics matching clean white enterprise theme
</script>

<style scoped>
.reports-page {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header with accent underline bar */
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

/* KPI Box Cards */
.kpi-box {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kpi-box--active {
  border-color: #0284c7;
  background: #f0f9ff;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.12);
}

.kpi-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
  text-transform: uppercase;
}

.kpi-amount {
  font-size: 26px;
  font-weight: 800;
  font-family: monospace, -apple-system;
  line-height: 1.2;
  margin: 6px 0 2px 0;
}

.kpi-subtext {
  font-size: 12px;
  color: #64748b;
}

/* Report Card Container */
.report-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

/* Status Badges */
.badge-pill {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: capitalize;
  font-family: monospace, sans-serif;
}

.badge-expired {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.badge-warning {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.badge-valid {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
</style>
