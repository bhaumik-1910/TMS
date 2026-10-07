<template>
  <div class="billing-page-container min-h-screen text-slate-800 p-6 overflow-y-auto">
    <!-- Header matching Billing Page -->
    <div class="flex items-center justify-between mb-6">
      <div class="billing-title-wrap">
        <h1 class="text-2xl font-bold text-slate-900 tracking-wide">Maintenance / Job Cards</h1>
        <div class="billing-underline"></div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportMaintenancePdf"
        >
          <q-icon name="picture_as_pdf" size="16px" class="q-mr-xs text-rose-600" />
          <span>Export PDF</span>
        </button>
        <button
          type="button"
          class="btn-secondary-action"
          @click="exportMaintenanceCsv"
        >
          <q-icon name="download" size="16px" class="q-mr-xs text-slate-600" />
          <span>Export CSV</span>
        </button>
        <button
          type="button"
          class="btn-primary-cyan"
          @click="openAddDialog"
        >
          <q-icon name="add" size="18px" />
          <span>New Job Card</span>
        </button>
      </div>
    </div>

    <!-- Maintenance Workspace Content with Loading Overlay -->
    <div class="relative min-h-[400px]">
      <!-- 4 KPI Stat Cards matching Billing Page -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'all' }"
          @click="selectKpiTab('all')"
          title="View all job cards (Alt+1 or [ / ])"
        >
          <div class="kpi-title text-sky-600">TOTAL REPAIR EXPENSE</div>
          <div class="kpi-amount text-sky-700">₹{{ formattedTotalCost }}</div>
          <div class="kpi-subtext">{{ jobCards.length }} total records (Alt+1)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'active' }"
          @click="selectKpiTab(activeKpiFilter === 'active' ? 'all' : 'active')"
          title="Filter active vehicles in workshop (Alt+2 or [ / ])"
        >
          <div class="kpi-title text-amber-700">ACTIVE JOB CARDS</div>
          <div class="kpi-amount text-amber-600">{{ activeCount }}</div>
          <div class="kpi-subtext">Vehicles in workshop (Alt+2)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'downtime' }"
          @click="selectKpiTab(activeKpiFilter === 'downtime' ? 'all' : 'downtime')"
          title="Filter high downtime repairs (Alt+3 or [ / ])"
        >
          <div class="kpi-title text-slate-700">AVG DOWNTIME</div>
          <div class="kpi-amount text-slate-800">2.1 Days</div>
          <div class="kpi-subtext">Workshop turnaround time (Alt+3)</div>
        </div>

        <div
          class="kpi-box cursor-pointer transition-all"
          :class="{ 'kpi-box--active': activeKpiFilter === 'completed' }"
          @click="selectKpiTab(activeKpiFilter === 'completed' ? 'all' : 'completed')"
          title="Filter certified completed repairs (Alt+4 or [ / ])"
        >
          <div class="kpi-title text-emerald-700">COMPLETED REPAIRS</div>
          <div class="kpi-amount text-emerald-600">{{ completedCount }}</div>
          <div class="kpi-subtext">Road-tested &amp; certified (Alt+4)</div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="relative min-w-[280px]">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sky-500">
              <q-icon name="search" size="18px" />
            </span>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input w-full pl-9 pr-4 py-2 text-sm rounded-lg"
              placeholder="Search vehicle / job card / complaint... (Alt+F)"
              @keydown.down.prevent="focusFirstTableRow"
              @keydown.enter.prevent="focusFirstTableRow"
              @keydown.esc="searchQuery = ''"
            />
            <button
              v-if="searchQuery"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
              @click="searchQuery = ''"
              title="Clear search (Esc)"
            >
              <q-icon name="close" size="16px" />
            </button>
          </div>

          <q-select
            v-model="statusFilter"
            :options="filterStatusOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 150px;"
          />

          <q-select
            v-model="workTypeFilter"
            :options="filterWorkTypeOptions"
            dense
            outlined
            emit-value
            map-options
            class="desk-filter-select"
            style="min-width: 180px;"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-secondary-action flex items-center gap-1.5"
            :disabled="isRefreshing"
            @click="onRefresh"
          >
            <q-icon name="refresh" size="16px" :class="{ 'rotate-180': isRefreshing }" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- White Theme Table with 2D Excel Navigation matching Billing Page -->
      <div class="table-container rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse" ref="tableRef">
            <thead>
              <tr class="table-head-row text-[12px] uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 0 }">JOB CARD</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 1 }">VEHICLE</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 2 }">COMPLAINT</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 3 }">WORK TYPE</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 4 }">SERVICE CENTRE</th>
                <th class="py-3 px-4 font-bold text-right transition-colors" :class="{ 'excel-th-active': focusedCol === 5 }">COST</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 6 }">DOWNTIME</th>
                <th class="py-3 px-4 font-bold transition-colors" :class="{ 'excel-th-active': focusedCol === 7 }">DATE</th>
                <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 8 }">STATUS</th>
                <th class="py-3 px-4 font-bold text-center transition-colors" :class="{ 'excel-th-active': focusedCol === 9 }">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="(card, rIdx) in filteredJobCards"
                :key="card.id || card.jobCardId"
                class="billing-table-row hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                :class="{ 'excel-row-active': isRowActive(rIdx) }"
                tabindex="0"
                @keydown="handleTableRowKeydown($event, card, rIdx, focusedCol)"
                @focus="setFocusIndex(rIdx)"
              >
                <!-- Col 0: JOB CARD -->
                <td
                  class="py-3 px-4 font-mono font-bold text-sky-600 transition-all select-none"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 0) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 0)"
                >
                  <span class="pl-2">{{ card.jobCardId || card.jobCard }}</span>
                </td>

                <!-- Col 1: VEHICLE -->
                <td
                  class="py-3 px-4 font-mono font-semibold text-slate-900 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 1) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 1)"
                >
                  {{ card.vehicle }}
                </td>

                <!-- Col 2: COMPLAINT -->
                <td
                  class="py-3 px-4 text-slate-700 truncate max-w-[200px] transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 2) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 2)"
                  :title="card.complaint"
                >
                  {{ card.complaint }}
                </td>

                <!-- Col 3: WORK TYPE -->
                <td
                  class="py-3 px-4 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 3) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 3)"
                >
                  <span class="badge-pill" :class="getWorkTypeBadgeClass(card.workType)">
                    {{ card.workType }}
                  </span>
                </td>

                <!-- Col 4: SERVICE CENTRE -->
                <td
                  class="py-3 px-4 text-slate-800 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 4) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 4)"
                >
                  {{ card.serviceCentre }}
                </td>

                <!-- Col 5: COST -->
                <td
                  class="py-3 px-4 font-mono font-bold text-slate-900 text-right transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 5) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 5)"
                >
                  {{ formatCostDisplay(card.totalCost || card.cost) }}
                </td>

                <!-- Col 6: DOWNTIME -->
                <td
                  class="py-3 px-4 font-mono text-slate-600 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 6) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 6)"
                >
                  {{ card.expectedDowntime || card.downtime || '—' }}
                </td>

                <!-- Col 7: DATE -->
                <td
                  class="py-3 px-4 font-mono text-slate-600 transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 7) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 7)"
                >
                  {{ card.date }}
                </td>

                <!-- Col 8: STATUS -->
                <td
                  class="py-3 px-4 text-center transition-all"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 8) }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 8)"
                >
                  <span class="badge-pill" :class="getStatusBadgeClass(card.status)">
                    {{ card.status }}
                  </span>
                </td>

                <!-- Col 9: ACTION -->
                <td
                  class="py-3 px-4 text-center transition-all action-cell"
                  :class="{ 'excel-cell-active': isCellActive(rIdx, 9) && focusedActionIndex === -1 }"
                  tabindex="-1"
                  @click="setFocusCell(rIdx, 9)"
                >
                  <div class="flex items-center justify-center gap-1.5" @click.stop>
                    <button
                      class="btn-table-action"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 9, 0) }"
                      @click="openDetails(card)"
                      @focus="setActionFocus(rIdx, 9, 0)"
                      title="View Details (Enter)"
                    >
                      View
                    </button>
                    <button
                      class="btn-table-icon"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 9, 1) }"
                      @click="printSingleJobCard(card)"
                      @focus="setActionFocus(rIdx, 9, 1)"
                      title="Print Job Card (Enter)"
                    >
                      <q-icon name="print" size="14px" />
                    </button>
                    <button
                      class="btn-table-icon"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 9, 2) }"
                      @click="editJobCard(card)"
                      @focus="setActionFocus(rIdx, 9, 2)"
                      title="Edit Job Card (Enter)"
                    >
                      <q-icon name="edit" size="14px" />
                    </button>
                    <button
                      class="btn-table-icon btn-table-icon--danger"
                      :class="{ 'excel-btn-active': isActionBtnActive(rIdx, 9, 3) }"
                      @click="confirmDeleteCard(card)"
                      @focus="setActionFocus(rIdx, 9, 3)"
                      title="Delete Job Card (Enter / Del)"
                    >
                      <q-icon name="delete" size="14px" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredJobCards.length === 0">
                <td colspan="10" class="text-center py-12">
                  <div class="flex flex-col items-center justify-center text-center p-8">
                    <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <q-icon name="build_circle" size="28px" class="text-slate-400" />
                    </div>
                    <div class="text-base font-bold text-slate-800">No matching job cards found</div>
                    <div class="text-xs text-slate-500 mt-1">Try adjusting search terms or clearing active filters.</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Excel / Tally Keyboard Status Bar Footer -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono select-none">
          <div class="flex items-center gap-3">
            <span class="font-bold text-sky-600">CELL: {{ currentCellCoordinate }}</span>
            <span class="text-slate-300">|</span>
            <span>Row {{ focusedRow + 1 }} of {{ filteredJobCards.length }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-500">Col: {{ focusedColName }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-sky-700 font-medium">Tab: {{ currentTabLabel }}</span>
          </div>
          <div class="flex items-center gap-3 text-slate-500">
            <span><kbd class="desk-kbd">&uarr;&darr;&larr;&rarr;</kbd> Move Cell</span>
            <span><kbd class="desk-kbd">Tab</kbd> Next</span>
            <span><kbd class="desk-kbd">[ / ]</kbd> Switch Tab</span>
            <span><kbd class="desk-kbd">Enter</kbd> Edit</span>
            <span><kbd class="desk-kbd">Del</kbd> Delete</span>
            <span><kbd class="desk-kbd">Alt+N</kbd> New</span>
          </div>
        </div>
      </div>

      <AppLoadingOverlay
        :showing="isRefreshing"
        title="Syncing Workshop Records..."
        subtitle="Updating maintenance job cards from database"
      />
    </div>

    <!-- Create / Edit Job Card Right Drawer -->
    <DeskDialog
      v-model="showModal"
      :title="isEditing ? 'Edit Job Card' : 'New Job Card'"
      position="right"
      width="540px"
      confirm-label="Save"
      cancel-label="Cancel"
      :persistent="false"
      @confirm="saveJobCard"
      @cancel="showModal = false"
    >
      <DeskForm @submit="saveJobCard">
        <div class="row q-col-gutter-md">
          <!-- SECTION 1: JOB DETAILS -->
          <div class="col-12">
            <div class="text-subtitle2 text-weight-bold text-sky-700 q-mb-xs font-mono uppercase tracking-wider">
              JOB DETAILS
            </div>
          </div>

          <!-- Row 1: JOB CARD ID & DATE -->
          <div class="col-12 col-md-6">
            <DeskField label="JOB CARD ID" required>
              <q-input
                v-model="cardForm.jobCardId"
                dense
                outlined
                placeholder="JC/240056"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="DATE" required>
              <q-input
                v-model="cardForm.date"
                dense
                outlined
                type="date"
                placeholder="mm/dd/yyyy"
              />
            </DeskField>
          </div>

          <!-- Row 2: VEHICLE & SERVICE CENTRE -->
          <div class="col-12 col-md-6">
            <DeskField label="VEHICLE" required>
              <q-select
                v-model="cardForm.vehicle"
                :options="vehicleOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="SERVICE CENTRE" required>
              <q-select
                v-model="cardForm.serviceCentre"
                :options="serviceCentreOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 3: WORK TYPE & STATUS -->
          <div class="col-12 col-md-6">
            <DeskField label="WORK TYPE" required>
              <q-select
                v-model="cardForm.workType"
                :options="workTypeOptions"
                dense
                outlined
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="STATUS" required>
              <q-select
                v-model="cardForm.status"
                :options="['Open', 'In Progress', 'Completed', 'Cancelled']"
                dense
                outlined
              />
            </DeskField>
          </div>

          <!-- Row 4: COMPLAINT / SYMPTOMS -->
          <div class="col-12">
            <DeskField label="COMPLAINT / SYMPTOMS" required>
              <q-input
                v-model="cardForm.complaint"
                type="textarea"
                rows="3"
                dense
                outlined
                placeholder="Describe the problem or scheduled service reason"
              />
            </DeskField>
          </div>

          <!-- SECTION 2: COST & DOWNTIME -->
          <div class="col-12 q-mt-sm">
            <div class="text-subtitle2 text-weight-bold text-sky-700 q-mb-xs font-mono uppercase tracking-wider">
              COST &amp; DOWNTIME
            </div>
          </div>

          <!-- Row 1: PARTS USED & LABOUR COST -->
          <div class="col-12 col-md-6">
            <DeskField label="PARTS USED">
              <q-input
                v-model="cardForm.partsUsed"
                dense
                outlined
                placeholder="Gasket set, coolant..."
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="LABOUR COST (₹)">
              <q-input
                v-model="cardForm.labourCostFormatted"
                dense
                outlined
                placeholder="₹8,000"
              />
            </DeskField>
          </div>

          <!-- Row 2: TOTAL COST & EXPECTED DOWNTIME -->
          <div class="col-12 col-md-6">
            <DeskField label="TOTAL COST (₹)" required>
              <q-input
                v-model="cardForm.totalCostFormatted"
                dense
                outlined
                placeholder="₹45,000"
              />
            </DeskField>
          </div>

          <div class="col-12 col-md-6">
            <DeskField label="EXPECTED DOWNTIME">
              <q-input
                v-model="cardForm.expectedDowntime"
                dense
                outlined
                placeholder="5 days / 4 hours"
              />
            </DeskField>
          </div>
        </div>
      </DeskForm>
    </DeskDialog>

    <!-- View Job Card Details Desk Dialog -->
    <DeskDialog
      v-model="showDetailsModal"
      :title="`Workshop Job Card — ${selectedCard?.jobCardId || selectedCard?.jobCard}`"
      width="600px"
      confirm-label="Print Job Card"
      cancel-label="Close"
      @confirm="printSingleJobCard(selectedCard)"
      @cancel="showDetailsModal = false"
    >
      <div v-if="selectedCard" class="q-py-xs">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="text-caption text-slate-500">Vehicle Registration</div>
            <div class="text-h6 text-weight-bold text-slate-900 font-mono">{{ selectedCard.vehicle }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-slate-500">Work Type Category</div>
            <div class="text-body1 text-sky-700 text-weight-medium">{{ selectedCard.workType }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-slate-500">Authorized Workshop</div>
            <div class="text-body2 text-slate-900 font-bold">{{ selectedCard.serviceCentre }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-slate-500">Approved Repair Cost</div>
            <div class="text-h6 text-weight-bold text-slate-900 font-mono">{{ formatCostDisplay(selectedCard.totalCost || selectedCard.cost) }}</div>
          </div>

          <div class="col-6">
            <div class="text-caption text-slate-500">Job Card Date</div>
            <div class="text-body2 text-slate-700 font-mono">{{ selectedCard.date }}</div>
          </div>
          <div class="col-6">
            <div class="text-caption text-slate-500">Turnaround Downtime</div>
            <div class="text-body2 text-slate-700 font-mono">{{ selectedCard.expectedDowntime || selectedCard.downtime }}</div>
          </div>

          <div class="col-12">
            <div class="text-caption text-slate-500 q-mb-xs">Reported Complaint / Defect Observation</div>
            <div class="q-pa-sm rounded-borders bg-slate-50 text-slate-800 text-body2 border border-slate-200">
              "{{ selectedCard.complaint }}"
            </div>
          </div>

          <div class="col-12">
            <div class="text-caption text-slate-500 q-mb-xs">Current Maintenance Status</div>
            <span
              class="badge-pill"
              :class="getStatusBadgeClass(selectedCard.status)"
            >
              {{ selectedCard.status }}
            </span>
          </div>
        </div>
      </div>
    </DeskDialog>

    <!-- Delete Confirmation Dialog -->
    <DeskDialog
      v-model="showDeleteDialog"
      title="Confirm Delete Job Card"
      icon="warning"
      width="480px"
      confirm-label="Delete Job Card"
      confirm-color="red-7"
      cancel-label="Cancel"
      @confirm="executeDeleteCard"
      @cancel="showDeleteDialog = false"
    >
      <div class="q-py-sm">
        <div class="text-body1 text-slate-800 q-mb-sm">
          Are you sure you want to permanently delete Job Card
          <span class="text-sky-700 text-weight-bold font-mono">{{ deletingCard?.jobCardId || deletingCard?.jobCard }}</span>
          for Vehicle <strong class="text-slate-900">{{ deletingCard?.vehicle }}</strong>?
        </div>
        <div class="text-caption text-rose-600">
          This operation will remove the maintenance record and related workshop costs.
        </div>
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/client';
import { useAppNotify } from '../../composables/useAppNotify';
import { useTableNavigation } from '../../composables/useTableNavigation';
import { exportToCsv } from '../../utils/exportCsv';
import { exportToPdf } from '../../utils/exportPdf';
import AppLoadingOverlay from '../../components/AppLoadingOverlay.vue';
import {
  DeskDialog,
  DeskForm,
  DeskField,
} from '../../framework';
import { useDeskPageShortcuts } from '../../desk';

export interface JobCard {
  id?: string;
  jobCardId: string;
  jobCard?: string;
  vehicle: string;
  serviceCentre: string;
  workType: string;
  status: string;
  complaint: string;
  partsUsed?: string;
  labourCost?: number | string;
  totalCost?: number | string;
  cost?: string | number;
  expectedDowntime?: string;
  downtime?: string;
  date: string;
}

const notify = useAppNotify();
const searchInputRef = ref();

const showModal = ref(false);
const isEditing = ref(false);
const editingCard = ref<JobCard | null>(null);

const showDetailsModal = ref(false);
const selectedCard = ref<JobCard | null>(null);

const showDeleteDialog = ref(false);
const deletingCard = ref<JobCard | null>(null);

// KPI Filter Tabs matching Billing Page design
const activeKpiFilter = ref<'all' | 'active' | 'downtime' | 'completed'>('all');
const kpiTabs: Array<'all' | 'active' | 'downtime' | 'completed'> = ['all', 'active', 'downtime', 'completed'];

function selectKpiTab(tab: 'all' | 'active' | 'downtime' | 'completed') {
  activeKpiFilter.value = tab;
  setFocusCell(0, 0);
}

function switchKpiTab(direction: 'next' | 'prev') {
  const currentIdx = kpiTabs.indexOf(activeKpiFilter.value);
  const nextIdx =
    direction === 'next'
      ? (currentIdx + 1) % kpiTabs.length
      : (currentIdx - 1 + kpiTabs.length) % kpiTabs.length;
  selectKpiTab(kpiTabs[nextIdx]);
}

function openDetails(card: JobCard) {
  selectedCard.value = card;
  showDetailsModal.value = true;
}

function printSingleJobCard(card: JobCard | null) {
  if (!card) return;
  window.print();
}

const searchQuery = ref('');
const statusFilter = ref('ALL');
const workTypeFilter = ref('ALL');

// Dropdown options
const vehicleOptions = ref<string[]>([
  '— Select —',
  'GJ-01-AB-1122',
  'GJ-01-AC-3444',
  'MH-14-DX-9000',
  'RJ-13-TR-7788',
  'GJ-05-BT-2211',
  'MH-12-AA-5500',
]);

const serviceCentreOptions = [
  '— Select —',
  'Shree Motors',
  'RK Auto',
  'SB Workshop',
  'City Auto Care',
];

const workTypeOptions = [
  '— Select —',
  'Engine Overhaul',
  'Tyre Replacement',
  'Brake Service',
  'Oil Change',
  'AC Repair',
  'Body Work',
  'Electrical Repair',
  'General Service',
  'Preventive Service',
];

const filterStatusOptions = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Open', value: 'Open' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const filterWorkTypeOptions = [
  { label: 'All Work Types', value: 'ALL' },
  { label: 'Engine Overhaul', value: 'Engine Overhaul' },
  { label: 'Tyre Replacement', value: 'Tyre Replacement' },
  { label: 'Brake Service', value: 'Brake Service' },
  { label: 'Oil Change', value: 'Oil Change' },
  { label: 'AC Repair', value: 'AC Repair' },
  { label: 'Body Work', value: 'Body Work' },
  { label: 'Electrical Repair', value: 'Electrical Repair' },
  { label: 'General Service', value: 'General Service' },
  { label: 'Preventive Service', value: 'Preventive Service' },
];

const columnLabels = [
  'Job Card',
  'Vehicle',
  'Complaint',
  'Work Type',
  'Service Centre',
  'Cost',
  'Downtime',
  'Date',
  'Status',
  'Action',
];

const tableRef = ref<HTMLElement | null>(null);

const defaultJobCards: JobCard[] = [
  {
    id: 'JC/240055',
    jobCardId: 'JC/240055',
    jobCard: 'JC/240055',
    vehicle: 'GJ-01-AC-3444',
    complaint: 'Engine overheating, white smoke',
    workType: 'Engine Overhaul',
    serviceCentre: 'Shree Motors',
    partsUsed: 'Gasket set, coolant',
    labourCost: 8000,
    totalCost: 45000,
    cost: '₹45,000',
    expectedDowntime: '5 days',
    downtime: '5 days',
    date: '2026-10-20',
    status: 'In Progress',
  },
  {
    id: 'JC/240054',
    jobCardId: 'JC/240054',
    jobCard: 'JC/240054',
    vehicle: 'MH-14-DX-9000',
    complaint: 'Front axle brake liner wear & air leak',
    workType: 'Brake Service',
    serviceCentre: 'RK Auto',
    partsUsed: 'Brake pads, air valves',
    labourCost: 4500,
    totalCost: 18500,
    cost: '₹18,500',
    expectedDowntime: '1 day',
    downtime: '1 day',
    date: '2026-10-18',
    status: 'Open',
  },
  {
    id: 'JC/240053',
    jobCardId: 'JC/240053',
    jobCard: 'JC/240053',
    vehicle: 'GJ-05-BT-2211',
    complaint: 'Axle 2 dual tyre puncture & realignment',
    workType: 'Tyre Replacement',
    serviceCentre: 'SB Workshop',
    partsUsed: 'Tubeless valves',
    labourCost: 1200,
    totalCost: 3200,
    cost: '₹3,200',
    expectedDowntime: '4 hours',
    downtime: '4 hours',
    date: '2026-10-16',
    status: 'Completed',
  },
  {
    id: 'JC/240052',
    jobCardId: 'JC/240052',
    jobCard: 'JC/240052',
    vehicle: 'RJ-13-TR-7788',
    complaint: 'Periodic maintenance 40,000 KM & oil filter replacement',
    workType: 'Oil Change',
    serviceCentre: 'City Auto Care',
    partsUsed: 'Engine oil 15W40, filters',
    labourCost: 2500,
    totalCost: 14200,
    cost: '₹14,200',
    expectedDowntime: '6 hours',
    downtime: '6 hours',
    date: '2026-10-15',
    status: 'Completed',
  },
];

const jobCards = ref<JobCard[]>([]);

const cardForm = ref({
  id: '',
  jobCardId: 'JC/240056',
  date: new Date().toISOString().slice(0, 10),
  vehicle: '— Select —',
  serviceCentre: '— Select —',
  workType: '— Select —',
  status: 'Open',
  complaint: '',
  partsUsed: '',
  labourCostFormatted: '₹8,000',
  totalCostFormatted: '₹45,000',
  expectedDowntime: '5 days / 4 hours',
});

const isRefreshing = ref(false);

onMounted(async () => {
  await loadJobCards();
  fetchDynamicVehicles();
});

async function loadJobCards() {
  isRefreshing.value = true;
  try {
    const res = await api.get('/api/v1/job-cards');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      jobCards.value = res.data;
    } else {
      jobCards.value = [...defaultJobCards];
    }
  } catch (err) {
    console.warn('Could not load job cards from API, fallback to localStorage:', err);
    const saved = localStorage.getItem('tms_job_cards');
    if (saved) {
      try {
        jobCards.value = JSON.parse(saved);
      } catch {
        jobCards.value = defaultJobCards;
      }
    } else {
      jobCards.value = defaultJobCards;
    }
  } finally {
    isRefreshing.value = false;
  }
}

async function fetchDynamicVehicles() {
  try {
    const res = await api.get('/api/v1/vehicles');
    if (res.data && Array.isArray(res.data)) {
      const vList = res.data
        .map((v: any) => v.registrationNumber || v.vehicleNumber || v.regNo || v.plateNumber)
        .filter(Boolean);
      for (const reg of vList) {
        if (!vehicleOptions.value.includes(reg)) {
          vehicleOptions.value.push(reg);
        }
      }
    }
  } catch {
    // Keep defaults
  }
}

function persistLocal() {
  localStorage.setItem('tms_job_cards', JSON.stringify(jobCards.value));
}

function formatCostDisplay(val: any): string {
  if (!val) return '₹0';
  if (typeof val === 'string' && val.startsWith('₹')) return val;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

const activeCount = computed(() => {
  return jobCards.value.filter((c) => c.status !== 'Completed' && c.status !== 'Cancelled').length;
});

const completedCount = computed(() => {
  return jobCards.value.filter((c) => c.status === 'Completed').length;
});

const formattedTotalCost = computed(() => {
  const sum = jobCards.value.reduce((acc, curr) => {
    const num = parseCurrency(String(curr.totalCost || curr.cost || 0));
    return acc + num;
  }, 0);
  return sum.toLocaleString('en-IN');
});

const filteredJobCards = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim();
  let list = jobCards.value;

  if (activeKpiFilter.value === 'active') {
    list = list.filter((c) => c.status !== 'Completed' && c.status !== 'Cancelled');
  } else if (activeKpiFilter.value === 'completed') {
    list = list.filter((c) => c.status === 'Completed');
  } else if (activeKpiFilter.value === 'downtime') {
    list = list.filter((c) => (c.expectedDowntime || c.downtime || '').includes('day'));
  }

  return list.filter((c) => {
    const jcId = (c.jobCardId || c.jobCard || '').toLowerCase();
    const veh = (c.vehicle || '').toLowerCase();
    const comp = (c.complaint || '').toLowerCase();
    const sc = (c.serviceCentre || '').toLowerCase();
    const matchSearch = !q || jcId.includes(q) || veh.includes(q) || comp.includes(q) || sc.includes(q);
    const matchStatus = statusFilter.value === 'ALL' || c.status === statusFilter.value;
    const matchType = workTypeFilter.value === 'ALL' || c.workType === workTypeFilter.value;
    return matchSearch && matchStatus && matchType;
  });
});

// Full 2D Excel & Tally Table Navigation
const {
  focusedRow,
  focusedCol,
  focusedIndex,
  focusedActionIndex,
  isCellActive,
  isActionBtnActive,
  isRowActive,
  setFocusCell,
  setActionFocus,
  setFocusIndex,
  handleKeydown: baseTableRowKeydown,
  moveFirst: focusFirstTableRow,
} = useTableNavigation<JobCard>({
  items: filteredJobCards,
  colCount: columnLabels.length,
  tableRef,
  onEnter: (item) => editJobCard(item),
  onDelete: (item) => confirmDeleteCard(item),
  onNew: () => openAddDialog(),
  onEscape: () => {
    searchInputRef.value?.focus?.();
  },
});

function handleTableRowKeydown(
  e: KeyboardEvent,
  item: JobCard,
  rIdx: number,
  cIdx?: number
) {
  if (e.key === '[') {
    e.preventDefault();
    e.stopPropagation();
    switchKpiTab('prev');
    return;
  }
  if (e.key === ']') {
    e.preventDefault();
    e.stopPropagation();
    switchKpiTab('next');
    return;
  }
  baseTableRowKeydown(e, item, rIdx, cIdx);
}

const colLetter = computed(() => String.fromCharCode(65 + (focusedCol.value || 0)));
const currentCellCoordinate = computed(() => {
  if (filteredJobCards.value.length === 0) return 'A1';
  return `${colLetter.value}${focusedRow.value + 1}`;
});

const focusedColName = computed(() => {
  if (focusedCol.value === 9) {
    const actions = ['View', 'Print', 'Edit', 'Delete'];
    const act = actions[focusedActionIndex.value] || 'View';
    return `Action [${act}]`;
  }
  return columnLabels[focusedCol.value] || '—';
});

const currentTabLabel = computed(() => {
  switch (activeKpiFilter.value) {
    case 'active':
      return 'Active Job Cards (Alt+2)';
    case 'downtime':
      return 'High Downtime (Alt+3)';
    case 'completed':
      return 'Completed Repairs (Alt+4)';
    default:
      return 'All Records (Alt+1)';
  }
});

function getWorkTypeBadgeClass(type: string): string {
  switch (type) {
    case 'Engine Overhaul':
      return 'badge-forward';
    case 'Tyre Replacement':
      return 'badge-toll';
    case 'Brake Service':
      return 'badge-repair';
    case 'Oil Change':
      return 'badge-bhatta';
    default:
      return 'badge-exempt';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Completed':
      return 'badge-paid';
    case 'In Progress':
      return 'badge-pending';
    case 'Open':
      return 'badge-rcm';
    case 'Cancelled':
      return 'badge-overdue';
    default:
      return 'badge-exempt';
  }
}

function openAddDialog() {
  isEditing.value = false;
  editingCard.value = null;
  const seq = 240056 + jobCards.value.length;
  cardForm.value = {
    id: `JC/${seq}`,
    jobCardId: `JC/${seq}`,
    date: new Date().toISOString().slice(0, 10),
    vehicle: '— Select —',
    serviceCentre: '— Select —',
    workType: '— Select —',
    status: 'Open',
    complaint: '',
    partsUsed: '',
    labourCostFormatted: '₹8,000',
    totalCostFormatted: '₹45,000',
    expectedDowntime: '5 days / 4 hours',
  };
  showModal.value = true;
}

function editJobCard(card: JobCard) {
  isEditing.value = true;
  editingCard.value = card;

  const total = parseCurrency(String(card.totalCost || card.cost || 45000));
  const labour = parseCurrency(String(card.labourCost || 8000));

  cardForm.value = {
    id: card.id || card.jobCardId || card.jobCard || 'JC/240055',
    jobCardId: card.jobCardId || card.jobCard || 'JC/240055',
    date: card.date || new Date().toISOString().slice(0, 10),
    vehicle: card.vehicle || 'GJ-01-AC-3444',
    serviceCentre: card.serviceCentre || 'Shree Motors',
    workType: card.workType || 'Engine Overhaul',
    status: card.status || 'In Progress',
    complaint: card.complaint || 'Engine overheating, white smoke',
    partsUsed: card.partsUsed || 'Gasket set, coolant',
    labourCostFormatted: `₹${labour.toLocaleString('en-IN')}`,
    totalCostFormatted: `₹${total.toLocaleString('en-IN')}`,
    expectedDowntime: card.expectedDowntime || card.downtime || '5 days',
  };
  showModal.value = true;
}

async function saveJobCard() {
  if (
    !cardForm.value.jobCardId ||
    cardForm.value.vehicle === '— Select —' ||
    cardForm.value.serviceCentre === '— Select —' ||
    cardForm.value.workType === '— Select —'
  ) {
    notify.notifyWarning('Please select Vehicle, Service Centre, and Work Type.');
    return;
  }

  const labourNum = parseCurrency(cardForm.value.labourCostFormatted);
  const totalNum = parseCurrency(cardForm.value.totalCostFormatted);

  const payload: any = {
    id: cardForm.value.jobCardId,
    jobCardId: cardForm.value.jobCardId,
    jobCard: cardForm.value.jobCardId,
    date: cardForm.value.date,
    vehicle: cardForm.value.vehicle,
    serviceCentre: cardForm.value.serviceCentre,
    workType: cardForm.value.workType,
    status: cardForm.value.status,
    complaint: cardForm.value.complaint || 'General Service',
    partsUsed: cardForm.value.partsUsed,
    labourCost: labourNum,
    totalCost: totalNum,
    cost: `₹${totalNum.toLocaleString('en-IN')}`,
    expectedDowntime: cardForm.value.expectedDowntime,
    downtime: cardForm.value.expectedDowntime,
  };

  try {
    if (isEditing.value && editingCard.value) {
      const editId = editingCard.value.id || editingCard.value.jobCardId || editingCard.value.jobCard;
      await api.patch(`/api/v1/job-cards/${editId}`, payload);
      const idx = jobCards.value.findIndex(
        (c) => (c.id || c.jobCardId || c.jobCard) === editId,
      );
      if (idx !== -1) {
        jobCards.value[idx] = { ...jobCards.value[idx], ...payload };
      }
      notify.notifySuccess(`Job Card ${payload.jobCardId} updated successfully.`);
    } else {
      await api.post('/api/v1/job-cards', payload);
      jobCards.value.unshift(payload);
      notify.notifySuccess(`Job Card ${payload.jobCardId} saved to database.`);
    }
    persistLocal();
  } catch (err: any) {
    console.warn('API error, falling back to local:', err);
    if (isEditing.value && editingCard.value) {
      const editId = editingCard.value.id || editingCard.value.jobCardId || editingCard.value.jobCard;
      const idx = jobCards.value.findIndex(
        (c) => (c.id || c.jobCardId || c.jobCard) === editId,
      );
      if (idx !== -1) {
        jobCards.value[idx] = { ...jobCards.value[idx], ...payload };
      }
      notify.notifySuccess(`Job Card ${payload.jobCardId} updated locally.`);
    } else {
      jobCards.value.unshift(payload);
      notify.notifySuccess(`Job Card ${payload.jobCardId} created locally.`);
    }
    persistLocal();
  }

  showModal.value = false;
}

function confirmDeleteCard(card: JobCard) {
  deletingCard.value = card;
  showDeleteDialog.value = true;
}

async function executeDeleteCard() {
  if (!deletingCard.value) return;
  const targetId = deletingCard.value.id || deletingCard.value.jobCardId || deletingCard.value.jobCard;

  try {
    await api.delete(`/api/v1/job-cards/${targetId}`);
  } catch (err) {
    console.warn('Could not delete on API, deleting locally:', err);
  }

  jobCards.value = jobCards.value.filter(
    (c) => (c.id || c.jobCardId || c.jobCard) !== targetId,
  );
  persistLocal();
  notify.notifySuccess(`Job Card ${targetId} deleted.`);
  showDeleteDialog.value = false;
}

async function onRefresh() {
  await loadJobCards();
  notify.notifySuccess('Job Cards Refreshed from database.');
}

function exportMaintenanceCsv() {
  exportToCsv(
    'workshop_job_cards',
    [
      { label: 'Job Card', field: 'jobCardId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Complaint', field: 'complaint' },
      { label: 'Work Type', field: 'workType' },
      { label: 'Service Centre', field: 'serviceCentre' },
      { label: 'Total Cost', field: 'totalCost' },
      { label: 'Downtime', field: 'expectedDowntime' },
      { label: 'Date', field: 'date' },
      { label: 'Status', field: 'status' },
    ],
    filteredJobCards.value,
  );
  notify.notifySuccess(`${filteredJobCards.value.length} job cards exported to CSV.`);
}

function exportMaintenancePdf() {
  exportToPdf({
    title: 'Workshop Maintenance & Job Cards Register',
    subtitle: `Total Active Records: ${filteredJobCards.value.length}`,
    columns: [
      { label: 'Job Card', field: 'jobCardId' },
      { label: 'Vehicle', field: 'vehicle' },
      { label: 'Work Type', field: 'workType' },
      { label: 'Service Centre', field: 'serviceCentre' },
      { label: 'Cost', field: 'totalCost', align: 'right' },
      { label: 'Status', field: 'status', align: 'center' },
    ],
    rows: filteredJobCards.value,
  });
  notify.notifySuccess('PDF generated for Maintenance Job Cards');
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  searchInputRef,
  onNewRecord: openAddDialog,
  isModalOpen: computed(() => showModal.value || showDetailsModal.value || showDeleteDialog.value),
  onSave: saveJobCard,
  onEscape: () => {
    if (showModal.value) showModal.value = false;
    else if (showDetailsModal.value) showDetailsModal.value = false;
    else if (showDeleteDialog.value) showDeleteDialog.value = false;
  },
  filters: [
    () => selectKpiTab('all'),
    () => selectKpiTab('active'),
    () => selectKpiTab('downtime'),
    () => selectKpiTab('completed'),
  ],
});
</script>

