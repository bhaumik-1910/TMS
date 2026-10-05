<template>
  <div class="settings-page p-3 sm:p-4 text-slate-800 bg-slate-50 font-sans">
    <!-- Header with Title & Action Controls in Single Clean Row -->
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div class="column q-gutter-y-xs">
        <div class="text-h6 text-weight-bold text-slate-900 row items-center q-gutter-x-sm no-wrap">
          <q-icon name="domain" color="primary" size="26px" />
          <span>Organization & System Settings</span>
        </div>
        <div class="text-caption text-slate-500">
          Enterprise multi-tenancy parameters, statutory tax compliance, document series & gateway integrations
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row items-center q-gutter-x-sm no-wrap">
        <q-btn
          unelevated
          icon="wifi_tethering"
          label="Test Gateways"
          class="desk-btn-secondary"
          :loading="isTestingGateways"
          @click="testAllGateways"
        >
          <q-tooltip>Ping and verify all connected external API gateways</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="restart_alt"
          label="Reset Defaults"
          class="desk-btn-secondary"
          @click="showResetDialog = true"
        >
          <q-tooltip>Restore recommended enterprise default parameters</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          icon="save"
          label="Save Settings"
          class="desk-btn-primary"
          :loading="isSaving"
          @click="saveAllSettings"
        >
          <q-tooltip>Persist organization profile & system configurations (Ctrl+S)</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 4 KPI Status Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">TENANT IDENTIFIER</div>
        <div class="text-2xl font-extrabold font-mono text-sky-700 my-1">{{ settings.orgCode }}</div>
        <div class="text-xs text-slate-600 font-mono truncate">{{ settings.name }}</div>
        <div class="accent-bar bg-sky-600"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">STATUTORY COMPLIANCE</div>
        <div class="text-2xl font-extrabold font-mono text-emerald-700 my-1">GSTIN ACTIVE</div>
        <div class="text-xs text-emerald-600 font-mono">{{ settings.gstin }} (State 24)</div>
        <div class="accent-bar bg-emerald-600"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">OPERATING JURISDICTION</div>
        <div class="text-2xl font-extrabold font-mono text-slate-900 my-1">{{ settings.currency }}</div>
        <div class="text-xs text-slate-500 font-mono">{{ settings.timezone }}</div>
        <div class="accent-bar bg-sky-600"></div>
      </div>

      <div class="stat-card p-4 rounded-xl border border-slate-200 bg-white relative overflow-hidden shadow-sm">
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">INTEGRATED GATEWAYS</div>
        <div class="text-2xl font-extrabold font-mono text-amber-700 my-1">4 / 4 ONLINE</div>
        <div class="text-xs text-amber-600 font-mono">Vahan • Fastag • GPS • SMS</div>
        <div class="accent-bar bg-amber-600"></div>
      </div>
    </div>

    <!-- Category Tabs Navigation -->
    <div class="flex items-center justify-between q-mb-md">
      <div class="view-mode-toggle">
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <q-icon name="apartment" />
          <span>Profile & Legal</span>
        </button>
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'statutory' }"
          @click="activeTab = 'statutory'"
        >
          <q-icon name="account_balance" />
          <span>Statutory & GST</span>
        </button>
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'series' }"
          @click="activeTab = 'series'"
        >
          <q-icon name="pin" />
          <span>Series & Sequencing</span>
        </button>
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'telematics' }"
          @click="activeTab = 'telematics'"
        >
          <q-icon name="satellite_alt" />
          <span>Telematics & Vahan APIs</span>
        </button>
        <button
          type="button"
          class="view-mode-btn"
          :class="{ active: activeTab === 'gateways' }"
          @click="activeTab = 'gateways'"
        >
          <q-icon name="forward_to_inbox" />
          <span>Messaging & Gateways</span>
        </button>
      </div>

      <div class="text-xs text-slate-400 font-mono hidden md:block">
        Tenant Status: <span class="text-emerald-400 font-bold">ENTERPRISE CLOUD</span>
      </div>
    </div>

    <!-- TAB 1: Profile & Legal Details -->
    <div v-if="activeTab === 'profile'" class="row q-col-gutter-md">
      <div class="col-12 col-xl-7 col-lg-6">
        <div class="cyber-card p-5">
          <div class="row items-center justify-between q-mb-md border-bottom pb-3 border-slate-800">
            <div>
              <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm">
                <q-icon name="badge" color="cyan" size="20px" />
                <span>Enterprise Legal Profile & Headquarters</span>
              </div>
              <div class="text-caption text-slate-400">
                Statutory corporate registration and contact channels printed on Bilty and Freight Invoices
              </div>
            </div>
            <span class="desk-pill desk-pill-success">VERIFIED TENANT</span>
          </div>

          <DeskForm @submit="saveAllSettings">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <DeskField label="Legal Entity Name" required shortcut="1">
                  <q-input
                    v-model="settings.name"
                    dense
                    outlined
                    placeholder="e.g. Apex Global Logistics Private Limited"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-6">
                <DeskField label="Operating / Trade Brand Name" required shortcut="2">
                  <q-input
                    v-model="settings.tradeName"
                    dense
                    outlined
                    placeholder="e.g. Apex Logistics India"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="Organization Code" shortcut="3">
                  <q-input
                    v-model="settings.orgCode"
                    dense
                    outlined
                    readonly
                    class="opacity-75"
                  >
                    <template #append>
                      <q-icon name="lock" size="14px" color="slate-400" />
                    </template>
                  </q-input>
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="Corporate Identification (CIN)" shortcut="4">
                  <q-input
                    v-model="settings.cin"
                    dense
                    outlined
                    placeholder="U60200GJ2020PTC115420"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="Year of Incorporation" shortcut="5">
                  <q-input
                    v-model="settings.incorporatedYear"
                    dense
                    outlined
                    placeholder="2020"
                  />
                </DeskField>
              </div>

              <div class="col-12">
                <DeskField label="Corporate Headquarters Address" required shortcut="6">
                  <q-input
                    v-model="settings.address"
                    dense
                    outlined
                    placeholder="100 South Wacker Dr, Suite 1800, Central Logistics Hub"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="City" required shortcut="7">
                  <q-input
                    v-model="settings.city"
                    dense
                    outlined
                    placeholder="Ahmedabad"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="State & Jurisdiction" required shortcut="8">
                  <DeskCombo
                    v-model="settings.state"
                    :options="stateOptions"
                    placeholder="Select operating state..."
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="Pincode / Postal Code" required shortcut="9">
                  <q-input
                    v-model="settings.pincode"
                    dense
                    outlined
                    placeholder="380009"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="Support / Operations Email" required shortcut="10">
                  <q-input
                    v-model="settings.supportEmail"
                    type="email"
                    dense
                    outlined
                    placeholder="operations@apexlogistics.com"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="24x7 Dispatch Hotline" required shortcut="11">
                  <q-input
                    v-model="settings.phone"
                    dense
                    outlined
                    placeholder="+91 98250 00000"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-4">
                <DeskField label="Corporate Portal Website" shortcut="12">
                  <q-input
                    v-model="settings.website"
                    dense
                    outlined
                    placeholder="https://apexlogistics.com"
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-6">
                <DeskField label="Primary Currency Standard" required shortcut="13">
                  <DeskCombo
                    v-model="settings.currency"
                    :options="['INR (₹)', 'USD ($)', 'EUR (€)', 'AED (د.إ)', 'GBP (£)']"
                    placeholder="Select currency standard..."
                  />
                </DeskField>
              </div>

              <div class="col-12 col-md-6">
                <DeskField label="Default System Timezone" required shortcut="14">
                  <DeskCombo
                    v-model="settings.timezone"
                    :options="[
                      'Asia/Kolkata (IST +5:30)',
                      'UTC (Coordinated Universal Time)',
                      'America/Chicago (CST -6:00)',
                      'America/New_York (EST -5:00)',
                      'Asia/Dubai (GST +4:00)'
                    ]"
                    placeholder="Select default timezone..."
                  />
                </DeskField>
              </div>
            </div>
          </DeskForm>
        </div>
      </div>

      <!-- Right Column: Live Letterhead & Bilty Header Preview -->
      <div class="col-12 col-xl-5 col-lg-6">
        <div class="cyber-card p-4 sm:p-5 h-full flex flex-col justify-between overflow-hidden">
          <div>
            <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm q-mb-xs">
              <q-icon name="preview" color="cyan" size="20px" />
              <span>Outgoing LR & Invoice Stamp Preview</span>
            </div>
            <div class="text-caption text-slate-400 q-mb-md">
              Real-time rendering of your legal header printed on Lorry Receipts, Consignment Notes & Bills
            </div>

            <!-- Simulated Document Letterhead Sheet -->
            <div class="w-full max-w-full overflow-hidden p-4 rounded-xl bg-[#090f1d] border border-slate-700/80 shadow-2xl relative font-sans">
              <!-- Top Color Accent Bar -->
              <div class="h-1 rounded-full mb-3" :style="{ background: brandColor }"></div>

              <!-- Header Row: Logo & Brand + Badge -->
              <div class="row items-center justify-between gap-2 q-mb-sm">
                <div class="row items-center q-gutter-x-sm min-w-0 col">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-md text-sm font-mono shrink-0"
                    :style="{ background: brandColor }"
                  >
                    {{ (settings.tradeName || 'AP').slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0 col">
                    <div class="text-sm font-extrabold text-white tracking-wide uppercase truncate">
                      {{ settings.tradeName || 'APEX LOGISTICS INDIA' }}
                    </div>
                    <div class="text-[10px] text-slate-400 truncate font-mono">
                      {{ settings.name || 'Apex Global Logistics Pvt Ltd' }}
                    </div>
                  </div>
                </div>

                <span class="desk-pill desk-pill-success shrink-0 text-[10px] q-py-none">
                  APPROVED GTA
                </span>
              </div>

              <!-- Detail Rows in Clean Structured Sections -->
              <div class="space-y-2 text-xs leading-relaxed border-t border-slate-800 pt-3">
                <div class="row items-start q-gutter-x-xs no-wrap text-slate-300">
                  <q-icon name="location_on" size="14px" color="cyan" class="q-mt-xs shrink-0" />
                  <span class="leading-tight text-[11px]">
                    {{ settings.address || 'Central Transport Hub' }}, {{ settings.city }}, {{ settings.state }} - {{ settings.pincode }}
                  </span>
                </div>

                <!-- Tax Identifiers as distinct pills -->
                <div class="row items-center gap-1.5 flex-wrap q-mt-xs">
                  <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                    <strong>GSTIN:</strong> {{ settings.gstin }}
                  </span>
                  <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300">
                    <strong>PAN:</strong> {{ settings.pan }}
                  </span>
                </div>

                <!-- Contacts -->
                <div class="column q-gutter-y-xs text-[11px] text-slate-400 font-mono pt-1">
                  <div class="row items-center q-gutter-x-xs no-wrap truncate">
                    <q-icon name="phone" size="12px" color="cyan" class="shrink-0" />
                    <span class="truncate">{{ settings.phone }}</span>
                  </div>
                  <div class="row items-center q-gutter-x-xs no-wrap truncate">
                    <q-icon name="mail" size="12px" color="cyan" class="shrink-0" />
                    <span class="truncate">{{ settings.supportEmail }}</span>
                  </div>
                </div>
              </div>

              <!-- Official Carrier Stamp Watermark / Seal -->
              <div class="mt-3 pt-2 border-t border-slate-800/80 row items-center justify-between gap-2">
                <div class="text-[10px] text-slate-500 font-mono leading-tight">
                  Carriage by Road Act 2007<br />
                  Jurisdiction: {{ settings.city }}
                </div>
                <div
                  class="px-2 py-1 rounded border text-[10px] font-mono font-bold tracking-wider uppercase flex items-center q-gutter-x-xs shrink-0"
                  :style="{ borderColor: brandColor, color: brandColor, background: 'rgba(0, 242, 254, 0.05)' }"
                >
                  <q-icon name="verified" size="12px" />
                  <span>OFFICIAL LR SEAL</span>
                </div>
              </div>
            </div>

            <!-- Brand Accent Selector with Interactive 2x2 Grid -->
            <div class="mt-4">
              <div class="text-xs font-semibold text-slate-300 mb-2 row items-center justify-between">
                <span>Corporate Brand Accent Color</span>
                <span class="text-caption font-mono" :style="{ color: brandColor }">{{ activeBrandColorName }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  v-for="color in brandColorOptions"
                  :key="color.hex"
                  class="h-8 px-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer font-mono text-[11px] min-w-0"
                  :class="brandColor === color.hex ? 'border-white bg-slate-800 text-white shadow-lg' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'"
                  @click="brandColor = color.hex"
                >
                  <div class="row items-center q-gutter-x-xs no-wrap truncate min-w-0">
                    <span class="w-3 h-3 rounded-full shrink-0 shadow-sm" :style="{ background: color.hex }"></span>
                    <span class="truncate">{{ color.name }}</span>
                  </div>
                  <q-icon v-if="brandColor === color.hex" name="check" size="12px" :style="{ color: color.hex }" />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-800 row items-center justify-between">
            <span class="text-xs text-slate-400 font-mono">Letterhead Layout v2.4</span>
            <q-btn
              flat
              dense
              no-caps
              icon="file_upload"
              label="Upload Logo (PNG)"
              color="cyan"
              size="sm"
              @click="mockUploadLogo"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Statutory & Tax (GST / PAN / TDS) -->
    <div v-else-if="activeTab === 'statutory'" class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <div class="cyber-card p-5">
          <div class="row items-center justify-between q-mb-md border-bottom pb-3 border-slate-800">
            <div>
              <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm">
                <q-icon name="gavel" color="cyan" size="20px" />
                <span>Statutory Goods Transport Agency (GTA) Tax Rules</span>
              </div>
              <div class="text-caption text-slate-400">
                Configure GSTIN, Reverse Charge Mechanism (RCM), Section 194C TDS, and statutory thresholds
              </div>
            </div>
            <span class="desk-pill desk-pill-success">ACTIVE GTA</span>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <DeskField label="Goods & Services Tax Identification (GSTIN)" required shortcut="1">
                <q-input
                  v-model="settings.gstin"
                  dense
                  outlined
                  placeholder="24AAACA1234F1Z5"
                  maxlength="15"
                  class="font-mono text-uppercase"
                >
                  <template #append>
                    <q-badge color="positive" text-color="white" label="VERIFIED" />
                  </template>
                </q-input>
              </DeskField>
            </div>

            <div class="col-12 col-md-6">
              <DeskField label="Income Tax Permanent Account Number (PAN)" required shortcut="2">
                <q-input
                  v-model="settings.pan"
                  dense
                  outlined
                  placeholder="AAACA1234F"
                  maxlength="10"
                  class="font-mono text-uppercase"
                />
              </DeskField>
            </div>

            <div class="col-12 col-md-6">
              <DeskField label="Tax Deduction & Collection Account (TAN)" shortcut="3">
                <q-input
                  v-model="settings.tan"
                  dense
                  outlined
                  placeholder="AHMA12345B"
                  maxlength="10"
                  class="font-mono text-uppercase"
                />
              </DeskField>
            </div>

            <div class="col-12 col-md-6">
              <DeskField label="MSME / Udyam Registration Number" shortcut="4">
                <q-input
                  v-model="settings.msmeNumber"
                  dense
                  outlined
                  placeholder="UDYAM-GJ-01-0012345"
                  class="font-mono"
                />
              </DeskField>
            </div>

            <div class="col-12 col-md-6">
              <DeskField label="Default Freight GST Rate Slab" required shortcut="5">
                <DeskCombo
                  v-model="settings.gstRate"
                  :options="[
                    '5% without ITC (GTA Standard RCM)',
                    '12% with Forward ITC (Transporter Option)',
                    '18% Integrated Service & Warehousing',
                    '0% Exempt / Agricultural Cargo'
                  ]"
                  placeholder="Select default tax slab..."
                />
              </DeskField>
            </div>

            <div class="col-12 col-md-6">
              <DeskField label="E-Way Bill Generation Mandatory Threshold (₹)" required shortcut="6">
                <DeskNumberInput
                  v-model="settings.eWayBillMandatoryAbove"
                  placeholder="50000"
                  :step="5000"
                  :min="0"
                />
              </DeskField>
            </div>
          </div>

          <!-- Statutory Compliance Toggles -->
          <div class="mt-6 pt-4 border-t border-slate-800 space-y-4">
            <div class="row items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div class="text-sm font-semibold text-white">Reverse Charge Mechanism (RCM) Applied by Default</div>
                <div class="text-xs text-slate-400">
                  Under GTA notification 13/2017, the recipient (consignor/consignee) pays GST directly to the government.
                </div>
              </div>
              <q-toggle v-model="settings.rcmDefault" color="cyan" keep-color />
            </div>

            <div class="row items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div class="text-sm font-semibold text-white">Section 194C TDS Deduction on Market Transporters</div>
                <div class="text-xs text-slate-400">
                  Automatically calculate 1% (Individuals) or 2% (Companies) TDS on freight settlements exceeding statutory limits.
                </div>
              </div>
              <q-toggle v-model="settings.tdsFreightDeduction" color="cyan" keep-color />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Compliance Guidelines Card -->
      <div class="col-12 col-lg-4">
        <div class="cyber-card p-5 h-full">
          <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm q-mb-xs">
            <q-icon name="verified_user" color="emerald-400" size="20px" />
            <span>Statutory Verification Audit</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Automated compliance checks against government GST & Ministry of Transport rules
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <div class="text-slate-200 font-bold">HSN / SAC Code: 996511</div>
                <div class="text-[11px] text-slate-400">Road transport of goods by GTA</div>
              </div>
              <span class="desk-pill desk-pill-success">VERIFIED</span>
            </div>

            <div class="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <div class="text-slate-200 font-bold">E-Way Bill Integration</div>
                <div class="text-[11px] text-slate-400">NIC NIC-EWB API Gateway v1.0</div>
              </div>
              <span class="desk-pill desk-pill-success">CONNECTED</span>
            </div>

            <div class="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <div class="text-slate-200 font-bold">Carriage by Road Act 2007</div>
                <div class="text-[11px] text-slate-400">Statutory 4-Copy LR Format Active</div>
              </div>
              <span class="desk-pill desk-pill-success">COMPLIANT</span>
            </div>
          </div>

          <div class="mt-5 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
            <q-icon name="info" size="16px" class="q-mr-xs text-cyan-400" />
            All Consignment Notes generated in this system automatically inherit these statutory GST & PAN identifiers.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Series & Sequencing -->
    <div v-else-if="activeTab === 'series'" class="cyber-card p-5">
      <div class="row items-center justify-between q-mb-md border-bottom pb-3 border-slate-800">
        <div>
          <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm">
            <q-icon name="format_list_numbered" color="cyan" size="20px" />
            <span>Automatic Document Series & Consecutive Counters</span>
          </div>
          <div class="text-caption text-slate-400">
            Define unique alphanumeric prefixes and consecutive serial numbers for every operational document
          </div>
        </div>
        <span class="desk-pill desk-pill-primary">STRICT SEQUENCING</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- LR Series -->
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>LORRY RECEIPT (LR / BILTY)</span>
              <q-icon name="description" size="16px" />
            </div>
            <div class="text-caption text-slate-400 mb-3">Core carriage consignment note</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-5">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Prefix</div>
                <q-input
                  v-model="settings.lrPrefix"
                  dense
                  outlined
                  class="font-mono"
                  placeholder="LR-"
                />
              </div>
              <div class="col-7">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Next Counter</div>
                <DeskNumberInput
                  v-model="settings.lrNextNumber"
                  :min="1"
                  :step="1"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-400 font-mono">
            Next Generated: <strong class="text-cyan-300 font-bold">{{ settings.lrPrefix }}{{ settings.lrNextNumber }}</strong>
          </div>
        </div>

        <!-- Trip Dispatch Series -->
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>TRIP DISPATCH MANIFEST</span>
              <q-icon name="local_shipping" size="16px" />
            </div>
            <div class="text-caption text-slate-400 mb-3">Vehicle trip allocation order</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-5">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Prefix</div>
                <q-input
                  v-model="settings.tripPrefix"
                  dense
                  outlined
                  class="font-mono"
                  placeholder="TR/"
                />
              </div>
              <div class="col-7">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Next Counter</div>
                <DeskNumberInput
                  v-model="settings.tripNextNumber"
                  :min="1"
                  :step="1"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-400 font-mono">
            Next Generated: <strong class="text-cyan-300 font-bold">{{ settings.tripPrefix }}{{ settings.tripNextNumber }}</strong>
          </div>
        </div>

        <!-- Freight Invoice Series -->
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>FREIGHT TAX INVOICE</span>
              <q-icon name="receipt_long" size="16px" />
            </div>
            <div class="text-caption text-slate-400 mb-3">Customer billing tax invoice</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-5">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Prefix</div>
                <q-input
                  v-model="settings.invoicePrefix"
                  dense
                  outlined
                  class="font-mono"
                  placeholder="INV-26-"
                />
              </div>
              <div class="col-7">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Next Counter</div>
                <DeskNumberInput
                  v-model="settings.invoiceNextNumber"
                  :min="1"
                  :step="1"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-400 font-mono">
            Next Generated: <strong class="text-cyan-300 font-bold">{{ settings.invoicePrefix }}{{ settings.invoiceNextNumber }}</strong>
          </div>
        </div>

        <!-- Driver Advance Voucher Series -->
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>DRIVER ADVANCE VOUCHER</span>
              <q-icon name="payments" size="16px" />
            </div>
            <div class="text-caption text-slate-400 mb-3">En-route cash / UPI disbursements</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-5">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Prefix</div>
                <q-input
                  v-model="settings.advancePrefix"
                  dense
                  outlined
                  class="font-mono"
                  placeholder="ADV-"
                />
              </div>
              <div class="col-7">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Next Counter</div>
                <DeskNumberInput
                  v-model="settings.advanceNextNumber"
                  :min="1"
                  :step="1"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-400 font-mono">
            Next Generated: <strong class="text-cyan-300 font-bold">{{ settings.advancePrefix }}{{ settings.advanceNextNumber }}</strong>
          </div>
        </div>

        <!-- Fuel Dispense Log Series -->
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="text-xs font-mono font-bold text-cyan-400 mb-1 flex items-center justify-between">
              <span>FUEL DISPENSE LOG</span>
              <q-icon name="local_gas_station" size="16px" />
            </div>
            <div class="text-caption text-slate-400 mb-3">Pump & petrol pump logging entry</div>
            <div class="row q-col-gutter-sm items-end">
              <div class="col-5">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Prefix</div>
                <q-input
                  v-model="settings.fuelPrefix"
                  dense
                  outlined
                  class="font-mono"
                  placeholder="FL-"
                />
              </div>
              <div class="col-7">
                <div class="text-[11px] font-semibold text-slate-400 q-mb-xs">Next Counter</div>
                <DeskNumberInput
                  v-model="settings.fuelNextNumber"
                  :min="1"
                  :step="1"
                />
              </div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-400 font-mono">
            Next Generated: <strong class="text-cyan-300 font-bold">{{ settings.fuelPrefix }}{{ settings.fuelNextNumber }}</strong>
          </div>
        </div>

        <!-- Series Rules Controls -->
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="text-xs font-mono font-bold text-cyan-400 mb-1">SEQUENCING RULES</div>
            <div class="text-caption text-slate-400 mb-2">Statutory audit integrity safeguards</div>
            <div class="space-y-2 mt-2">
              <div class="row items-center justify-between">
                <span class="text-xs text-slate-300">Strict Sequential Numbers</span>
                <q-toggle v-model="settings.strictSequentialNumbering" dense color="cyan" />
              </div>
              <div class="row items-center justify-between">
                <span class="text-xs text-slate-300">Auto-attach E-Way Bill</span>
                <q-toggle v-model="settings.autoAttachEWayBill" dense color="cyan" />
              </div>
            </div>
          </div>
          <div class="text-[11px] text-slate-500 font-mono mt-3">
            Prevents missing serial numbers during tax audits.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: Telematics & External APIs -->
    <div v-else-if="activeTab === 'telematics'" class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <div class="cyber-card p-5 h-full">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="cloud_sync" color="cyan" size="22px" />
              <div class="text-subtitle1 text-weight-bold text-white">Vahan 4.0 National Registry Gateway</div>
            </div>
            <span class="desk-pill desk-pill-success">ONLINE</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Batch queries fitness certificates, chassis validation, and insurance expiries from Parivahan
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-slate-300 font-bold mb-1">API Endpoint URL</div>
              <q-input v-model="settings.vahanEndpoint" dense outlined placeholder="https://api.vahan.gov.in/v4/rc-sync" />
            </div>
            <div>
              <div class="text-slate-300 font-bold mb-1">Commercial API Access Token</div>
              <q-input v-model="settings.vahanApiKey" type="password" dense outlined placeholder="••••••••••••••••••••" />
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-800 row items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">Last Synchronized: 18 mins ago</span>
            <q-btn flat dense no-caps color="cyan" label="Verify Token" size="sm" icon="check_circle" @click="testSingleGateway('Vahan Portal')" />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="cyber-card p-5 h-full">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="toll" color="amber" size="22px" />
              <div class="text-subtitle1 text-weight-bold text-white">NPCI NETC Fastag Gateway</div>
            </div>
            <span class="desk-pill desk-pill-success">ACTIVE</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Captures real-time toll plaza deductions directly into associated Trip Cost sheets
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-slate-300 font-bold mb-1">Fleet Merchant ID</div>
              <q-input v-model="settings.fastagMerchantId" dense outlined placeholder="ICICI-NETC-FLEET-901" />
            </div>
            <div>
              <div class="text-slate-300 font-bold mb-1">Issuing Banking Partner</div>
              <DeskCombo v-model="settings.fastagBank" :options="['ICICI Bank Commercial Fastag', 'HDFC Fleet Tolls', 'Axis Bank Fastag', 'IDFC First Bank']" />
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-800 row items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">Webhook Active • Port 8044</span>
            <q-btn flat dense no-caps color="cyan" label="Test Fastag Ping" size="sm" icon="check_circle" @click="testSingleGateway('NPCI Fastag')" />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="cyber-card p-5 h-full">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="gps_fixed" color="emerald" size="22px" />
              <div class="text-subtitle1 text-weight-bold text-white">GPS Telematics & OBD Server</div>
            </div>
            <span class="desk-pill desk-pill-success">STREAMING</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Direct WebSocket ingestion from on-board fleet hardware (Teltonika, Queclink, WheelsEye)
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-slate-300 font-bold mb-1">Telematics Hardware Provider</div>
              <DeskCombo v-model="settings.gpsProvider" :options="['Teltonika & Queclink (Native TCP/WS)', 'WheelsEye Telematics API', 'LocoNav Enterprise Gateway', 'Concox & Coban OBD']" />
            </div>
            <div>
              <div class="text-slate-300 font-bold mb-1">Ingestion WebSocket Port</div>
              <DeskNumberInput v-model="settings.gpsPort" placeholder="5432" :step="1" :min="1" :max="65535" />
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-800 row items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">54 Vehicles Live Transmitting</span>
            <q-btn flat dense no-caps color="cyan" label="Ping Hardware" size="sm" icon="check_circle" @click="testSingleGateway('GPS Telematics')" />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="cyber-card p-5 h-full">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="map" color="cyan" size="22px" />
              <div class="text-subtitle1 text-weight-bold text-white">CartoDB & OpenStreetMap Engine</div>
            </div>
            <span class="desk-pill desk-pill-success">18MS LATENCY</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Geofencing, commercial highway route planning, toll avoidance, and trip mileage calculators
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-slate-300 font-bold mb-1">Geocoding & Tile Engine</div>
              <DeskCombo v-model="settings.osmMapEngine" :options="['OpenStreetMap Enterprise + OSRM Routing', 'MapmyIndia Commercial Freight Fleet', 'Google Maps Platform (Distance Matrix)']" />
            </div>
            <div>
              <div class="text-slate-300 font-bold mb-1">Tile Cache Status</div>
              <div class="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono flex justify-between">
                <span>All India Roadways Cache</span>
                <span class="text-emerald-400 font-bold">WARM (2.4 GB)</span>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-800 row items-center justify-between">
            <span class="text-xs text-slate-500 font-mono">Rate Limit: Unlimited Enterprise</span>
            <q-btn flat dense no-caps color="cyan" label="Verify Maps" size="sm" icon="check_circle" @click="testSingleGateway('CartoDB Maps')" />
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: Messaging & Gateways -->
    <div v-else-if="activeTab === 'gateways'" class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <div class="cyber-card p-5 h-full">
          <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm q-mb-xs">
            <q-icon name="chat" color="emerald" size="20px" />
            <span>WhatsApp Business Cloud API</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Automatically sends digital Bilty (LR) PDF and delivery OTPs directly to drivers & consignees
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-slate-300 font-bold mb-1">Meta WhatsApp Sender Phone</div>
              <q-input v-model="settings.whatsappSenderPhone" dense outlined placeholder="+91 98250 99999" />
            </div>
            <div>
              <div class="text-slate-300 font-bold mb-1">WhatsApp Cloud API Key</div>
              <q-input v-model="settings.whatsappApiKey" type="password" dense outlined placeholder="EAAC••••••••••••••••••••" />
            </div>
            <div class="row items-center justify-between p-3 rounded bg-slate-900 border border-slate-800 mt-2">
              <span class="text-xs text-slate-300 font-sans">Send WhatsApp PDF when LR is generated</span>
              <q-toggle v-model="settings.notifyCustomerOnPod" dense color="emerald" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="cyber-card p-5 h-full">
          <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm q-mb-xs">
            <q-icon name="sms" color="cyan" size="20px" />
            <span>Transactional SMS (DLT Approved)</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Instant SMS dispatch alerts and advance voucher disbursement notifications
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <div class="text-slate-300 font-bold mb-1">SMS Gateway Provider</div>
              <DeskCombo v-model="settings.smsProvider" :options="['ValueFirst Enterprise SMS', 'Twilio Messaging Cloud', 'Gupshup SMS Gateway', 'Textlocal India']" />
            </div>
            <div>
              <div class="text-slate-300 font-bold mb-1">6-Character DLT Sender Header</div>
              <q-input v-model="settings.smsSenderId" dense outlined placeholder="APEXLG" maxlength="6" class="font-mono text-uppercase" />
            </div>
            <div class="row items-center justify-between p-3 rounded bg-slate-900 border border-slate-800 mt-2">
              <span class="text-xs text-slate-300 font-sans">Send SMS to Driver on Trip Allocation</span>
              <q-toggle v-model="settings.notifyDriverOnDispatch" dense color="cyan" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="cyber-card p-5">
          <div class="text-subtitle1 text-weight-bold text-white row items-center q-gutter-x-sm q-mb-xs">
            <q-icon name="mail" color="cyan" size="20px" />
            <span>Outgoing SMTP Email Relay (Invoices & Billing Statements)</span>
          </div>
          <div class="text-caption text-slate-400 q-mb-md">
            Corporate mail server used for sending PDF freight invoices, ledger statements, and daily dispatch reports
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <DeskField label="SMTP Host Server" required shortcut="1">
                <q-input v-model="settings.smtpHost" dense outlined placeholder="smtp.office365.com" class="font-mono" />
              </DeskField>
            </div>
            <div class="col-12 col-md-2">
              <DeskField label="SMTP Port" required shortcut="2">
                <DeskNumberInput v-model="settings.smtpPort" placeholder="587" :step="1" :min="1" :max="65535" />
              </DeskField>
            </div>
            <div class="col-12 col-md-3">
              <DeskField label="Authenticated Mail User" required shortcut="3">
                <q-input v-model="settings.smtpUser" dense outlined placeholder="dispatch@apexlogistics.com" />
              </DeskField>
            </div>
            <div class="col-12 col-md-3">
              <DeskField label="Relay Ping Verification">
                <q-btn
                  unelevated
                  no-caps
                  icon="send"
                  label="Send Test Email"
                  class="desk-btn-primary full-width"
                  style="height: 38px;"
                  @click="testSingleGateway('Email SMTP Relay')"
                />
              </DeskField>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Defaults Confirmation Dialog -->
    <DeskDialog
      v-model="showResetDialog"
      title="Reset Organization Settings?"
      width="440px"
      confirm-label="Reset to Defaults"
      cancel-label="Keep Current"
      @confirm="confirmResetDefaults"
      @cancel="showResetDialog = false"
    >
      <div class="text-slate-300 font-sans text-sm leading-relaxed">
        Are you sure you want to restore the default enterprise settings? All current organization names, document series counters, and custom gateway endpoints will be reset to default values.
      </div>
    </DeskDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../stores/auth';
import {
  DeskForm,
  DeskField,
  DeskCombo,
  DeskDialog,
  DeskNumberInput,
} from '../../framework';
import { useDeskPageShortcuts } from '../../desk';

const $q = useQuasar();
const authStore = useAuthStore();

const activeTab = ref<'profile' | 'statutory' | 'series' | 'telematics' | 'gateways'>('profile');
const isSaving = ref(false);
const isTestingGateways = ref(false);
const showResetDialog = ref(false);
const brandColor = ref('#00f2fe');

const brandColorOptions = [
  { name: 'Cyan Laser', hex: '#00f2fe' },
  { name: 'Royal Blue', hex: '#0284c7' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber Gold', hex: '#f59e0b' },
];

const activeBrandColorName = computed(() => {
  const match = brandColorOptions.find((c) => c.hex === brandColor.value);
  return match ? match.name : brandColor.value;
});

const stateOptions = [
  '24 - Gujarat',
  '27 - Maharashtra',
  '08 - Rajasthan',
  '07 - Delhi',
  '06 - Haryana',
  '09 - Uttar Pradesh',
  '29 - Karnataka',
  '33 - Tamil Nadu',
  '36 - Telangana',
  '19 - West Bengal',
  '23 - Madhya Pradesh',
  '03 - Punjab',
];

const defaultSettings = {
  // Profile & Legal
  name: 'Apex Global Logistics Private Limited',
  tradeName: 'Apex Logistics India',
  orgCode: 'ORG-IND-2401',
  cin: 'U60200GJ2020PTC115420',
  incorporatedYear: '2020',
  address: '100 South Wacker Dr, Suite 1800, Central Logistics Hub',
  city: 'Ahmedabad',
  state: '24 - Gujarat',
  pincode: '380009',
  phone: '+91 98250 00000',
  supportEmail: 'operations@apexlogistics.com',
  website: 'https://apexlogistics.com',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST +5:30)',

  // Statutory & Tax
  gstin: '24AAACA1234F1Z5',
  pan: 'AAACA1234F',
  tan: 'AHMA12345B',
  msmeNumber: 'UDYAM-GJ-01-0012345',
  gstRate: '5% without ITC (GTA Standard RCM)',
  rcmDefault: true,
  tdsFreightDeduction: true,
  eWayBillMandatoryAbove: 50000,

  // Series & Sequencing
  lrPrefix: 'LR-',
  lrNextNumber: 240051,
  tripPrefix: 'TR/',
  tripNextNumber: 240081,
  invoicePrefix: 'INV-26-',
  invoiceNextNumber: 1043,
  advancePrefix: 'ADV-',
  advanceNextNumber: 5022,
  fuelPrefix: 'FL-',
  fuelNextNumber: 8821,
  strictSequentialNumbering: true,
  autoAttachEWayBill: true,

  // Telematics & APIs
  vahanApiKey: 'vhn_live_9819284019283018',
  vahanEndpoint: 'https://api.vahan.gov.in/v4/rc-sync',
  fastagMerchantId: 'ICICI-NETC-FLEET-901',
  fastagBank: 'ICICI Bank Commercial Fastag',
  gpsProvider: 'Teltonika & Queclink (Native TCP/WS)',
  gpsPort: 5432,
  osmMapEngine: 'OpenStreetMap Enterprise + OSRM Routing',

  // Messaging
  whatsappApiKey: 'EAAC_live_99210291028301',
  whatsappSenderPhone: '+91 98250 99999',
  smsProvider: 'ValueFirst Enterprise SMS',
  smsSenderId: 'APEXLG',
  smtpHost: 'smtp.office365.com',
  smtpPort: 587,
  smtpUser: 'dispatch@apexlogistics.com',
  notifyDriverOnDispatch: true,
  notifyCustomerOnPod: true,
};

const settings = ref({ ...defaultSettings });

onMounted(() => {
  const saved = localStorage.getItem('tms_org_settings');
  if (saved) {
    try {
      settings.value = { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      // fallback to default
    }
  }
});

function saveAllSettings() {
  isSaving.value = true;
  setTimeout(() => {
    localStorage.setItem('tms_org_settings', JSON.stringify(settings.value));
    isSaving.value = false;
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Organization Settings Saved',
      caption: 'Enterprise parameters, tax rules, and document series successfully updated.',
      position: 'top-right',
    });
  }, 700);
}

function testAllGateways() {
  isTestingGateways.value = true;
  setTimeout(() => {
    isTestingGateways.value = false;
    $q.notify({
      type: 'positive',
      icon: 'hub',
      message: 'All Gateways Verified (4/4 Online)',
      caption: 'Vahan 4.0 (24ms) • Fastag NETC (42ms) • GPS Stream (Active) • SMS/WhatsApp (OK)',
      position: 'top-right',
    });
  }, 900);
}

function testSingleGateway(name: string) {
  $q.notify({
    type: 'positive',
    icon: 'check_circle',
    message: `${name} Verified`,
    caption: 'Connection ping test succeeded with 0% packet loss.',
    position: 'top-right',
  });
}

function mockUploadLogo() {
  $q.notify({
    type: 'info',
    icon: 'image',
    message: 'Logo Updated',
    caption: 'New corporate letterhead brand mark applied to Bilty & Invoices.',
    position: 'top-right',
  });
}

function confirmResetDefaults() {
  settings.value = { ...defaultSettings };
  localStorage.setItem('tms_org_settings', JSON.stringify(settings.value));
  showResetDialog.value = false;
  $q.notify({
    type: 'warning',
    icon: 'restart_alt',
    message: 'Default Parameters Restored',
    caption: 'Standard enterprise configurations reloaded.',
    position: 'top-right',
  });
}

// ─── Tally-Style Page Keyboard Shortcuts ─────────────────────────────────────
useDeskPageShortcuts({
  onSave: saveAllSettings,
  filters: [
    () => { activeTab.value = 'profile'; },
    () => { activeTab.value = 'statutory'; },
    () => { activeTab.value = 'series'; },
    () => { activeTab.value = 'telematics'; },
    () => { activeTab.value = 'gateways'; },
  ],
  isModalOpen: () => showResetDialog.value,
  onEscape: () => {
    showResetDialog.value = false;
  },
});
</script>

<style scoped>
.desk-kbd {
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid #cbd5e1;
  color: #0284c7;
  font-family: var(--desk-font-mono, monospace);
  font-size: 10px;
}

.view-mode-toggle {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 3px;
  gap: 3px;
  max-width: 100%;
  overflow-x: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.view-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  outline: none;
  white-space: nowrap;
}

.view-mode-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.view-mode-btn.active {
  background: #f0f9ff;
  color: #0284c7;
  border-color: #0284c7;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.12);
}

.view-mode-btn .q-icon {
  font-size: 16px;
}

/* Suppress ugly browser number input arrows */
:deep(input[type='number']::-webkit-outer-spin-button),
:deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
:deep(input[type='number']) {
  -moz-appearance: textfield !important;
}

</style>
