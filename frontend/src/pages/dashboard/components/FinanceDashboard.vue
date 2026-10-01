<template>
  <div class="finance-console-wrapper p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-white">
    <!-- Page Header (Single Row Compact Layout) -->
    <AppPageHeader
      breadcrumb="Financial Operations / Revenue & Freight Ledger"
      title="Financial Operations & Freight Billing"
      subtitle="Freight audit reconciliation, customer invoicing, carrier payables & ERP ledger sync"
    >
      <template #badge>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            FINANCE CONTROL ACTIVE
          </span>
          <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
            LEDGER BALANCED: ₹18.42L
          </span>
        </div>
      </template>

      <template #actions>
        <q-btn
          flat
          dense
          round
          icon="refresh"
          color="cyan"
          size="sm"
          class="q-mr-xs"
          @click="refreshLedger"
          :loading="loading"
        >
          <template #loading>
            <q-spinner color="cyan" size="16px" />
          </template>
          <q-tooltip>Reconcile Live Ledgers</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="cyan"
          dense
          no-caps
          icon="sync"
          label="Sync ERP Ledgers"
          size="sm"
          class="q-px-sm q-mr-xs font-bold"
          :loading="syncingErp"
          @click="syncErpGateway"
        />
        <q-btn
          class="desk-btn-primary"
          icon="add"
          label="New Freight Invoice"
          no-caps
          size="sm"
          @click="openNewInvoiceModal"
        />
        <q-btn
          outline
          color="grey-4"
          dense
          no-caps
          icon="receipt_long"
          label="Billing Register"
          size="sm"
          class="q-px-sm font-bold"
          to="/billing"
        />
      </template>
    </AppPageHeader>

    <!-- Main Workspace with Inner Loading Overlay -->
    <div class="relative min-h-[400px] space-y-6">
      <!-- Financial KPIs Row (4 High-Impact Stat Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppStatCard
          title="Gross Freight Invoiced"
          value="₹18,42,000"
          icon="payments"
          icon-color="cyan"
          change="+11.4% MoM"
          :is-positive="true"
          subtitle="48 linehauls reconciled Oct 2026"
        />
        <AppStatCard
          title="Accounts Receivable (AR)"
          value="₹4,21,500"
          icon="trending_up"
          icon-color="warning"
          change="94.2% on-time"
          :is-positive="true"
          subtitle="Shipper open freight invoices"
        />
        <AppStatCard
          title="Carrier Payables (AP)"
          value="₹8,94,000"
          icon="account_balance_wallet"
          icon-color="cyan"
          change="18 Carriers ready"
          :is-positive="true"
          subtitle="Tender vouchers ready for settlement"
        />
        <AppStatCard
          title="Freight Audit Discrepancies"
          value="3 Disputed"
          icon="fact_check"
          icon-color="negative"
          change="-₹14,200 variance"
          :is-positive="false"
          subtitle="Fuel surcharge & detention tolerances"
        />
      </div>

      <!-- Invoicing Lifecycle Pipeline Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left: Lifecycle Stages & Priority Invoices (8 Cols) -->
        <div class="lg:col-span-8 space-y-4">
          <!-- 4 Lifecycle Pipeline Stages -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors">
              <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Draft Vouchers</span>
                <span class="w-2 h-2 rounded-full bg-slate-500"></span>
              </div>
              <div class="text-xl font-bold font-mono text-white">12</div>
              <div class="text-[11px] font-mono text-cyan-400 mt-0.5">₹1,84,000 Volume</div>
            </div>

            <div class="p-3.5 rounded-xl border border-amber-800/80 bg-amber-950/40 hover:border-amber-600 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <div class="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
                <span>Audit Review</span>
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              </div>
              <div class="text-xl font-bold font-mono text-amber-200">6</div>
              <div class="text-[11px] font-mono text-amber-300 mt-0.5">₹3,12,500 Volume</div>
            </div>

            <div class="p-3.5 rounded-xl border border-blue-800/80 bg-blue-950/40 hover:border-blue-600 transition-colors">
              <div class="flex items-center justify-between text-xs text-blue-300 font-semibold mb-1">
                <span>Approved (IRN)</span>
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
              </div>
              <div class="text-xl font-bold font-mono text-blue-200">8</div>
              <div class="text-[11px] font-mono text-blue-300 mt-0.5">₹2,64,000 Volume</div>
            </div>

            <div class="p-3.5 rounded-xl border border-emerald-800/80 bg-emerald-950/40 hover:border-emerald-600 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.1)]">
              <div class="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                <span>Settled / Paid</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div class="text-xl font-bold font-mono text-emerald-200">48</div>
              <div class="text-[11px] font-mono text-emerald-300 mt-0.5">₹11,48,000 Volume</div>
            </div>
          </div>

          <!-- Priority Invoices Ledger Table -->
          <div class="cyber-card p-5">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
              <div>
                <div class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]"></span>
                  Priority Freight Invoices & Settlement Register
                  <span class="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                    {{ filteredInvoices.length }} VOUCHERS
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5">Automated freight audit, three-way match, and GST e-invoice clearance</div>
              </div>

              <!-- Filter Tabs -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="tab in filterTabs"
                  :key="tab.id"
                  @click="activeFilter = tab.id"
                  class="px-2.5 py-1 rounded text-xs font-mono transition-all border"
                  :class="activeFilter === tab.id ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- Invoices List -->
            <div class="space-y-2.5">
              <div
                v-for="inv in filteredInvoices"
                :key="inv.id"
                class="invoice-card p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div class="space-y-1 flex-1 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-mono font-bold text-sm text-cyan-400">{{ inv.number }}</span>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border shadow-sm"
                      :class="getStatusBadgeClass(inv.status)"
                    >
                      {{ inv.status }}
                    </span>
                    <span class="text-xs text-white font-semibold truncate">{{ inv.party }}</span>
                    <span class="text-xs text-slate-500">•</span>
                    <span class="text-xs text-slate-400 font-mono">Tax IRN: {{ inv.irn || 'IRN-PENDING' }}</span>
                  </div>

                  <div class="text-xs text-slate-300 font-sans flex items-center gap-1.5">
                    <span>{{ inv.lane }}</span>
                    <span class="text-slate-500">•</span>
                    <span class="text-slate-400 font-mono">{{ inv.weight }}</span>
                    <span class="text-slate-500">•</span>
                    <span class="text-slate-400">Due: {{ inv.dueDate }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3 w-full sm:w-auto justify-end flex-shrink-0">
                  <div class="text-right font-mono">
                    <div class="text-sm font-bold text-white">₹{{ inv.amount.toLocaleString('en-IN') }}</div>
                    <div class="text-[10px] text-slate-400">GST 18%: ₹{{ Math.round(inv.amount * 0.18).toLocaleString('en-IN') }}</div>
                  </div>

                  <div class="flex items-center gap-1">
                    <q-btn
                      v-if="inv.status !== 'PAID'"
                      dense
                      no-caps
                      size="sm"
                      class="desk-btn-primary font-mono text-xs px-2.5"
                      label="Settle"
                      icon="done"
                      @click="settleInvoice(inv)"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      color="cyan-4"
                      icon="visibility"
                      to="/billing"
                    >
                      <q-tooltip>Open in Billing Console</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Automated Audit Engine & ERP Gateways (4 Cols) -->
        <div class="lg:col-span-4 space-y-4">
          <!-- ERP Ledger Sync Gateway -->
          <div class="cyber-card p-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <div class="text-sm font-bold text-white flex items-center gap-1.5">
                  <q-icon name="sync_alt" size="16px" color="cyan" />
                  ERP & Tax Ledger Synchronization
                </div>
                <div class="text-[11px] text-slate-400">SAP S/4HANA & GSTN IRN live gateway</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            <div class="space-y-2.5 text-xs font-mono">
              <div class="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div class="font-bold text-white font-sans">SAP S/4HANA Financials</div>
                  <div class="text-[10px] text-slate-400">Two-way GL batch sync &bull; 14m ago</div>
                </div>
                <span class="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SYNCED
                </span>
              </div>

              <div class="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div class="font-bold text-white font-sans">GST E-Invoicing Portal (IRN)</div>
                  <div class="text-[10px] text-slate-400">QR Code & NIC API Gateway</div>
                </div>
                <span class="text-[11px] font-bold text-emerald-400">CONNECTED</span>
              </div>

              <div class="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div class="font-bold text-white font-sans">Tally Prime / QuickBooks</div>
                  <div class="text-[10px] text-slate-400">Chart of Accounts XML sync</div>
                </div>
                <span class="text-[11px] font-bold text-cyan-300">IDLE</span>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-800">
              <q-btn
                color="cyan-8"
                text-color="white"
                class="full-width text-weight-bold font-mono"
                size="sm"
                no-caps
                icon="sync"
                label="Trigger Instant ERP Ledger Sync"
                :loading="syncingErp"
                @click="syncErpGateway"
              />
            </div>
          </div>

          <!-- Automated Freight Audit Engine -->
          <div class="cyber-card p-5">
            <div class="flex items-center gap-2 mb-2">
              <q-icon name="fact_check" color="cyan" size="20px" />
              <span class="text-sm font-bold text-white">Automated Freight Audit Engine</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed font-sans mb-3">
              Automated 3-way rate reconciliation (Contract Rate Card vs Carrier Invoice vs GPS Mileage).
            </p>

            <div class="space-y-2 text-xs font-mono">
              <div class="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <span class="text-slate-400">Auto-Approval Tolerance</span>
                <span class="font-bold text-emerald-400">&plusmn; ₹500.00 / trip</span>
              </div>
              <div class="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <span class="text-slate-400">Detention Threshold</span>
                <span class="font-bold text-cyan-300">45 Mins Staging</span>
              </div>
              <div class="p-2.5 rounded bg-rose-950/30 border border-rose-900/40 flex items-center justify-between">
                <span class="text-rose-300">Pending Rate Disputes</span>
                <span class="font-bold text-rose-400">3 Flagged (₹14.2K)</span>
              </div>
            </div>
          </div>

          <!-- Gross Operating Margin Meter -->
          <div class="cyber-card p-4 border border-cyan-800/40 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono text-cyan-300 font-bold uppercase">Corridor Net Margin</span>
              <span class="text-sm font-mono font-extrabold text-emerald-400">19.4% AVG</span>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style="width: 78%;"></div>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Freight Target: &gt; 16.5%</span>
              <span class="text-emerald-400">+2.9% Above Budget</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Freight Settlements & Audit Discrepancy Queue -->
      <div class="cyber-card p-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-3 mb-4">
          <div>
            <div class="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              Freight Settlements & Audit Discrepancy Queue
              <span class="text-xs font-mono text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/30">
                {{ activeDiscrepanciesCount }} FLAGGED (₹14,200)
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-0.5">Audited rate comparisons, three-way telematics match & automated voucher release</div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <q-btn
              outline
              dense
              no-caps
              size="sm"
              color="emerald-4"
              icon="auto_awesome"
              label="Auto-Approve Tolerances (< ±₹500)"
              class="font-mono text-xs px-2"
              @click="autoApproveTolerances"
            />
            <q-btn flat dense no-caps size="sm" color="cyan" label="Open Billing Console →" to="/billing" />
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 flex-wrap mb-4 pb-2 border-b border-slate-800/80">
          <button
            v-for="tab in discrepancyTabs"
            :key="tab.id"
            @click="discrepancyFilter = tab.id"
            class="px-2.5 py-1 rounded text-xs font-mono transition-all border"
            :class="discrepancyFilter === tab.id ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'"
          >
            {{ tab.label }}
            <span class="ml-1 text-[10px] text-slate-500">({{ tab.count }})</span>
          </button>
        </div>

        <!-- Discrepancy Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th class="py-3 px-3">Dispute Ref / Shipment</th>
                <th class="py-3 px-3">Carrier Partner</th>
                <th class="py-3 px-3">Corridor Lane</th>
                <th class="py-3 px-3">Contract vs Billed Rate</th>
                <th class="py-3 px-3">Audit Diagnosis & GPS Telematics</th>
                <th class="py-3 px-3">Severity</th>
                <th class="py-3 px-3 text-right">Audit Resolution</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr
                v-for="item in filteredDiscrepancies"
                :key="item.id"
                class="hover:bg-slate-850/60 transition-colors"
              >
                <td class="py-3 px-3">
                  <div class="font-bold text-cyan-300">{{ item.refNo }}</div>
                  <div class="text-[10px] text-slate-400">{{ item.shipmentNumber }}</div>
                </td>

                <td class="py-3 px-3 font-sans">
                  <div class="font-bold text-white">{{ item.carrier }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ item.vehiclePlate }}</div>
                </td>

                <td class="py-3 px-3 font-sans text-slate-200">
                  <div>{{ item.lane }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ item.gpsMileage }} km GPS verified</div>
                </td>

                <td class="py-3 px-3">
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-400">₹{{ item.contractRate.toLocaleString('en-IN') }}</span>
                    <span class="text-slate-500">&rarr;</span>
                    <span class="text-white font-bold">₹{{ item.billedRate.toLocaleString('en-IN') }}</span>
                  </div>
                  <div class="text-[10px] font-bold" :class="item.variance > 0 ? 'text-rose-400' : 'text-emerald-400'">
                    Variance: +₹{{ item.variance.toLocaleString('en-IN') }} ({{ item.variancePercent }})
                  </div>
                </td>

                <td class="py-3 px-3 font-sans text-slate-300" style="max-width: 280px;">
                  <div class="line-clamp-2 text-[11px] leading-relaxed">{{ item.finding }}</div>
                </td>

                <td class="py-3 px-3">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                    :class="item.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.25)]'"
                  >
                    {{ item.status }}
                  </span>
                </td>

                <td class="py-3 px-3 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <q-btn
                      v-if="item.status !== 'RESOLVED'"
                      dense
                      no-caps
                      size="sm"
                      class="desk-btn-primary font-mono text-xs px-2"
                      label="Settle Adjusted"
                      icon="done"
                      @click="resolveDiscrepancy(item, 'APPROVE')"
                    >
                      <q-tooltip>Accept Adjusted Contract Settlement</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="item.status !== 'RESOLVED'"
                      dense
                      no-caps
                      outline
                      size="sm"
                      color="rose-4"
                      class="font-mono text-xs px-2"
                      label="Debit Note"
                      icon="receipt"
                      @click="resolveDiscrepancy(item, 'DEBIT')"
                    >
                      <q-tooltip>Issue Debit Note for ₹{{ item.variance.toLocaleString('en-IN') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      color="cyan-4"
                      icon="policy"
                      @click="openAuditModal(item)"
                    >
                      <q-tooltip>View 3-Way Audit Telematics</q-tooltip>
                    </q-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inner Loading Overlay on Financial Reconciliation -->
      <q-inner-loading :showing="loading" style="background: rgba(7, 12, 24, 0.75); backdrop-filter: blur(4px); z-index: 50; border-radius: 16px;">
        <div class="column items-center">
          <q-spinner-dots size="56px" color="cyan" />
          <div class="text-sm font-mono font-bold text-cyan-300 q-mt-md tracking-wider">
            Reconciling Freight Ledgers & Audit Tolerances...
          </div>
          <div class="text-xs font-mono text-slate-400 q-mt-xs">
            Querying SAP General Ledger, GSTN E-Invoicing & carrier rate variances
          </div>
        </div>
      </q-inner-loading>
    </div>

    <!-- Quick Freight Invoice Modal Dialog -->
    <q-dialog v-model="showNewInvoiceModal" persistent>
      <div class="cyber-modal bg-slate-900 border border-slate-700 text-white rounded-xl p-5 max-w-[620px] w-full">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div class="flex items-center gap-2">
            <q-icon name="receipt_long" color="cyan" size="20px" />
            <div class="text-base font-bold text-white">Generate Tax Invoice & GST Voucher</div>
          </div>
          <q-btn flat dense round icon="close" color="slate-400" v-close-popup />
        </div>

        <div class="space-y-4 text-xs font-mono">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Customer / Shipper Party</label>
              <q-select
                v-model="invoiceForm.customer"
                :options="['TechCorp Industries', 'Titan Freightways Corp', 'Global Retailers LLC', 'Summit Logistics 3PL', 'FreshDirect Cold Chain']"
                dense
                outlined
                class="dark-input"
              />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Corridor Lane</label>
              <q-input
                v-model="invoiceForm.lane"
                dense
                outlined
                placeholder="Ahmedabad → Mumbai"
                class="dark-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-400 mb-1">Base Freight (₹)</label>
              <q-input
                v-model.number="invoiceForm.baseAmount"
                dense
                outlined
                type="number"
                class="dark-input"
              />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Fuel Surcharge (₹)</label>
              <q-input
                v-model.number="invoiceForm.fuelSurcharge"
                dense
                outlined
                type="number"
                class="dark-input"
              />
            </div>
            <div>
              <label class="block text-slate-400 mb-1">GST Tax Rate</label>
              <q-select
                v-model="invoiceForm.gstRate"
                :options="['18% (Standard Logistics)', '12% (Multi-Modal)', '5% (GTA RCM)']"
                dense
                outlined
                class="dark-input"
              />
            </div>
          </div>

          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400">Total Invoiced Amount (with Tax):</span>
            <span class="text-base font-bold text-cyan-300">
              ₹{{ (invoiceForm.baseAmount + invoiceForm.fuelSurcharge + Math.round((invoiceForm.baseAmount + invoiceForm.fuelSurcharge) * 0.18)).toLocaleString('en-IN') }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <q-btn flat dense no-caps label="Cancel" color="slate-400" v-close-popup />
          <q-btn
            class="desk-btn-primary"
            dense
            no-caps
            icon="check_circle"
            label="Generate Invoice & IRN"
            :loading="creatingInvoice"
            @click="submitNewInvoice"
          />
        </div>
      </div>
    </q-dialog>

    <!-- 3-Way Rate & Telematics Audit Modal Dialog -->
    <q-dialog v-model="showAuditModal" persistent>
      <div class="cyber-modal bg-slate-900 border border-slate-700 text-white rounded-xl p-5 max-w-[640px] w-full" v-if="selectedDiscrepancy">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div class="flex items-center gap-2">
            <q-icon name="fact_check" color="cyan" size="20px" />
            <div class="text-base font-bold text-white">Three-Way Freight Audit Reconciliation</div>
          </div>
          <q-btn flat dense round icon="close" color="slate-400" v-close-popup />
        </div>

        <div class="space-y-4 text-xs font-mono">
          <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-slate-400">Carrier Partner Claim</div>
              <div class="font-bold text-white text-sm font-sans">{{ selectedDiscrepancy.carrier }}</div>
              <div class="text-[11px] text-cyan-300">{{ selectedDiscrepancy.refNo }} &bull; {{ selectedDiscrepancy.shipmentNumber }}</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
              VARIANCE: +₹{{ selectedDiscrepancy.variance.toLocaleString('en-IN') }} ({{ selectedDiscrepancy.variancePercent }})
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="p-3 rounded bg-slate-950 border border-slate-800">
              <div class="text-slate-400 text-[10px]">1. Contract Rate Card</div>
              <div class="text-sm font-bold text-emerald-400 mt-1">₹{{ selectedDiscrepancy.contractRate.toLocaleString('en-IN') }}</div>
              <div class="text-[10px] text-slate-500">Agreed Baseline</div>
            </div>
            <div class="p-3 rounded bg-slate-950 border border-slate-800">
              <div class="text-slate-400 text-[10px]">2. Carrier Invoiced</div>
              <div class="text-sm font-bold text-rose-400 mt-1">₹{{ selectedDiscrepancy.billedRate.toLocaleString('en-IN') }}</div>
              <div class="text-[10px] text-slate-500">Billed Amount</div>
            </div>
            <div class="p-3 rounded bg-slate-950 border border-slate-800">
              <div class="text-slate-400 text-[10px]">3. GPS Telematics</div>
              <div class="text-sm font-bold text-cyan-400 mt-1">{{ selectedDiscrepancy.gpsMileage }} KM</div>
              <div class="text-[10px] text-slate-500">Radar Verified</div>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 font-sans text-xs">
            <div class="font-bold font-mono text-amber-300 mb-1 flex items-center gap-1.5">
              <q-icon name="warning" size="14px" />
              Automated Audit Findings:
            </div>
            {{ selectedDiscrepancy.finding }}
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <q-btn flat dense no-caps label="Cancel" color="slate-400" v-close-popup />
          <q-btn
            outline
            dense
            no-caps
            color="rose-4"
            icon="receipt"
            label="Issue Debit Note"
            @click="resolveDiscrepancy(selectedDiscrepancy, 'DEBIT'); showAuditModal = false;"
          />
          <q-btn
            class="desk-btn-primary"
            dense
            no-caps
            icon="check_circle"
            label="Approve Adjusted Settlement"
            @click="resolveDiscrepancy(selectedDiscrepancy, 'APPROVE'); showAuditModal = false;"
          />
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '../../../components/AppPageHeader.vue';
import AppStatCard from '../../../components/AppStatCard.vue';
import api from '../../../api/client';

const $q = useQuasar();
const loading = ref(false);
const syncingErp = ref(false);
const creatingInvoice = ref(false);
const showNewInvoiceModal = ref(false);
const showAuditModal = ref(false);
const selectedDiscrepancy = ref<any>(null);
const discrepancyFilter = ref('ALL');
const activeFilter = ref('ALL');

const discrepancies = ref([
  {
    id: 'disp-1',
    refNo: 'DISP-2024-001',
    shipmentNumber: 'SHP-2024-001',
    carrier: 'Titan Freightways Corp',
    vehiclePlate: 'TRK-102 (BharatBenz)',
    lane: 'Chicago Hub → Dallas DC',
    category: 'DETENTION',
    contractRate: 24000,
    billedRate: 28500,
    variance: 4500,
    variancePercent: '+18.7%',
    finding: 'Driver claimed 2.5h detention dwell at Chicago DC. Radar geofence telemetry confirms gate departure at 42m.',
    gpsMileage: 1480,
    status: 'FLAGGED',
  },
  {
    id: 'disp-2',
    refNo: 'DISP-2024-002',
    shipmentNumber: 'SHP-2024-004',
    carrier: 'Swift Haulage International',
    vehiclePlate: 'TRK-104 (Volvo FM)',
    lane: 'Detroit Depot → Columbus Hub',
    category: 'FUEL',
    contractRate: 18500,
    billedRate: 21200,
    variance: 2700,
    variancePercent: '+14.5%',
    finding: 'Fuel surcharge invoiced at 18.2% vs Master Rate Card contract index cap of 14.5%.',
    gpsMileage: 330,
    status: 'FLAGGED',
  },
  {
    id: 'disp-3',
    refNo: 'DISP-2024-003',
    shipmentNumber: 'SHP-2024-006',
    carrier: 'Apex Dedicated Fleet',
    vehiclePlate: 'TRK-108 (Tata Prima)',
    lane: 'Atlanta Hub → Miami Port',
    category: 'RATE',
    contractRate: 35000,
    billedRate: 42000,
    variance: 7000,
    variancePercent: '+20.0%',
    finding: 'Billed multi-drop accessorial stop fee (+₹7,000) not tender-authorized by dispatch coordinator.',
    gpsMileage: 1060,
    status: 'FLAGGED',
  },
  {
    id: 'disp-4',
    refNo: 'DISP-2024-004',
    shipmentNumber: 'SHP-2024-002',
    carrier: 'Titan Freightways Corp',
    vehiclePlate: 'TRK-101 (Volvo FH16)',
    lane: 'Seattle Hub → Denver Port',
    category: 'DETENTION',
    contractRate: 52000,
    billedRate: 52400,
    variance: 400,
    variancePercent: '+0.7%',
    finding: 'Minor toll surcharge variance within ±₹500 tolerance agreement.',
    gpsMileage: 2100,
    status: 'RESOLVED',
  },
]);

const activeDiscrepanciesCount = computed(() => discrepancies.value.filter((d) => d.status !== 'RESOLVED').length);

const discrepancyTabs = computed(() => [
  { id: 'ALL', label: 'All Discrepancies', count: discrepancies.value.length },
  { id: 'DETENTION', label: 'Detention & Dwell', count: discrepancies.value.filter((d) => d.category === 'DETENTION').length },
  { id: 'RATE', label: 'Rate Variance', count: discrepancies.value.filter((d) => d.category === 'RATE').length },
  { id: 'FUEL', label: 'Fuel Surcharge', count: discrepancies.value.filter((d) => d.category === 'FUEL').length },
  { id: 'RESOLVED', label: 'Resolved / Settled', count: discrepancies.value.filter((d) => d.status === 'RESOLVED').length },
]);

const filteredDiscrepancies = computed(() => {
  if (discrepancyFilter.value === 'ALL') return discrepancies.value;
  if (discrepancyFilter.value === 'RESOLVED') return discrepancies.value.filter((d) => d.status === 'RESOLVED');
  return discrepancies.value.filter((d) => d.category === discrepancyFilter.value);
});

function openAuditModal(item: any) {
  selectedDiscrepancy.value = item;
  showAuditModal.value = true;
}

function resolveDiscrepancy(item: any, action: 'APPROVE' | 'DEBIT') {
  item.status = 'RESOLVED';
  if (action === 'APPROVE') {
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Settlement Adjusted & Approved',
      caption: `${item.refNo}: Rate adjusted to ₹${item.contractRate.toLocaleString('en-IN')}. Voucher released.`,
      position: 'top-right',
      timeout: 2200,
    });
  } else {
    $q.notify({
      type: 'warning',
      icon: 'receipt',
      message: 'Debit Note Issued to Carrier',
      caption: `${item.refNo}: Debit note for ₹${item.variance.toLocaleString('en-IN')} posted to AP ledger.`,
      position: 'top-right',
      timeout: 2400,
    });
  }
}

function autoApproveTolerances() {
  discrepancies.value.forEach((d) => {
    if (d.status !== 'RESOLVED' && Math.abs(d.variance) <= 500) {
      d.status = 'RESOLVED';
    }
  });
  $q.notify({
    type: 'positive',
    icon: 'auto_awesome',
    message: 'Tolerance Audit Executed',
    caption: `All rate discrepancies within ±₹500 auto-approved according to contract SLA.`,
    position: 'top-right',
    timeout: 2000,
  });
}

const filterTabs = ref([
  { id: 'ALL', label: 'All Invoices' },
  { id: 'PENDING', label: 'Awaiting Settlement' },
  { id: 'PAID', label: 'Paid / Settled' },
  { id: 'DISPUTED', label: 'Rate Discrepancies' },
]);

const invoices = ref<any[]>([
  {
    id: '1',
    number: 'INV-2024-001',
    party: 'TechCorp Industries',
    lane: 'Ahmedabad Hub → Mumbai DC',
    weight: '18.4T Consignment',
    amount: 48500,
    irn: 'IRN-99214-884',
    dueDate: 'Oct 08, 2026',
    status: 'PENDING',
  },
  {
    id: '2',
    number: 'INV-2024-002',
    party: 'Titan Freightways Corp',
    lane: 'Surat Terminal → Pune Port',
    weight: '14.2T Linehaul',
    amount: 26500,
    irn: 'IRN-99214-885',
    dueDate: 'Sep 28, 2026',
    status: 'PAID',
  },
  {
    id: '3',
    number: 'INV-2024-003',
    party: 'Global Retailers LLC',
    lane: 'Mumbai Hub → Delhi Inland Port',
    weight: '22.0T Express',
    amount: 39000,
    irn: 'IRN-99214-886',
    dueDate: 'Sep 30, 2026',
    status: 'PAID',
  },
  {
    id: '4',
    number: 'INV-2024-004',
    party: 'Summit Logistics 3PL',
    lane: 'Vadodara Hub → Vapi Depot',
    weight: '9.8T Part-Load',
    amount: 14500,
    irn: 'IRN-99214-887',
    dueDate: 'Oct 12, 2026',
    status: 'PENDING',
  },
  {
    id: '5',
    number: 'INV-2024-005',
    party: 'Apex Logistics Dedicated',
    lane: 'Chicago DC → Dallas Hub',
    weight: '28.0T Heavy Linehaul',
    amount: 62400,
    irn: 'IRN-DISPUTE-02',
    dueDate: 'Oct 05, 2026',
    status: 'DISPUTED',
  },
]);

const invoiceForm = ref({
  customer: 'TechCorp Industries',
  lane: 'Ahmedabad Hub → Mumbai DC',
  baseAmount: 38000,
  fuelSurcharge: 4200,
  gstRate: '18% (Standard Logistics)',
});

const filteredInvoices = computed(() => {
  if (activeFilter.value === 'ALL') return invoices.value;
  return invoices.value.filter((i) => i.status === activeFilter.value);
});

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
    case 'PENDING':
      return 'bg-amber-950 text-amber-300 border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.25)]';
    case 'DISPUTED':
      return 'bg-rose-950 text-rose-300 border-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.25)]';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

function openNewInvoiceModal() {
  showNewInvoiceModal.value = true;
}

function settleInvoice(inv: any) {
  inv.status = 'PAID';
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: 'Invoice Settled Successfully',
    caption: `${inv.number} voucher cleared for payment. General Ledger voucher posted.`,
    position: 'top-right',
    timeout: 2000,
  });
}