<style scoped>
/* Page Layout */
.billing-page-container {
  background-color: #f8fafc;
}

.billing-title-wrap {
  display: inline-block;
}

.billing-underline {
  height: 3px;
  background-color: #0284c7;
  border-radius: 2px;
  margin-top: 4px;
}

/* Action Buttons */
.btn-primary-cyan {
  background-color: #0284c7;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary-cyan:hover {
  background-color: #0369a1;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

.btn-secondary-action {
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.btn-secondary-action:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

/* KPI Box Cards */
.kpi-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.kpi-box:hover {
  border-color: #94a3b8;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}

.kpi-box--active {
  border-color: #0284c7 !important;
  background-color: #f0f9ff !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2) !important;
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
  color: #0f172a;
}

.kpi-subtext {
  font-size: 12px;
  color: #64748b;
}

/* Search input */
.search-input {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #0284c7;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Table styling */
.table-head-row th {
  background-color: #f8fafc;
  color: #475569;
}

/* Table Action Buttons */
.btn-table-action {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-table-action:hover {
  background: #bae6fd;
}

.btn-table-icon {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  height: 28px;
  width: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  outline: none;
  padding: 0;
}

.btn-table-icon:hover {
  background: #e2e8f0;
  color: #334155;
}

.btn-table-icon--danger {
  color: #94a3b8;
}

.btn-table-icon--danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Badges */
.badge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-paid {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.badge-pending {
  background-color: #fefce8;
  color: #ca8a04;
  border: 1px solid #fde047;
}

.badge-overdue {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.badge-rcm {
  background-color: #ecfeff;
  color: #0e7490;
  border: 1px solid #a5f3fc;
}

.badge-forward {
  background-color: #ede9fe;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}

.badge-exempt {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.badge-toll {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-bhatta {
  background-color: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.badge-repair {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* 2D Excel Grid Navigation Styles */
.billing-table-row.excel-row-active {
  background-color: #f0f9ff !important;
}

.billing-table-row.excel-row-active td:first-child {
  position: relative;
}

.billing-table-row.excel-row-active td:first-child::before {
  content: '▶';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: #0284c7;
  font-weight: bold;
}

.excel-cell-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: -2px !important;
  background-color: #e0f2fe !important;
  color: #0369a1 !important;
  position: relative !important;
  z-index: 10 !important;
  box-shadow: 0 0 0 1px #0284c7, 0 1px 4px rgba(2, 132, 199, 0.25) !important;
}

/* Individual active button highlight inside action cell */
.btn-table-action.excel-btn-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: 1px !important;
  background-color: #bae6fd !important;
  color: #0369a1 !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(2, 132, 199, 0.3) !important;
  transform: scale(1.05);
  z-index: 20;
}

.btn-table-icon.excel-btn-active {
  outline: 2px solid #0284c7 !important;
  outline-offset: 1px !important;
  background-color: #e0f2fe !important;
  color: #0284c7 !important;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 2px 6px rgba(2, 132, 199, 0.3) !important;
  transform: scale(1.08);
  z-index: 20;
}

.btn-table-icon--danger.excel-btn-active {
  outline: 2px solid #ef4444 !important;
  outline-offset: 1px !important;
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4), 0 2px 6px rgba(239, 68, 68, 0.3) !important;
  transform: scale(1.08);
  z-index: 20;
}

/* Prevent outer cell border from obscuring individual active button */
.action-cell:has(.excel-btn-active),
.billing-table-row td.action-cell.excel-cell-active {
  outline: none !important;
  box-shadow: none !important;
}

.excel-th-active {
  background-color: #e2e8f0 !important;
  color: #0284c7 !important;
  border-bottom: 2px solid #0284c7 !important;
}

.desk-kbd {
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 10px;
  color: #475569;
  font-family: monospace;
}
</style>
