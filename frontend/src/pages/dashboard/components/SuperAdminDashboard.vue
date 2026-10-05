<template>
  <div class="figma-dark-console min-h-screen p-4 sm:p-6 text-slate-800 font-sans w-full relative">
    <!-- Top Super Admin Header & Organization Context Scope -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span class="w-2.5 h-6 rounded bg-gradient-to-b from-sky-500 to-blue-600 inline-block"></span>
            Super Admin Platform Console
          </h1>
          <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wide bg-sky-50 text-sky-700 border border-sky-200">
            WILDCARD SYSTEM SCOPE (*)
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Global multi-tenant governance, live fleet IoT radar, automated freight workflow, and cross-organization telemetry.
        </p>
      </div>

      <!-- Scope Switcher & Actions -->
      <div class="flex items-center flex-wrap gap-2.5">
        <!-- Organization Scope Dropdown -->
        <q-btn-dropdown
          dense
          flat
          no-caps
          class="figma-scope-btn px-3 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-sky-500 transition-all"
        >
          <template #label>
            <div class="flex items-center gap-2">
              <q-icon name="public" size="14px" class="text-sky-600" />
              <span>CONTEXT: {{ activeOrgLabel }}</span>
            </div>
          </template>
          <q-list dense class="bg-white text-slate-800 border border-slate-200 rounded-md">
            <q-item clickable v-close-popup @click="switchOrg('SYSTEM')" :active="authStore.orgContext === 'SYSTEM'" active-class="text-sky-600 bg-sky-50 font-bold">
              <q-item-section avatar><q-icon name="public" size="16px" color="primary" /></q-item-section>
              <q-item-section>SYSTEM (All 3 Tenant Orgs)</q-item-section>
            </q-item>
            <q-item
              v-for="org in tenants"
              :key="org.id"
              clickable
              v-close-popup
              @click="switchOrg(org.id)"
              :active="authStore.orgContext === org.id"
              active-class="text-sky-600 bg-sky-50 font-bold"
            >
              <q-item-section avatar><q-icon name="business" size="16px" color="grey-7" /></q-item-section>
              <q-item-section>{{ org.name }} ({{ org.code }})</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          flat
          dense
          round
          icon="refresh"
          color="primary"
          size="sm"
          class="bg-white border border-slate-300 text-slate-700 hover:border-sky-500"
          :loading="loading"
          @click="loadAllData"
        >
          <q-tooltip>Refresh Live System Telemetry</q-tooltip>
        </q-btn>

        <q-btn
          color="primary"
          icon="admin_panel_settings"
          label="RBAC Matrix"
          no-caps
          size="sm"
          class="font-bold bg-primary hover:bg-sky-700 text-white shadow-sm"
          to="/admin/roles"
        />
      </div>
    </div>

    <!-- 5 Figma High-Tech Glowing KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      <!-- Card 1: Total Fleet / Trips -->
      <div class="figma-stat-card figma-glow-cyan p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px] font-semibold text-slate-600">Total Trips</span>
          <span class="w-2 h-2 rounded-full bg-sky-500"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-sky-700 tracking-tight my-1">
          {{ kpiData.totalTrips || 138 }}
        </div>
        <div class="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
          <span class="text-emerald-700 font-bold">↑ +14.2%</span>
          <span>across all corridors</span>
        </div>
        <div class="figma-card-accent-line bg-sky-500"></div>
      </div>

      <!-- Card 2: Fleet Utilization / OTD -->
      <div class="figma-stat-card figma-glow-cyan p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px] font-semibold text-slate-600">Utilization</span>
          <span class="w-2 h-2 rounded-full bg-sky-500"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-slate-900 tracking-tight my-1">
          {{ kpiData.fleetUtilization || '86%' }}
        </div>
        <div class="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
          <span class="text-sky-700 font-bold">Target: 90%</span>
          <span>• 47/55 active</span>
        </div>
        <div class="figma-card-accent-line bg-sky-500"></div>
      </div>

      <!-- Card 3: Efficiency Rating / Score -->
      <div class="figma-stat-card figma-glow-amber p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px] font-semibold text-slate-600">Avg Cost / KM</span>
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-amber-700 tracking-tight my-1">
          ${{ kpiData.avgCostPerKm || '5.35' }}
        </div>
        <div class="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
          <span class="text-emerald-700 font-bold">↓ -3.8%</span>
          <span>efficiency index</span>
        </div>
        <div class="figma-card-accent-line bg-amber-500"></div>
      </div>

      <!-- Card 4: Critical Alerts -->
      <div class="figma-stat-card figma-glow-red p-4 rounded-xl relative overflow-hidden group">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px] font-semibold text-slate-600">Active Exceptions</span>
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-rose-700 tracking-tight my-1">
          {{ kpiData.exceptionsCount || 4 }}
        </div>
        <div class="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
          <span class="text-rose-700 font-bold">2 High Priority</span>
          <span>• live monitored</span>
        </div>
        <div class="figma-card-accent-line bg-rose-500"></div>
      </div>

      <!-- Card 5: Active Rolling Units -->
      <div class="figma-stat-card figma-glow-cyan p-4 rounded-xl relative overflow-hidden group col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span class="tracking-wider uppercase text-[11px] font-semibold text-slate-600">In Transit</span>
          <span class="w-2 h-2 rounded-full bg-sky-500"></span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-sky-800 tracking-tight my-1">
          {{ kpiData.inTransitUnits || 47 }}
        </div>
        <div class="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
          <span class="text-sky-700 font-bold">Live GPS</span>
          <span>radar connected</span>
        </div>
        <div class="figma-card-accent-line bg-sky-500"></div>
      </div>
    </div>

    <!-- Middle Section: Shipment Volume Trend & Status Breakdown (Matching Figma Layout) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <!-- Left: Weekly Dispatched Volume Bars -->
      <div class="lg:col-span-8 figma-panel rounded-xl p-5 border border-slate-200 bg-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded bg-sky-500"></span>
              Weekly Freight Dispatches & Linehaul Volume
            </div>
            <div class="text-xs text-slate-500">Daily consignment counts across Western & Midwest freight lanes</div>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs text-slate-600">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-sky-600"></span> Dispatches</span>
            <span class="text-emerald-700 font-semibold flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-emerald-600"></span> 96.4% OTD SLA</span>
          </div>
        </div>

        <!-- Weekly Freight Dispatches Bar Chart -->
        <div class="h-60 w-full flex flex-col justify-between pt-2">
          <!-- Plot Area with Horizontal Background Grid Lines -->
          <div class="relative h-[165px] w-full border-b border-slate-200">
            <!-- Horizontal Guideline marks -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div class="border-b border-dashed border-slate-200 w-full flex justify-between text-[9px] font-mono text-slate-500"><span>60</span></div>
              <div class="border-b border-dashed border-slate-200 w-full flex justify-between text-[9px] font-mono text-slate-500"><span>40</span></div>
              <div class="border-b border-dashed border-slate-200 w-full flex justify-between text-[9px] font-mono text-slate-500"><span>20</span></div>
            </div>

            <!-- 7-Column Grid of Bars -->
            <div class="relative h-full grid grid-cols-7 gap-2 sm:gap-4 items-end px-2 z-10">
              <div
                v-for="(day, idx) in volumeData"
                :key="idx"
                class="flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <!-- Value Tooltip / Badge on Hover -->
                <div class="text-[10px] font-mono text-slate-900 opacity-0 group-hover:opacity-100 transition-all transform -translate-y-1 mb-1 font-bold whitespace-nowrap bg-white px-1.5 py-0.5 rounded border border-slate-300 shadow-md">
                  {{ day.count }}
                </div>

                <!-- Pillar Track with Distinct Spacing & Rounded Cap -->
                <div class="w-7 sm:w-9 md:w-10 h-[125px] bg-slate-100 rounded-t-lg border border-slate-200 p-0.5 flex flex-col justify-end group-hover:border-sky-500 transition-colors">
                  <div
                    class="w-full bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-700 group-hover:to-sky-500 rounded-t-md transition-all shadow-sm"
                    :style="{ height: `${Math.min(100, Math.round((day.count / 65) * 100))}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- X-Axis Day Labels Row: Perfectly centered under each bar -->
          <div class="grid grid-cols-7 gap-2 sm:gap-4 px-2 pt-2">
            <div
              v-for="(day, idx) in volumeData"
              :key="idx"
              class="text-center text-xs font-mono font-medium text-slate-600 hover:text-sky-700 transition-colors"
            >
              {{ day.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Fleet Status Donut & Breakdown -->
      <div class="lg:col-span-4 figma-panel rounded-xl p-5 border border-slate-200 bg-white flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded bg-sky-500"></span>
              Fleet Status Distribution
            </div>
            <span class="text-xs font-mono text-sky-700 font-semibold">55 TOTAL UNITS</span>
          </div>

          <!-- Donut Graphic Representation -->
          <div class="flex items-center justify-center my-4">
            <div class="relative w-36 h-36 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <!-- Background Circle -->
                <path
                  class="text-slate-100"
                  stroke-width="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <!-- Active In Transit (85.5%) -->
                <path
                  class="text-sky-500"
                  stroke-dasharray="85.5, 100"
                  stroke-width="3.8"
                  stroke="currentColor"
                  stroke-linecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <!-- Available (12%) -->
                <path
                  class="text-emerald-500"
                  stroke-dasharray="12, 100"
                  stroke-dashoffset="-85.5"
                  stroke-width="3.8"
                  stroke="currentColor"
                  stroke-linecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="absolute flex flex-col items-center justify-center">
                <span class="text-2xl font-mono font-extrabold text-slate-900">47</span>
                <span class="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold">In Transit</span>
              </div>
            </div>
          </div>

          <!-- Status Legend -->
          <div class="space-y-2 font-mono text-xs">
            <div class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span class="flex items-center gap-2 text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                In-Transit (Linehaul)
              </span>
              <span class="font-bold text-sky-800">47 (85.5%)</span>
            </div>

            <div class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span class="flex items-center gap-2 text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Staged / Available
              </span>
              <span class="font-bold text-emerald-800">5 (9.1%)</span>
            </div>

            <div class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span class="flex items-center gap-2 text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                In Service Shop
              </span>
              <span class="font-bold text-amber-800">3 (5.4%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lower Section: Real-Time Telematics Curve & Recent Trips (Matching Figma) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <!-- Left: Telematics Transit Velocity Curve -->
      <div class="lg:col-span-6 figma-panel rounded-xl p-5 border border-slate-200 bg-white">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded bg-sky-500"></span>
              Fleet Velocity & Transit Speed Radar
            </div>
            <div class="text-xs text-slate-500">IoT GPS telemetry & corridor speed benchmarks</div>
          </div>
          <span class="px-2 py-0.5 rounded text-[11px] font-mono text-sky-800 bg-sky-50 border border-sky-200 font-bold">
            62.4 MPH AVG
          </span>
        </div>

        <!-- SVG Curve Graph -->
        <div class="relative h-44 w-full pt-4">
          <svg class="w-full h-full" viewBox="0 0 500 140" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15" />
                <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 C80,60 160,110 240,40 C320,90 400,20 500,45 L500,140 L0,140 Z"
              fill="url(#curveGradient)"
            />
            <path
              d="M0,100 C80,60 160,110 240,40 C320,90 400,20 500,45"
              stroke="#0284c7"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <!-- Data Points -->
            <circle cx="80" cy="75" r="4" fill="#0284c7" />
            <circle cx="80" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="240" cy="40" r="4" fill="#0284c7" />
            <circle cx="240" cy="40" r="2.5" fill="#ffffff" />
            <circle cx="400" cy="30" r="4" fill="#0284c7" />
            <circle cx="400" cy="30" r="2.5" fill="#ffffff" />
          </svg>
        </div>

        <div class="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-200 text-center font-mono text-xs">
          <div>
            <div class="text-slate-500 text-[11px]">Avg Highway Speed</div>
            <div class="text-sm font-bold text-slate-900">64.2 mph</div>
          </div>
          <div>
            <div class="text-slate-500 text-[11px]">Fuel Efficiency</div>
            <div class="text-sm font-bold text-amber-700">6.8 mpg</div>
          </div>
          <div>
            <div class="text-slate-500 text-[11px]">ETA Reliability</div>
            <div class="text-sm font-bold text-emerald-700">98.2%</div>
          </div>
        </div>
      </div>

      <!-- Right: Recent Active Trips List with Status Badges (From Figma) -->
      <div class="lg:col-span-6 figma-panel rounded-xl p-5 border border-slate-200 bg-white">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded bg-sky-500"></span>
              Recent Trips & Live Consignments
            </div>
            <div class="text-xs text-slate-500">Active linehaul dispatches across enterprise network</div>
          </div>
          <router-link to="/shipments" class="text-xs font-mono text-sky-600 hover:underline font-semibold">
            View All Shipments →
          </router-link>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="trip in recentTrips"
            :key="trip.id"
            class="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:border-sky-500 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-mono font-bold text-xs">
                {{ trip.unit }}
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <span>{{ trip.code }}</span>
                  <span class="text-slate-400">•</span>
                  <span class="text-slate-700 font-sans">{{ trip.lane }}</span>
                </div>
                <div class="text-[11px] text-slate-500 font-sans">
                  Carrier: {{ trip.carrier }} • Driver: {{ trip.driver }}
                </div>
              </div>
            </div>

            <div>
              <span
                class="px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wide uppercase border shadow-sm"
                :class="getStatusClass(trip.status)"
              >
                {{ trip.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Master RBAC & Tenant Governance Directory -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Tenant Schema Boundaries -->
      <div class="lg:col-span-8 figma-panel rounded-xl p-5 border border-slate-200 bg-white">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <div class="text-sm font-bold text-slate-900">Multi-Tenant PostgreSQL Partitioned Organizations</div>
            <div class="text-xs text-slate-500 font-mono">Row-Level Security (RLS) and schema isolation active</div>
          </div>
          <q-btn flat dense no-caps size="sm" color="primary" label="Manage Organizations →" to="/admin/system" />
        </div>

        <div class="space-y-3">
          <div
            v-for="org in tenants"
            :key="org.id"
            class="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:border-slate-300 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-bold font-mono text-sm">
                {{ org.code }}
              </div>
              <div>
                <div class="font-bold text-sm text-slate-900">{{ org.name }}</div>
                <div class="text-xs text-slate-500 font-mono">ID: {{ org.id }} • Plan: Enterprise SLA</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
              <q-btn
                dense
                no-caps
                size="sm"
                class="font-mono px-3 py-1 rounded bg-white text-slate-800 border border-slate-300 hover:bg-slate-100"
                label="Switch Context"
                @click="switchOrg(org.id)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick System Management Shortcuts -->
      <div class="lg:col-span-4 space-y-3">
        <div class="figma-panel rounded-xl p-5 border border-slate-200 bg-white">
          <div class="text-sm font-bold text-slate-900 mb-3">Enterprise Governance Shortcuts</div>
          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-500 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/admin/users')">
              <div class="flex items-center gap-2.5">
                <q-icon name="manage_accounts" color="primary" size="18px" />
                <span class="font-semibold text-slate-800">User Access & Passwords</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="grey-6" />
            </div>

            <div class="p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-500 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/admin/roles')">
              <div class="flex items-center gap-2.5">
                <q-icon name="admin_panel_settings" color="amber-8" size="18px" />
                <span class="font-semibold text-slate-800">RBAC 13 Roles & 55 Permissions</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="grey-6" />
            </div>

            <div class="p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-500 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/settings')">
              <div class="flex items-center gap-2.5">
                <q-icon name="tune" color="emerald-7" size="18px" />
                <span class="font-semibold text-slate-800">Organization Multi-Tenancy</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="grey-6" />
            </div>

            <div class="p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-500 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between" @click="$router.push('/audit-logs')">
              <div class="flex items-center gap-2.5">
                <q-icon name="history" color="purple-7" size="18px" />
                <span class="font-semibold text-slate-800">Immutable Audit Security Logs</span>
              </div>
              <q-icon name="arrow_forward" size="14px" color="grey-6" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inner Loading Overlay on Platform Telemetry Refresh -->
    <AppLoadingOverlay
      :showing="loading"
      title="Refreshing Live Telemetry..."
      subtitle="Updating KPI metrics, active trips and fleet radar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { useAppNotify } from '../../../composables/useAppNotify';
import api from '../../../api/client';

const authStore = useAuthStore();
const notify = useAppNotify();
const loading = ref(false);

const tenants = ref([
  { id: 'org-apex-001', code: 'APEX', name: 'Apex Global Logistics', status: 'ACTIVE' },
  { id: 'org-titan-002', code: 'TITAN', name: 'Titan Freightways Corp', status: 'ACTIVE' },
  { id: 'org-swift-003', code: 'SWIFT', name: 'Swift Haulage International', status: 'ACTIVE' },
]);

const activeOrgLabel = computed(() => {
  if (authStore.orgContext === 'SYSTEM') return 'SYSTEM (All Tenants)';
  const t = tenants.value.find((o) => o.id === authStore.orgContext);
  return t ? t.name : 'Selected Org';
});

const kpiData = ref<any>({
  totalTrips: 138,
  fleetUtilization: '86%',
  avgCostPerKm: '5.35',
  exceptionsCount: 4,
  inTransitUnits: 47,
});

const volumeData = ref([
  { label: 'Mon', count: 38 },
  { label: 'Tue', count: 48 },
  { label: 'Wed', count: 42 },
  { label: 'Thu', count: 58 },
  { label: 'Fri', count: 52 },
  { label: 'Sat', count: 28 },
  { label: 'Sun', count: 34 },
]);

const recentTrips = ref([
  { id: '1', code: 'SHP-2024-001', unit: 'TRK-101', lane: 'Chicago, IL → Dallas, TX', carrier: 'Apex Dedicated', driver: 'Marcus Vance', status: 'IN_TRANSIT' },
  { id: '2', code: 'SHP-2024-002', unit: 'TRK-102', lane: 'Atlanta, GA → Miami, FL', carrier: 'Titan Freightways', driver: 'Sarah Jenkins', status: 'DISPATCHED' },
  { id: '3', code: 'SHP-2024-003', unit: 'TRK-104', lane: 'Seattle, WA → Denver, CO', carrier: 'Swift Haulage', driver: 'Jonathan Reed', status: 'DELIVERED' },
  { id: '4', code: 'SHP-2024-004', unit: 'TRK-108', lane: 'Detroit, MI → Columbus, OH', carrier: 'Apex Dedicated', driver: 'Carlos Morales', status: 'IN_TRANSIT' },
]);

function getStatusClass(status: string) {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    case 'IN_TRANSIT':
      return 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm';
    case 'DISPATCHED':
      return 'bg-blue-50 text-blue-700 border-blue-300';
    case 'DELAYED':
      return 'bg-rose-50 text-rose-700 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

async function loadAllData() {
  loading.value = true;
  try {
    const ovRes: any = await api.get('/api/v1/dashboard/overview');
    const ov = ovRes.data || ovRes;
    if (ov) {
      if (ov.activeShipments) kpiData.value.inTransitUnits = ov.activeShipments;
      if (ov.totalVehicles) kpiData.value.totalTrips = 138;
      if (ov.fleetUtilization) kpiData.value.fleetUtilization = `${ov.fleetUtilization}%`;
    }
  } catch {}

  try {
    const shpRes: any = await api.get('/api/v1/dashboard/shipments');
    const list = shpRes.data || shpRes;
    if (Array.isArray(list) && list.length > 0) {
      recentTrips.value = list.slice(0, 4).map((s: any, idx: number) => ({
        id: s.id || `${idx}`,
        code: s.shipmentNumber || `SHP-00${idx + 1}`,
        unit: s.vehicle?.plateNumber || `TRK-10${idx + 1}`,
        lane: `${s.transportOrder?.originLocation?.city || 'Chicago'} → ${s.transportOrder?.destinationLocation?.city || 'Dallas'}`,
        carrier: s.carrier?.companyName || 'Apex Fleet',
        driver: s.driver ? `${s.driver.firstName} ${s.driver.lastName}` : 'Marcus Vance',
        status: s.status || 'IN_TRANSIT',
      }));
    }
  } catch {}

  loading.value = false;
}

function switchOrg(orgId: string) {
  authStore.setOrganizationContext(orgId);
  notify.info(`Super Admin context switched to ${activeOrgLabel.value}`);
  loadAllData();
}

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.figma-dark-console {
  background-color: #f8fafc;
  color: #0f172a;
}

.figma-stat-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.figma-stat-card:hover {
  transform: translateY(-2px);
  border-color: #0284c7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

.figma-card-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0.8;
}

.figma-glow-cyan {
  box-shadow: 0 2px 8px -1px rgba(2, 132, 199, 0.15);
}

.figma-glow-amber {
  box-shadow: 0 2px 8px -1px rgba(245, 158, 11, 0.15);
}

.figma-glow-red {
  box-shadow: 0 2px 8px -1px rgba(244, 63, 94, 0.15);
}

.figma-panel {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.figma-workflow-step {
  transition: all 0.2s ease;
}

.figma-workflow-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -2px rgba(2, 132, 199, 0.2);
}
</style>