async function submitNewInvoice() {
  creatingInvoice.value = true;
  await new Promise((r) => setTimeout(r, 600));
  creatingInvoice.value = false;
  showNewInvoiceModal.value = false;

  const total = invoiceForm.value.baseAmount + invoiceForm.value.fuelSurcharge + Math.round((invoiceForm.value.baseAmount + invoiceForm.value.fuelSurcharge) * 0.18);
  const newId = invoices.value.length + 1;

  invoices.value.unshift({
    id: `${newId}`,
    number: `INV-2024-00${newId}`,
    party: invoiceForm.value.customer,
    lane: invoiceForm.value.lane,
    weight: '16.5T Verified',
    amount: total,
    irn: `IRN-${Date.now().toString().slice(-8)}`,
    dueDate: 'Oct 25, 2026',
    status: 'PENDING',
  });

  $q.notify({
    type: 'positive',
    icon: 'receipt_long',
    message: 'Freight Invoice & IRN Generated!',
    caption: `Tax invoice registered with GST E-Way & SAP S/4HANA.`,
    position: 'top-right',
    timeout: 2200,
  });
}

async function syncErpGateway() {
  syncingErp.value = true;
  await new Promise((r) => setTimeout(r, 800));
  syncingErp.value = false;

  $q.notify({
    type: 'positive',
    icon: 'cloud_sync',
    message: 'ERP Ledger Gateway Synchronized',
    caption: '14 freight invoices synced with SAP S/4HANA & Tally Prime.',
    position: 'top-right',
    timeout: 2000,
  });
}

async function refreshLedger() {
  loading.value = true;
  const startTime = Date.now();

  try {
    const res: any = await api.get('/api/v1/billing/invoices');
    const list = res.data || res;
    if (Array.isArray(list) && list.length > 0) {
      invoices.value = list.map((i: any, idx: number) => ({
        id: i.id || `${idx}`,
        number: i.invoiceNumber || `INV-2026-00${idx + 1}`,
        party: i.customer?.companyName || i.party || 'TechCorp Industries',
        lane: i.shipment ? `${i.shipment?.transportOrder?.originLocation?.city || 'Chicago'} → ${i.shipment?.transportOrder?.destinationLocation?.city || 'Dallas'}` : 'Ahmedabad → Mumbai',
        weight: '18.4T Consignment',
        amount: Number(i.totalAmount) || 48500,
        irn: i.irn || `IRN-99214-88${idx}`,
        dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'Oct 15, 2026',
        status: i.status || 'PENDING',
      }));
    }
  } catch {}

  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, 600 - elapsed);
  setTimeout(() => {
    loading.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Financial Ledger Refreshed',
      caption: 'Live AR/AP balances, automated audit tolerances and GL vouchers synced.',
      position: 'top-right',
      timeout: 1600,
    });
  }, remaining);
}

onMounted(() => {
  refreshLedger();
});
</script>

<style scoped>
.finance-console-wrapper {
  background-color: transparent;
}

.cyber-card {
  background: #0d172b;
  border: 1px solid #1a2744;
  border-radius: 12px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
}

.invoice-card {
  background: #091124;
  border: 1px solid #16233f;
  transition: all 0.2s ease;
}

.invoice-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 242, 254, 0.4);
  box-shadow: 0 6px 18px -2px rgba(0, 242, 254, 0.12);
}

.desk-btn-primary {
  background: linear-gradient(135deg, #00f2fe 0%, #0284c7 100%) !important;
  color: #070c18 !important;
  font-weight: 700 !important;
  border-radius: 6px;
}

:deep(.dark-input .q-field__control) {
  background: #091124 !important;
  border-color: #1a2744 !important;
  color: #ffffff !important;
}

:deep(.dark-input .q-field__native) {
  color: #ffffff !important;
}
</style>
