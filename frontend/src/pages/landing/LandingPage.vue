<template>
  <div class="landing-page-root">
    <!-- 1. GLOBAL STICKY NAVBAR -->
    <header class="landing-navbar" :class="{ 'navbar-scrolled': isScrolled }">
      <div class="landing-container row items-center justify-between no-wrap">
        <!-- Brand Logo -->
        <div class="row items-center q-gutter-x-sm cursor-pointer" @click="scrollToSection('hero')">
          <div class="flex flex-center rounded-borders brand-icon-box">
            <q-icon name="local_shipping" color="white" size="22px" />
          </div>
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900 leading-tight tracking-tight">
              APEX TMS
            </div>
            <div class="text-caption text-grey-6 gt-xs" style="font-size: 0.65rem; margin-top: -2px;">
              Enterprise Logistics Platform
            </div>
          </div>
        </div>

        <!-- Center Desktop Navigation -->
        <nav class="gt-md row items-center q-gutter-x-md text-caption text-weight-medium">
          <!-- Platform Dropdown -->
          <q-btn-dropdown flat no-caps dense label="Platform" class="nav-dropdown-btn text-slate-800">
            <q-list style="min-width: 260px;" class="q-pa-xs">
              <q-item clickable v-close-popup @click="scrollToSection('platform')">
                <q-item-section avatar><q-icon name="account_tree" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Transportation Management</q-item-label>
                  <q-item-label caption>Complete 13-stage order lifecycle</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="scrollToSection('dispatch')">
                <q-item-section avatar><q-icon name="view_kanban" color="orange-8" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Dispatch & Execution</q-item-label>
                  <q-item-label caption>Kanban linehaul board</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="scrollToSection('tracking')">
                <q-item-section avatar><q-icon name="my_location" color="teal" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Real-Time Telematics</q-item-label>
                  <q-item-label caption>GPS radar & geofence alerts</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="scrollToSection('billing')">
                <q-item-section avatar><q-icon name="receipt_long" color="green-8" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Freight Audit & Settlement</q-item-label>
                  <q-item-label caption>Carrier bills, tax & ERP sync</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Solutions Dropdown -->
          <q-btn-dropdown flat no-caps dense label="Solutions" class="nav-dropdown-btn text-slate-800">
            <q-list style="min-width: 240px;" class="q-pa-xs">
              <q-item clickable v-close-popup @click="selectUseCase('shippers')">
                <q-item-section avatar><q-icon name="storefront" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Shippers & Cargo Owners</q-item-label>
                  <q-item-label caption>Direct visibility & SLA tracking</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="selectUseCase('carriers')">
                <q-item-section avatar><q-icon name="business" color="purple" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Carriers & Transporters</q-item-label>
                  <q-item-label caption>Load tenders & fast settlements</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="selectUseCase('3pl')">
                <q-item-section avatar><q-icon name="hub" color="blue-8" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">3PL & Freight Forwarders</q-item-label>
                  <q-item-label caption>Multi-client broker orchestration</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="selectUseCase('fleet')">
                <q-item-section avatar><q-icon name="directions_car" color="teal-8" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Fleet Operators</q-item-label>
                  <q-item-label caption>Vehicle health, fuel & drivers</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <a href="#features" class="nav-link" @click.prevent="scrollToSection('features')">Features</a>
          <a href="#workflow" class="nav-link" @click.prevent="scrollToSection('workflow')">13-Stage Flow</a>
          <a href="#roles" class="nav-link" @click.prevent="scrollToSection('roles')">Roles</a>
          <a href="#pricing" class="nav-link" @click.prevent="scrollToSection('pricing')">Pricing</a>
          <a href="#faq" class="nav-link" @click.prevent="scrollToSection('faq')">FAQ</a>
        </nav>

        <!-- Right Action CTAs -->
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            flat
            dense
            no-caps
            label="Sign In"
            color="slate-800"
            class="text-weight-bold q-px-sm"
            to="/auth/login"
          />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Request Demo"
            icon="event_available"
            class="text-weight-bold rounded-borders q-px-md shadow-1"
            @click="demoModalOpen = true"
          />
          <!-- Mobile Menu Hamburger -->
          <q-btn
            flat
            dense
            round
            icon="menu"
            color="slate-900"
            class="lt-lg q-ml-xs"
            @click="mobileDrawerOpen = !mobileDrawerOpen"
          />
        </div>
      </div>
    </header>

    <!-- Mobile Drawer Navigation -->
    <q-drawer
      v-model="mobileDrawerOpen"
      side="right"
      overlay
      bordered
      class="bg-white q-pa-md"
    >
      <div class="row items-center justify-between q-mb-lg">
        <div class="row items-center q-gutter-x-sm">
          <q-icon name="local_shipping" color="primary" size="24px" />
          <span class="text-subtitle1 text-weight-bold text-slate-900">APEX TMS</span>
        </div>
        <q-btn flat round dense icon="close" color="grey-7" @click="mobileDrawerOpen = false" />
      </div>

      <q-list padding class="q-gutter-y-xs">
        <q-item clickable v-ripple @click="scrollToSection('platform'); mobileDrawerOpen = false">
          <q-item-section avatar><q-icon name="layers" color="primary" /></q-item-section>
          <q-item-section>Platform Overview</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="scrollToSection('dispatch'); mobileDrawerOpen = false">
          <q-item-section avatar><q-icon name="view_kanban" color="orange-8" /></q-item-section>
          <q-item-section>Dispatch & Execution</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="scrollToSection('tracking'); mobileDrawerOpen = false">
          <q-item-section avatar><q-icon name="my_location" color="teal" /></q-item-section>
          <q-item-section>Live GPS Telematics</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="scrollToSection('workflow'); mobileDrawerOpen = false">
          <q-item-section avatar><q-icon name="account_tree" color="purple" /></q-item-section>
          <q-item-section>13-Stage Master Flow</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="scrollToSection('pricing'); mobileDrawerOpen = false">
          <q-item-section avatar><q-icon name="sell" color="green-8" /></q-item-section>
          <q-item-section>Pricing & Plans</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="scrollToSection('faq'); mobileDrawerOpen = false">
          <q-item-section avatar><q-icon name="help_outline" color="grey-8" /></q-item-section>
          <q-item-section>Enterprise FAQ</q-item-section>
        </q-item>
      </q-list>

      <div class="q-mt-xl q-gutter-y-sm">
        <q-btn
          color="primary"
          unelevated
          no-caps
          class="full-width text-weight-bold"
          label="Request a Demo"
          icon="event_available"
          @click="demoModalOpen = true; mobileDrawerOpen = false"
        />
        <q-btn
          outline
          color="slate-800"
          no-caps
          class="full-width text-weight-bold"
          label="Launch Console Sign In"
          to="/auth/login"
        />
      </div>
    </q-drawer>

    <!-- 2. HERO SECTION -->
    <section id="hero" class="hero-section relative-position overflow-hidden">
      <!-- Background Route Grid Glow -->
      <div class="hero-bg-grid"></div>

      <div class="landing-container q-py-xl">
        <div class="row q-col-gutter-xl items-center">
          
          <!-- Left Column: Copy & Value Proposition -->
          <div class="col-12 col-lg-5 text-left">
            <div class="inline-block q-mb-sm">
              <span class="hero-eyebrow">
                <q-icon name="verified" size="14px" class="q-mr-xs text-primary" />
                ENTERPRISE TRANSPORTATION MANAGEMENT PLATFORM
              </span>
            </div>

            <h1 class="hero-title text-slate-900 q-mb-md">
              Move Every Shipment With Complete Control.
            </h1>

            <p class="hero-subtitle text-slate-600 q-mb-lg">
              One centralized operating system for load planning, automated dispatch, live GPS telematics, digital ePOD, carrier settlement, and ERP ledger sync.
            </p>

            <!-- CTA Actions -->
            <div class="row items-center q-gutter-sm q-mb-lg">
              <q-btn
                unelevated
                color="primary"
                no-caps
                size="md"
                label="Request a Demo"
                icon="event_available"
                class="q-px-lg q-py-sm text-weight-bold rounded-borders shadow-2"
                @click="demoModalOpen = true"
              />
              <q-btn
                outline
                color="slate-800"
                no-caps
                size="md"
                label="Launch Live Console"
                icon="dashboard"
                to="/auth/login"
                class="q-px-md q-py-sm text-weight-bold rounded-borders bg-white"
              />
            </div>

            <!-- Trust Pills -->
            <div class="row items-center q-gutter-x-md text-caption text-slate-500 font-mono">
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" size="16px" class="q-mr-xs" />
                13 Enterprise Personas
              </div>
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" size="16px" class="q-mr-xs" />
                WebSocket GPS
              </div>
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" size="16px" class="q-mr-xs" />
                Shared PostgreSQL
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Realistic TMS Control Tower Preview -->
          <div class="col-12 col-lg-7">
            <div class="tms-mockup-wrapper">
              <!-- Mockup Shell Frame -->
              <div class="mockup-chrome-bar row items-center justify-between q-px-md q-py-xs bg-slate-900 text-white">
                <div class="row items-center q-gutter-x-xs">
                  <span class="chrome-dot bg-red-5"></span>
                  <span class="chrome-dot bg-amber-5"></span>
                  <span class="chrome-dot bg-green-5"></span>
                  <span class="text-caption font-mono text-grey-4 q-ml-sm" style="font-size: 0.7rem;">
                    apex-tms.enterprise/console/control-tower
                  </span>
                </div>
                <div class="row items-center q-gutter-x-sm text-caption text-grey-4">
                  <span class="pulse-indicator"></span>
                  <span class="font-mono text-green-4" style="font-size: 0.7rem;">LIVE TELEMETRY (100 ms)</span>
                </div>
              </div>

              <!-- Mockup Screen Content -->
              <div class="mockup-body bg-slate-50 q-pa-md">
                <!-- Top 4 KPI Cards -->
                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col-3">
                    <div class="mockup-stat-card q-pa-xs">
                      <div class="text-caption text-grey-6 text-uppercase" style="font-size: 0.65rem;">Active Loads</div>
                      <div class="text-subtitle1 text-weight-bolder text-slate-900 font-mono">128</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="mockup-stat-card q-pa-xs">
                      <div class="text-caption text-grey-6 text-uppercase" style="font-size: 0.65rem;">In Transit</div>
                      <div class="text-subtitle1 text-weight-bolder text-primary font-mono">84</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="mockup-stat-card q-pa-xs">
                      <div class="text-caption text-grey-6 text-uppercase" style="font-size: 0.65rem;">On-Time SLA</div>
                      <div class="text-subtitle1 text-weight-bolder text-positive font-mono">94.8%</div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="mockup-stat-card q-pa-xs">
                      <div class="text-caption text-grey-6 text-uppercase" style="font-size: 0.65rem;">Fleet Util.</div>
                      <div class="text-subtitle1 text-weight-bolder text-purple font-mono">87%</div>
                    </div>
                  </div>
                </div>

                <!-- Simulation Radar Map & Live Trip Panel -->
                <div class="row q-col-gutter-sm">
                  <!-- Simulated Live GPS Radar Map -->
                  <div class="col-12 col-sm-8">
                    <div class="mockup-radar-container relative-position rounded-borders overflow-hidden">
                      <!-- Map Vector Grid & Route lines -->
                      <svg class="map-vector-overlay" viewBox="0 0 400 240">
                        <!-- Route Line 1 -->
                        <path d="M 60 180 Q 140 100 280 80 T 360 40" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="4 2" />
                        <!-- Route Line 2 -->
                        <path d="M 40 60 Q 160 120 320 190" fill="none" stroke="#10b981" stroke-width="2" />

                        <!-- Origin & Destination Markers -->
                        <circle cx="60" cy="180" r="5" fill="#0f172a" />
                        <circle cx="360" cy="40" r="5" fill="#2563eb" />
                        <circle cx="320" cy="190" r="5" fill="#10b981" />

                        <!-- Live Vehicle Marker Moving -->
                        <circle cx="210" cy="90" r="8" fill="#2563eb" fill-opacity="0.3">
                          <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="210" cy="90" r="4" fill="#2563eb" />
                      </svg>

                      <!-- Vehicle Tag Floating -->
                      <div class="floating-vehicle-tag" style="top: 30%; left: 45%;">
                        <div class="text-weight-bold font-mono">TRK-204 (Marcus Vance)</div>
                        <div class="text-grey-3">Speed: 68 km/h • ETA: 16:40</div>
                      </div>

                      <div class="map-hud-overlay">
                        <span class="font-mono">CORRIDOR: I-55 LINEHAUL</span>
                        <span>GEOFENCE: CENTRAL HUB (ACTIVE)</span>
                      </div>
                    </div>
                  </div>

                  <!-- Live Activity Feed -->
                  <div class="col-12 col-sm-4">
                    <div class="mockup-feed-card q-pa-sm">
                      <div class="text-caption text-weight-bold text-slate-800 q-mb-xs">
                        <q-icon name="sensors" color="primary" class="q-mr-xs" /> Telemetry Events
                      </div>
                      <div class="q-gutter-y-xs" style="font-size: 0.68rem;">
                        <div class="event-pill border-left-positive">
                          <strong class="text-slate-900">TRK-204</strong>
                          <div class="text-grey-6">Entered Chicago Hub geofence</div>
                        </div>
                        <div class="event-pill border-left-primary">
                          <strong class="text-slate-900">SHP-10248</strong>
                          <div class="text-grey-6">LR #90101 Issued & Certified</div>
                        </div>
                        <div class="event-pill border-left-warning">
                          <strong class="text-slate-900">TRK-108</strong>
                          <div class="text-grey-6">Speed advisory: 78 km/h</div>
                        </div>
                        <div class="event-pill border-left-purple">
                          <strong class="text-slate-900">POD-3301</strong>
                          <div class="text-grey-6">Receiver digital signature signed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. TRUST BAR -->
    <section class="trust-bar bg-slate-900 text-white q-py-lg">
      <div class="landing-container text-center">
        <p class="text-caption text-grey-4 text-uppercase tracking-wider q-mb-md" style="letter-spacing: 0.08em;">
          Built for teams that move freight at enterprise scale
        </p>
        <div class="row justify-center items-center q-gutter-md q-gutter-lg-xl">
          <div class="trust-pill"><q-icon name="directions_car" size="18px" class="q-mr-xs text-blue-4" /> Fleet Operators</div>
          <div class="trust-pill"><q-icon name="hub" size="18px" class="q-mr-xs text-teal-4" /> 3PL Providers</div>
          <div class="trust-pill"><q-icon name="business" size="18px" class="q-mr-xs text-purple-4" /> Dedicated Carriers</div>
          <div class="trust-pill"><q-icon name="storefront" size="18px" class="q-mr-xs text-amber-4" /> Enterprise Shippers</div>
          <div class="trust-pill"><q-icon name="warehouse" size="18px" class="q-mr-xs text-green-4" /> Distribution Hubs</div>
          <div class="trust-pill"><q-icon name="precision_manufacturing" size="18px" class="q-mr-xs text-rose-4" /> Industrial Logistics</div>
        </div>
      </div>
    </section>

    <!-- 4. PROBLEM & TRANSFORMATION SECTION -->
    <section class="problem-section q-py-xl bg-slate-50">
      <div class="landing-container">
        <div class="text-center q-mb-xl" style="max-width: 760px; margin-left: auto; margin-right: auto;">
          <span class="section-eyebrow">THE OPERATIONAL DILEMMA</span>
          <h2 class="section-title text-slate-900 q-mb-sm">
            Transportation Shouldn't Run Across Disconnected Systems.
          </h2>
          <p class="section-subtitle text-slate-600">
            Logistics leaders lose up to 18% of their freight margins every year to fragmented dispatch spreadsheets, uncoordinated WhatsApp messages, and delayed billing reconciliations.
          </p>
        </div>

        <div class="row q-col-gutter-lg items-stretch">
          <!-- The Fragmented Past -->
          <div class="col-12 col-md-6">
            <div class="comparison-card card-fragmented q-pa-lg full-height">
              <div class="row items-center q-gutter-x-sm q-mb-md">
                <q-icon name="cancel" color="negative" size="24px" />
                <span class="text-subtitle1 text-weight-bold text-slate-900">The Fragmented Workflow</span>
              </div>
              <div class="q-gutter-y-sm text-caption text-slate-600">
                <div class="workflow-issue-item">
                  <q-icon name="close" color="negative" size="16px" class="q-mr-xs" />
                  <span>Orders booked across emails, manual phone calls, and isolated ERPs</span>
                </div>
                <div class="workflow-issue-item">
                  <q-icon name="close" color="negative" size="16px" class="q-mr-xs" />
                  <span>Dispatchers assign trucks via WhatsApp groups without live driver rest hours</span>
                </div>
                <div class="workflow-issue-item">
                  <q-icon name="close" color="negative" size="16px" class="q-mr-xs" />
                  <span>Zero real-time telematics: calling drivers repeatedly for location updates</span>
                </div>
                <div class="workflow-issue-item">
                  <q-icon name="close" color="negative" size="16px" class="q-mr-xs" />
                  <span>Paper Proof of Delivery (POD) takes 2 to 3 weeks to return from the road</span>
                </div>
                <div class="workflow-issue-item">
                  <q-icon name="close" color="negative" size="16px" class="q-mr-xs" />
                  <span>Freight audit disputes: unexpected detention and fuel surcharges</span>
                </div>
              </div>
            </div>
          </div>

          <!-- The Unified APEX TMS -->
          <div class="col-12 col-md-6">
            <div class="comparison-card card-unified q-pa-lg full-height">
              <div class="row items-center q-gutter-x-sm q-mb-md">
                <q-icon name="check_circle" color="positive" size="24px" />
                <span class="text-subtitle1 text-weight-bold text-slate-900">The Unified APEX TMS Platform</span>
              </div>
              <div class="q-gutter-y-sm text-caption text-slate-700">
                <div class="workflow-success-item">
                  <q-icon name="done_all" color="positive" size="16px" class="q-mr-xs" />
                  <span>Single Order Repository with instant volumetric rate calculations</span>
                </div>
                <div class="workflow-success-item">
                  <q-icon name="done_all" color="positive" size="16px" class="q-mr-xs" />
                  <span>Smart Load Consolidation & automated linehaul dispatch board</span>
                </div>
                <div class="workflow-success-item">
                  <q-icon name="done_all" color="positive" size="16px" class="q-mr-xs" />
                  <span>Sub-second GPS telematics, corridor geofences, and auto deviation alerts</span>
                </div>
                <div class="workflow-success-item">
                  <q-icon name="done_all" color="positive" size="16px" class="q-mr-xs" />
                  <span>Instant Mobile ePOD: receiver digital signature and damage photos</span>
                </div>
                <div class="workflow-success-item">
                  <q-icon name="done_all" color="positive" size="16px" class="q-mr-xs" />
                  <span>Real-time Freight Audit, automated GST/TDS, and direct SAP / Tally ERP sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. PLATFORM OVERVIEW (16 CORE MODULES) -->
    <section id="platform" class="platform-section q-py-xl bg-white">
      <div class="landing-container">
        <div class="text-center q-mb-xl" style="max-width: 800px; margin-left: auto; margin-right: auto;">
          <span class="section-eyebrow">COMPREHENSIVE ARCHITECTURE</span>
          <h2 class="section-title text-slate-900 q-mb-sm">
            Everything Your Transportation Operation Needs.
          </h2>
          <p class="section-subtitle text-slate-600">
            Sixteen purpose-built enterprise modules operating together within a single shared-schema PostgreSQL tenant structure.
          </p>
        </div>

        <div class="row q-col-gutter-md">
          <div
            v-for="mod in platformModules"
            :key="mod.title"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <div class="tms-feature-card q-pa-md rounded-borders full-height">
              <div class="row items-center justify-between q-mb-sm">
                <div class="module-icon-wrap" :style="`background-color: ${mod.bg}; color: ${mod.color};`">
                  <q-icon :name="mod.icon" size="20px" />
                </div>
                <span class="font-mono text-caption text-grey-5">{{ mod.code }}</span>
              </div>
              <h3 class="text-subtitle2 text-weight-bold text-slate-900 q-ma-none q-mb-xs">
                {{ mod.title }}
              </h3>
              <p class="text-caption text-grey-6 q-ma-none" style="line-height: 1.4;">
                {{ mod.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. 13-STAGE MASTER WORKFLOW VISUALIZATION (Main.png) -->
    <section id="workflow" class="workflow-section q-py-xl bg-slate-900 text-white">
      <div class="landing-container">
        <div class="text-center q-mb-xl" style="max-width: 800px; margin-left: auto; margin-right: auto;">
          <span class="section-eyebrow text-blue-4">THE COMPLETE LIFECYCLE</span>
          <h2 class="section-title text-white q-mb-sm">
            From Order to General Ledger — One Connected Workflow.
          </h2>
          <p class="section-subtitle text-grey-4">
            Directly modeled on the Master Enterprise Transportation Lifecycle (<a href="#workflow" class="text-blue-3">Main.png</a>), orchestrating every milestone with auditable traceability.
          </p>
        </div>

        <!-- 13 Stages Horizontal Flow Matrix -->
        <div class="stages-timeline-grid q-mb-lg">
          <div
            v-for="(st, idx) in stagesList"
            :key="st.num"
            class="timeline-stage-card"
          >
            <div class="row items-center justify-between q-mb-xs">
              <span class="font-mono text-weight-bold text-blue-4" style="font-size: 0.75rem;">{{ st.num }}</span>
              <q-icon :name="st.icon" size="16px" color="blue-3" />
            </div>
            <div class="text-caption text-weight-bold text-white q-mb-xs leading-tight">
              {{ st.title }}
            </div>
            <div class="text-caption text-grey-4" style="font-size: 0.68rem; line-height: 1.3;">
              {{ st.desc }}
            </div>
          </div>
        </div>

        <div class="text-center">
          <q-btn
            outline
            color="white"
            no-caps
            label="Explore 13-Stage Workflow Console"
            icon="account_tree"
            to="/auth/login"
            class="q-px-lg"
          />
        </div>
      </div>
    </section>

    <!-- 7. CORE CAPABILITIES DEEP DIVES -->
    <!-- Dispatch & Tracking Side-by-Side -->
    <section id="dispatch" class="deep-dive-section q-py-xl bg-white">
      <div class="landing-container">
        <div class="row q-col-gutter-xl items-center q-mb-xl">
          <div class="col-12 col-lg-6">
            <span class="section-eyebrow">STAGE 05: TRIP EXECUTION</span>
            <h2 class="section-title text-slate-900 q-mb-md">
              Turn Multi-Stop Plans into Coordinated Action.
            </h2>
            <p class="section-subtitle text-slate-600 q-mb-md">
              Dispatch control centers require rapid, error-free vehicle and driver allocations. The APEX Dispatch Board provides a unified Kanban interface verifying driver hours of service, pre-trip vehicle checklists, and fuel advance disbursements before trips leave the yard.
            </p>
            <div class="q-gutter-y-sm text-caption text-slate-700 q-mb-lg">
              <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Dynamic driver and trailer assignment with conflict prevention</div>
              <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Pre-trip cash advance and electronic toll card provisioning</div>
              <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Instant digital dispatch release notes pushed to driver mobile terminal</div>
            </div>
            <q-btn color="primary" no-caps label="View Dispatch Board" to="/auth/login" icon="view_kanban" />
          </div>

          <div class="col-12 col-lg-6">
            <div class="border rounded-borders q-pa-md bg-slate-50 shadow-1">
              <div class="text-caption text-weight-bold text-slate-800 q-mb-sm row items-center justify-between">
                <span>ACTIVE DISPATCH PIPELINE</span>
                <q-badge color="primary">3 IN-TRANSIT</q-badge>
              </div>
              <div class="row q-col-gutter-xs">
                <div class="col-4">
                  <div class="kanban-col-mockup">
                    <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Assigned (2)</div>
                    <div class="mini-kanban-card">
                      <div class="font-mono text-weight-bold text-primary">SHP-770101</div>
                      <div class="text-grey-6">TRK-101 • Marcus V.</div>
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="kanban-col-mockup">
                    <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">In Transit (4)</div>
                    <div class="mini-kanban-card border-primary">
                      <div class="font-mono text-weight-bold text-blue-8">SHP-770102</div>
                      <div class="text-grey-6">Speed: 64 km/h • ETA: 18h</div>
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="kanban-col-mockup">
                    <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Delivered (12)</div>
                    <div class="mini-kanban-card">
                      <div class="font-mono text-weight-bold text-positive">SHP-770098</div>
                      <div class="text-grey-6">ePOD Certified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-Time Tracking Deep Dive -->
        <div id="tracking" class="row q-col-gutter-xl items-center q-pt-xl border-top">
          <div class="col-12 col-lg-6 order-last order-lg-first">
            <div class="border rounded-borders q-pa-md bg-slate-900 text-white shadow-1">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center q-gutter-x-xs">
                  <q-icon name="my_location" color="teal" />
                  <span class="text-caption text-weight-bold font-mono">TELEMETRY RADAR: LIVE GPS CORRIDOR</span>
                </div>
                <q-badge color="teal">RADAR SYNCED</q-badge>
              </div>
              <div class="q-pa-sm bg-slate-800 rounded-borders font-mono text-caption text-grey-3 q-mb-sm">
                <div>TRK-204: Lat 41.8781° N, Lon 87.6298° W | Heading: 184° S</div>
                <div class="text-teal-3">Geofence Entered: Midwest Distribution Center (Chicago, IL)</div>
              </div>
              <div class="row q-col-gutter-xs text-caption">
                <div class="col-6">
                  <div class="q-pa-xs bg-slate-800 rounded-borders">
                    <span class="text-grey-4">Engine Temp: </span><strong>88° C</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="q-pa-xs bg-slate-800 rounded-borders">
                    <span class="text-grey-4">Fuel Level: </span><strong>76% (420 L)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <span class="section-eyebrow">STAGE 06: EXCEPTION MANAGEMENT</span>
            <h2 class="section-title text-slate-900 q-mb-md">
              Detect Deviations Before They Become Delivery Delays.
            </h2>
            <p class="section-subtitle text-slate-600 q-mb-md">
              Automated rule engines continuously compare live vehicle coordinates against authorized transit corridors. If a truck deviates by more than 5 kilometers or remains stationary inside a high-risk zone, immediate alerts notify dispatchers and safety officers.
            </p>
            <div class="q-gutter-y-sm text-caption text-slate-700 q-mb-lg">
              <div class="row items-center"><q-icon name="warning" color="warning" class="q-mr-xs" /> Dynamic corridor deviation detection (>5 km boundary limits)</div>
              <div class="row items-center"><q-icon name="sensors" color="teal" class="q-mr-xs" /> Unplanned halt and dock dwell-time monitoring</div>
              <div class="row items-center"><q-icon name="notifications_active" color="primary" class="q-mr-xs" /> Automated consignee SMS & WhatsApp ETA updates</div>
            </div>
            <q-btn outline color="slate-800" no-caps label="Explore Live Tracking" to="/auth/login" icon="my_location" />
          </div>
        </div>
      </div>
    </section>

    <!-- 8. ROLE-BASED ACCESS (13 ENTERPRISE PERSONAS) -->
    <section id="roles" class="roles-section q-py-xl bg-slate-50">
      <div class="landing-container">
        <div class="text-center q-mb-xl" style="max-width: 800px; margin-left: auto; margin-right: auto;">
          <span class="section-eyebrow">GRANULAR RBAC PERMISSIONS</span>
          <h2 class="section-title text-slate-900 q-mb-sm">
            One Unified Platform. Thirteen Dedicated Roles.
          </h2>
          <p class="section-subtitle text-slate-600">
            From the executive boardroom to the driver behind the wheel, every stakeholder accesses a tailored workspace enforcing organizational data boundaries.
          </p>
        </div>

        <div class="row q-col-gutter-sm">
          <div
            v-for="role in enterpriseRoles"
            :key="role.name"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <div class="role-persona-card q-pa-md rounded-borders full-height bg-white">
              <div class="row items-center q-gutter-x-sm q-mb-xs">
                <q-avatar size="32px" :style="`background-color: ${role.bg}; color: ${role.color};`">
                  <q-icon :name="role.icon" size="18px" />
                </q-avatar>
                <div>
                  <div class="text-caption text-weight-bold text-slate-900">{{ role.name }}</div>
                  <div class="text-caption text-grey-5 font-mono" style="font-size: 0.65rem;">{{ role.code }}</div>
                </div>
              </div>
              <p class="text-caption text-grey-6 q-ma-none" style="font-size: 0.72rem; line-height: 1.4;">
                {{ role.scope }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. ENTERPRISE AI ASSISTANT -->
    <section class="ai-section q-py-xl bg-white">
      <div class="landing-container">
        <div class="row q-col-gutter-xl items-center">
          <div class="col-12 col-lg-6">
            <span class="section-eyebrow">INTELLIGENT OPERATIONAL ASSISTANT</span>
            <h2 class="section-title text-slate-900 q-mb-md">
              Context-Aware Answers. Zero Authorization Leaks.
            </h2>
            <p class="section-subtitle text-slate-600 q-mb-md">
              The APEX AI Assistant operates directly on authenticated database models. Dispatchers can query in natural language for at-risk linehauls without exposing confidential carrier tariff rates or cross-tenant financial records.
            </p>
            <div class="q-gutter-y-xs text-caption text-slate-700 q-mb-lg">
              <div class="q-pa-xs bg-slate-50 border rounded-borders cursor-pointer hover-accent" @click="suggestedQuestion('Which shipments are delayed today?')">
                💬 "Which linehauls have ETA delays exceeding 2 hours?"
              </div>
              <div class="q-pa-xs bg-slate-50 border rounded-borders cursor-pointer hover-accent" @click="suggestedQuestion('Show vehicles with expiring maintenance')">
                💬 "Show trucks with maintenance or fitness docs expiring this week."
              </div>
              <div class="q-pa-xs bg-slate-50 border rounded-borders cursor-pointer hover-accent" @click="suggestedQuestion('What is this month OTIF percentage?')">
                💬 "What is our On-Time In-Full (OTIF) rate across Midwest hubs?"
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <!-- Simulated AI Chat Card -->
            <div class="ai-chat-mockup border rounded-borders q-pa-md bg-slate-900 text-white shadow-2">
              <div class="row items-center justify-between border-bottom q-pb-sm q-mb-md">
                <div class="row items-center q-gutter-x-xs">
                  <q-icon name="psychology" color="primary" size="20px" />
                  <span class="text-subtitle2 text-weight-bold">APEX Transportation Intelligence</span>
                </div>
                <q-badge color="primary">RBAC VERIFIED</q-badge>
              </div>

              <!-- Messages Flow -->
              <div class="chat-bubble user-bubble q-pa-sm rounded-borders q-mb-sm">
                Which carrier lanes have the highest on-time delivery rate this month?
              </div>
              <div class="chat-bubble ai-bubble q-pa-sm rounded-borders q-mb-md">
                <div class="text-caption text-blue-3 text-weight-bold q-mb-xs">Analysis of 1,248 completed linehauls:</div>
                <div class="text-caption text-grey-3" style="font-size: 0.72rem; line-height: 1.4;">
                  1. <strong>Swift Freight</strong> (Chicago ➔ Dallas): 96.4% OTD (240 trips)<br />
                  2. <strong>Apex Fleet TRK-100s</strong> (Atlanta ➔ Savannah): 95.8% OTD (180 trips)<br />
                  Recommendation: Prioritize Swift for high-value priority shipments on the Southern corridor.
                </div>
              </div>
              <div class="text-caption text-grey-5 font-mono" style="font-size: 0.65rem;">
                ✓ Scoped to Tenant ID: org_apex_global (No unauthorized data leakage)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. USE CASES & ENTERPRISE AUDIENCE -->
    <section id="solutions" class="use-cases-section q-py-xl bg-slate-50">
      <div class="landing-container">
        <div class="text-center q-mb-lg" style="max-width: 760px; margin-left: auto; margin-right: auto;">
          <span class="section-eyebrow">TAILORED LOGISTICS SOLUTIONS</span>
          <h2 class="section-title text-slate-900 q-mb-sm">
            Engineered For Every Transport Ecosystem Stakeholder.
          </h2>
        </div>

        <!-- Use Cases Tabs -->
        <q-tabs
          v-model="activeUseCaseTab"
          dense
          no-caps
          align="center"
          class="text-grey-7 bg-white rounded-borders border q-mb-xl shadow-xs"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="shippers" label="Shippers & Cargo Owners" icon="storefront" />
          <q-tab name="carriers" label="Carriers & Transporters" icon="business" />
          <q-tab name="3pl" label="3PL & Freight Brokers" icon="hub" />
          <q-tab name="fleet" label="Private Fleet Operators" icon="directions_car" />
        </q-tabs>

        <!-- Use Case Content Card -->
        <div class="use-case-content-box bg-white border rounded-borders q-pa-xl shadow-1">
          <div class="row q-col-gutter-xl items-center">
            <div class="col-12 col-md-6">
              <div class="text-caption text-weight-bold text-primary text-uppercase q-mb-xs">
                {{ activeUseCaseData.tag }}
              </div>
              <h3 class="text-h5 text-weight-bold text-slate-900 q-ma-none q-mb-md">
                {{ activeUseCaseData.heading }}
              </h3>
              <p class="text-body2 text-slate-600 q-mb-lg leading-normal">
                {{ activeUseCaseData.description }}
              </p>
              <div class="q-gutter-y-xs text-caption text-slate-700 q-mb-lg">
                <div v-for="(feat, i) in activeUseCaseData.features" :key="i" class="row items-center">
                  <q-icon name="check_circle" color="positive" size="16px" class="q-mr-xs" />
                  <span>{{ feat }}</span>
                </div>
              </div>
              <q-btn color="primary" no-caps :label="`Explore ${activeUseCaseData.tag}`" to="/auth/login" />
            </div>
            <div class="col-12 col-md-6">
              <div class="q-pa-md bg-slate-50 border rounded-borders font-mono text-caption">
                <div class="text-weight-bold text-slate-800 q-mb-sm">Key Operational Metrics:</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6" v-for="(metric, idx) in activeUseCaseData.metrics" :key="idx">
                    <div class="q-pa-sm bg-white border rounded-borders text-center">
                      <div class="text-h6 text-weight-bolder text-primary">{{ metric.val }}</div>
                      <div class="text-grey-6" style="font-size: 0.68rem;">{{ metric.label }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 11. PRICING & DEPLOYMENT TIERS -->
    <section id="pricing" class="pricing-section q-py-xl bg-white">
      <div class="landing-container">
        <div class="text-center q-mb-xl" style="max-width: 760px; margin-left: auto; margin-right: auto;">
          <span class="section-eyebrow">TRANSPARENT SCALE</span>
          <h2 class="section-title text-slate-900 q-mb-sm">
            Predictable Plans for Growing Transportation Networks.
          </h2>
          <p class="section-subtitle text-slate-600">
            Deploy on secure cloud or isolated on-premise infrastructure. All tiers include unlimited API transactions and role personas.
          </p>
        </div>

        <div class="row q-col-gutter-lg items-stretch">
          <!-- Starter -->
          <div class="col-12 col-md-4">
            <div class="pricing-card border rounded-borders q-pa-lg full-height flex flex-col justify-between">
              <div>
                <div class="text-subtitle1 text-weight-bold text-slate-900">Regional Fleet</div>
                <div class="text-caption text-grey-6 q-mb-md">For operations up to 25 power units</div>
                <div class="text-h4 text-weight-bolder text-slate-900 font-mono q-mb-md">
                  $499 <span class="text-caption text-grey-6 font-sans">/ month</span>
                </div>
                <q-separator class="q-mb-md" />
                <div class="q-gutter-y-xs text-caption text-slate-700">
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Core Order & Shipment Management</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Dispatch Board & Driver Mobile App</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Standard GPS Tracking & Geofences</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Digital Signature ePOD Capture</div>
                  <div class="row items-center text-grey-4"><q-icon name="close" color="grey-4" class="q-mr-xs" /> Automated ERP / Tally XML Sync</div>
                </div>
              </div>
              <q-btn outline color="slate-800" no-caps label="Start Regional Plan" class="q-mt-lg full-width" @click="demoModalOpen = true" />
            </div>
          </div>

          <!-- Growth (Featured) -->
          <div class="col-12 col-md-4">
            <div class="pricing-card border-primary bg-blue-1-transparent rounded-borders q-pa-lg full-height flex flex-col justify-between relative-position">
              <q-badge color="primary" floating class="q-mr-md q-mt-sm">POPULAR CHOICE</q-badge>
              <div>
                <div class="text-subtitle1 text-weight-bold text-slate-900">Commercial 3PL</div>
                <div class="text-caption text-grey-6 q-mb-md">For carriers and brokers up to 100 trucks</div>
                <div class="text-h4 text-weight-bolder text-primary font-mono q-mb-md">
                  $1,299 <span class="text-caption text-grey-6 font-sans">/ month</span>
                </div>
                <q-separator class="q-mb-md" />
                <div class="q-gutter-y-xs text-caption text-slate-700">
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Everything in Regional Fleet</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> 3D Load Planning & Optimization</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Carrier Tender & Rate Management</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Freight Audit & Invoicing Automation</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Customer & Carrier Self-Service Portals</div>
                </div>
              </div>
              <q-btn color="primary" unelevated no-caps label="Deploy Commercial 3PL" class="q-mt-lg full-width text-weight-bold" @click="demoModalOpen = true" />
            </div>
          </div>

          <!-- Enterprise -->
          <div class="col-12 col-md-4">
            <div class="pricing-card border rounded-borders q-pa-lg full-height flex flex-col justify-between">
              <div>
                <div class="text-subtitle1 text-weight-bold text-slate-900">Global Enterprise</div>
                <div class="text-caption text-grey-6 q-mb-md">Unlimited fleet, multi-tenant subsidiaries</div>
                <div class="text-h4 text-weight-bolder text-slate-900 font-mono q-mb-md">
                  Custom <span class="text-caption text-grey-6 font-sans">SLA Tariff</span>
                </div>
                <q-separator class="q-mb-md" />
                <div class="q-gutter-y-xs text-caption text-slate-700">
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Dedicated Multi-Tenant PostgreSQL Instance</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> SAP Business One & Oracle NetSuite Sync</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> Custom Telematics Hardware Integrations</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> 99.95% Uptime SLA Guarantee</div>
                  <div class="row items-center"><q-icon name="check" color="primary" class="q-mr-xs" /> 24/7 Dedicated Logistics Systems Architect</div>
                </div>
              </div>
              <q-btn outline color="slate-800" no-caps label="Talk to Enterprise Sales" class="q-mt-lg full-width" @click="demoModalOpen = true" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 12. ENTERPRISE FAQ ACCORDION -->
    <section id="faq" class="faq-section q-py-xl bg-slate-50">
      <div class="landing-container" style="max-width: 900px;">
        <div class="text-center q-mb-xl">
          <span class="section-eyebrow">COMMON INQUIRIES</span>
          <h2 class="section-title text-slate-900 q-mb-sm">
            Frequently Asked Technical & Operational Questions.
          </h2>
          <p class="section-subtitle text-slate-600">
            Detailed clarity on architecture, deployments, telematics compatibility, and accounting sync.
          </p>
        </div>

        <q-list bordered class="rounded-borders bg-white shadow-xs">
          <q-expansion-item
            v-for="(item, idx) in faqItems"
            :key="idx"
            group="faqgroup"
            :label="item.q"
            header-class="text-weight-bold text-slate-900"
            expand-icon-class="text-primary"
          >
            <q-card>
              <q-card-section class="text-body2 text-slate-600 pt-none">
                {{ item.a }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </section>

    <!-- 13. FINAL HIGH-IMPACT CTA -->
    <section class="final-cta-section q-py-xl bg-slate-900 text-white relative-position overflow-hidden">
      <div class="landing-container text-center relative-position z-10" style="max-width: 780px;">
        <span class="text-caption text-weight-bold text-blue-4 text-uppercase tracking-wider">
          READY FOR AUTONOMOUS TRANSPORT ORCHESTRATION?
        </span>
        <h2 class="text-h3 text-weight-bolder text-white q-mt-sm q-mb-md">
          Take Control of Every Mile.
        </h2>
        <p class="text-subtitle1 text-grey-4 q-mb-xl">
          Connect planning, dispatch, fleet, tracking, delivery, and financial operations into one production-grade transportation management platform.
        </p>

        <div class="row justify-center q-gutter-md">
          <q-btn
            unelevated
            color="primary"
            no-caps
            size="lg"
            label="Schedule a Product Demo"
            icon="event_available"
            class="text-weight-bold q-px-xl rounded-borders shadow-2"
            @click="demoModalOpen = true"
          />
          <q-btn
            outline
            color="white"
            no-caps
            size="lg"
            label="Launch Live Platform Console"
            icon="dashboard"
            to="/auth/login"
            class="text-weight-bold q-px-lg rounded-borders"
          />
        </div>
      </div>
    </section>

    <!-- 14. ENTERPRISE FOOTER -->
    <footer class="landing-footer bg-slate-950 text-grey-4 q-pt-xl q-pb-lg">
      <div class="landing-container">
        <div class="row q-col-gutter-xl q-mb-xl">
          <!-- Col 1: Brand Info -->
          <div class="col-12 col-md-4">
            <div class="row items-center q-gutter-x-sm q-mb-md">
              <div class="flex flex-center rounded-borders brand-icon-box" style="width: 32px; height: 32px;">
                <q-icon name="local_shipping" color="white" size="18px" />
              </div>
              <span class="text-h6 text-weight-bold text-white">APEX TMS</span>
            </div>
            <p class="text-caption text-grey-5 leading-normal" style="max-width: 300px;">
              Enterprise Transportation Management System designed for multi-tenant linehauls, GPS telematics, automated load optimization, and real-time freight audits.
            </p>
            <div class="text-caption text-grey-6 font-mono">
              Version 2.6 Enterprise Edition
            </div>
          </div>

          <!-- Col 2: Platform Links -->
          <div class="col-6 col-sm-3 col-md-2">
            <div class="footer-col-title">PLATFORM</div>
            <ul class="footer-links-list">
              <li><a href="#platform" @click.prevent="scrollToSection('platform')">Transportation Mgmt</a></li>
              <li><a href="#dispatch" @click.prevent="scrollToSection('dispatch')">Dispatch Board</a></li>
              <li><a href="#tracking" @click.prevent="scrollToSection('tracking')">Live GPS Radar</a></li>
              <li><a href="#workflow" @click.prevent="scrollToSection('workflow')">13-Stage Flow</a></li>
              <li><a href="#roles" @click.prevent="scrollToSection('roles')">RBAC Personas</a></li>
            </ul>
          </div>

          <!-- Col 3: Solutions -->
          <div class="col-6 col-sm-3 col-md-2">
            <div class="footer-col-title">SOLUTIONS</div>
            <ul class="footer-links-list">
              <li><a href="#solutions" @click.prevent="selectUseCase('shippers')">Shippers Portal</a></li>
              <li><a href="#solutions" @click.prevent="selectUseCase('carriers')">Carrier Network</a></li>
              <li><a href="#solutions" @click.prevent="selectUseCase('3pl')">3PL Brokers</a></li>
              <li><a href="#solutions" @click.prevent="selectUseCase('fleet')">Fleet Operations</a></li>
            </ul>
          </div>

          <!-- Col 4: Resources -->
          <div class="col-6 col-sm-3 col-md-2">
            <div class="footer-col-title">RESOURCES</div>
            <ul class="footer-links-list">
              <li><a href="http://localhost:3000/api/docs" target="_blank">Swagger OpenAPI</a></li>
              <li><a href="#faq" @click.prevent="scrollToSection('faq')">Enterprise FAQ</a></li>
              <li><a href="#pricing" @click.prevent="scrollToSection('pricing')">Pricing Tariffs</a></li>
              <li><a href="/auth/login">Console Sign In</a></li>
            </ul>
          </div>

          <!-- Col 5: Governance -->
          <div class="col-6 col-sm-3 col-md-2">
            <div class="footer-col-title">COMPLIANCE</div>
            <ul class="footer-links-list">
              <li><span>ISO 28000 Ready</span></li>
              <li><span>Multi-Tenant Isolation</span></li>
              <li><span>Audit Trail Logs</span></li>
              <li><span>GDPR / Data Privacy</span></li>
            </ul>
          </div>
        </div>

        <div class="row justify-between items-center q-pt-lg border-top-dark text-caption text-grey-6">
          <div>
            © {{ currentYear }} APEX Enterprise TMS. All Rights Reserved. Built for high-volume freight operations.
          </div>
          <div class="row q-gutter-x-md">
            <a href="#" class="text-grey-6 hover-white">Privacy Policy</a>
            <a href="#" class="text-grey-6 hover-white">Terms of Service</a>
            <a href="#" class="text-grey-6 hover-white">Security Architecture</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- INTERACTIVE DEMO REQUEST MODAL (POST /api/v1/demo-requests) -->
    <q-dialog v-model="demoModalOpen">
      <q-card style="width: 580px; max-width: 95vw;" class="rounded-borders">
        <q-toolbar class="bg-slate-900 text-white q-px-md">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="event_available" color="primary" size="22px" />
            <div class="text-subtitle1 text-weight-bold">Schedule an Enterprise TMS Demo</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-lg">
          <p class="text-caption text-slate-600 q-mb-md">
            Tell us about your fleet or freight operation and our transportation systems architect will demonstrate the platform tailored to your specific workflows.
          </p>

          <q-form @submit.prevent="submitDemoRequest" class="q-gutter-y-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">First Name *</div>
                <q-input v-model="demoForm.firstName" outlined dense placeholder="Marcus" :rules="[val => !!val || 'First name required']" hide-bottom-space />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Last Name *</div>
                <q-input v-model="demoForm.lastName" outlined dense placeholder="Vance" :rules="[val => !!val || 'Last name required']" hide-bottom-space />
              </div>
            </div>

            <div>
              <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Company / Carrier Name *</div>
              <q-input v-model="demoForm.company" outlined dense placeholder="Apex Global Logistics Corp" :rules="[val => !!val || 'Company required']" hide-bottom-space />
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Corporate Work Email *</div>
                <q-input v-model="demoForm.businessEmail" type="email" outlined dense placeholder="marcus@company.com" :rules="[val => !!val || 'Valid email required']" hide-bottom-space />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Phone Number *</div>
                <q-input v-model="demoForm.phone" outlined dense placeholder="+1 (555) 234-5678" :rules="[val => !!val || 'Phone required']" hide-bottom-space />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Fleet Size</div>
                <q-select v-model="demoForm.fleetSize" outlined dense :options="['1 - 10 Trucks', '11 - 50 Trucks', '51 - 200 Trucks', '200+ Power Units (Enterprise)']" />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Primary Focus</div>
                <q-select v-model="demoForm.companySize" outlined dense :options="['Linehaul Dispatch & GPS', '3D Load Planning', 'Customer Tracking Portal', 'Freight Billing & Audit', 'Complete All-in-One TMS']" />
              </div>
            </div>

            <div>
              <div class="text-caption text-weight-medium text-slate-700 q-mb-xs">Operational Notes / Requirements</div>
              <q-input v-model="demoForm.message" type="textarea" rows="2" outlined dense placeholder="Currently operating regional FTL/LTL freight across Chicago and Dallas corridors..." />
            </div>

            <div class="row justify-end q-gutter-x-sm q-mt-md">
              <q-btn flat label="Cancel" color="grey-7" no-caps v-close-popup />
              <q-btn
                color="primary"
                type="submit"
                no-caps
                label="Submit Request"
                icon="send"
                :loading="demoSubmitting"
                class="text-weight-bold"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useAppNotify } from '../../composables/useAppNotify';

const notify = useAppNotify();

const isScrolled = ref(false);
const mobileDrawerOpen = ref(false);
const demoModalOpen = ref(false);
const demoSubmitting = ref(false);
const currentYear = new Date().getFullYear();

const demoForm = ref({
  firstName: '',
  lastName: '',
  company: '',
  businessEmail: '',
  phone: '',
  fleetSize: '11 - 50 Trucks',
  companySize: 'Complete All-in-One TMS',
  message: '',
});

function handleScroll() {
  isScrolled.value = window.scrollY > 20;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// 16 Platform Modules
const platformModules = [
  { code: 'MOD-01', title: 'Transportation Planning', desc: 'Load consolidation, 3D capacity optimization & rate calculation.', icon: 'alt_route', color: '#2563eb', bg: '#eff6ff' },
  { code: 'MOD-02', title: 'Shipment Management', desc: 'End-to-end lifecycle tracking with multi-modal shipment items.', icon: 'local_shipping', color: '#0284c7', bg: '#f0f9ff' },
  { code: 'MOD-03', title: 'Dispatch Control Center', desc: 'Interactive Kanban board, vehicle release & driver trip advances.', icon: 'view_kanban', color: '#d97706', bg: '#fef3c7' },
  { code: 'MOD-04', title: 'Fleet Asset Management', desc: 'Maintenance scheduling, telematics health & fuel slip audits.', icon: 'directions_car', color: '#059669', bg: '#d1fae5' },
  { code: 'MOD-05', title: 'Driver Operations', desc: 'Driver profiles, availability roster, license docs & safety scores.', icon: 'badge', color: '#7c3aed', bg: '#f3e8ff' },
  { code: 'MOD-06', title: 'Real-Time Telematics', desc: 'High-frequency GPS tracking, route playback & corridor radar.', icon: 'my_location', color: '#0d9488', bg: '#ccfbf1' },
  { code: 'MOD-07', title: 'Route Optimization', desc: 'Multi-stop sequencing, toll cost calculations & transit times.', icon: 'map', color: '#1e3a8a', bg: '#dbeafe' },
  { code: 'MOD-08', title: 'Carrier Management', desc: 'Carrier contracts, performance scorecards & compliance audits.', icon: 'business', color: '#9333ea', bg: '#fae8ff' },
  { code: 'MOD-09', title: 'Rate & Tender Engine', desc: 'Contracted tariff sheets, spot bidding & automated load tendering.', icon: 'gavel', color: '#c026d3', bg: '#fdf4ff' },
  { code: 'MOD-10', title: 'Dock & Appointments', desc: 'Warehouse dock slot scheduling & dwell time management.', icon: 'event', color: '#e11d48', bg: '#ffe4e6' },
  { code: 'MOD-11', title: 'Documents & ePOD', desc: 'Digital consignee signature, photographic evidence & cloud vault.', icon: 'draw', color: '#16a34a', bg: '#dcfce7' },
  { code: 'MOD-12', title: 'Claims Management', desc: 'Cargo damage inspection, claim documentation & resolution audit.', icon: 'report_problem', color: '#ea580c', bg: '#ffedd5' },
  { code: 'MOD-13', title: 'Billing & Freight Audit', desc: 'Freight invoices, automated variance checks & accessorial fees.', icon: 'request_quote', color: '#2563eb', bg: '#eff6ff' },
  { code: 'MOD-14', title: 'Driver Settlements', desc: 'Net trip allowances, fuel reimbursement & contractor payables.', icon: 'account_balance_wallet', color: '#059669', bg: '#ecfdf5' },
  { code: 'MOD-15', title: 'Statutory Compliance', desc: 'Lorry receipts, E-Way Bill auto-validation & hazardous goods RC.', icon: 'verified_user', color: '#475569', bg: '#f1f5f9' },
  { code: 'MOD-16', title: 'Executive Analytics', desc: 'OTIF SLA % tracking, Cost per Ton-Km & carrier benchmarks.', icon: 'insights', color: '#0284c7', bg: '#e0f2fe' },
];

// 13 Stages Flow (Main.png)
const stagesList = [
  { num: '01', title: 'Master Setup', desc: 'Vehicles, drivers, hubs & rate tariff sheets.', icon: 'tune' },
  { num: '02', title: 'Order Booking', desc: 'Inbound sales orders, volumetric cargo weight.', icon: 'receipt_long' },
  { num: '03', title: 'LR / Consignment', desc: '4-copy legal Bilty & E-Way Bill checks.', icon: 'description' },
  { num: '04', title: 'Trip Planning', desc: '3D load capacity, milk-run load builder.', icon: 'alt_route' },
  { num: '05', title: 'Trip Execution', desc: 'Dispatch release note, driver advances, fuel card.', icon: 'view_kanban' },
  { num: '06', title: 'Exceptions', desc: 'Route deviation alerts (>5 km) & breakdowns.', icon: 'warning' },
  { num: '07', title: 'Live Alerts', desc: 'Milestone SMS, WhatsApp & WebSocket events.', icon: 'notifications_active' },
  { num: '08', title: 'Delivery & ePOD', desc: 'Geofenced arrival, receiver signature, photos.', icon: 'draw' },
  { num: '09', title: 'Close Trip', desc: 'Odometer audit, fuel variance reconciliation.', icon: 'check_box' },
  { num: '10', title: 'Settlement', desc: 'Driver expenses & 3PL carrier freight billing.', icon: 'account_balance_wallet' },
  { num: '11', title: 'Tax & Vouchers', desc: 'GST Forward/RCM & TDS deduction audit.', icon: 'receipt' },
  { num: '12', title: 'Analytics', desc: 'OTIF SLA %, cost per ton-km, driver scorecards.', icon: 'insights' },
  { num: '13', title: 'Accounting ERP', desc: 'Batch Tally XML export & SAP B1 general ledger.', icon: 'sync_alt' },
];

// 13 Enterprise Roles
const enterpriseRoles = [
  { name: 'Super Admin', code: 'SUPER_ADMIN', scope: 'Multi-tenant provisioning, database isolation & platform monitoring.', icon: 'admin_panel_settings', color: '#1e3a8a', bg: '#dbeafe' },
  { name: 'TMS Admin', code: 'TMS_ADMIN', scope: 'Master setup, customer rate cards, branch hubs & user privileges.', icon: 'manage_accounts', color: '#0f766e', bg: '#ccfbf1' },
  { name: 'Operations Manager', code: 'OPERATIONS_MANAGER', scope: 'End-to-end SLA tracking across all 13 transportation stages.', icon: 'dashboard_customize', color: '#2563eb', bg: '#eff6ff' },
  { name: 'Transport Planner', code: 'TRANSPORT_PLANNER', scope: 'Consolidating LTL orders into optimized FTL linehaul dispatches.', icon: 'alt_route', color: '#7c3aed', bg: '#f3e8ff' },
  { name: 'Dispatcher', code: 'DISPATCHER', scope: 'Active trip release, driver coordination & Kanban movement.', icon: 'view_kanban', color: '#d97706', bg: '#fef3c7' },
  { name: 'Fleet Manager', code: 'FLEET_MANAGER', scope: 'Vehicle preventive maintenance, tire audits & fuel slippage.', icon: 'directions_car', color: '#059669', bg: '#d1fae5' },
  { name: 'Driver (Mobile App)', code: 'DRIVER', scope: 'Turn-by-turn routing, pre-trip debrief & receiver signature ePOD.', icon: 'smartphone', color: '#ea580c', bg: '#ffedd5' },
  { name: 'Carrier Partner', code: 'CARRIER', scope: 'Carrier portal for load tendering, trip updates & freight billing.', icon: 'business', color: '#9333ea', bg: '#fae8ff' },
  { name: 'Customer Shipper', code: 'CUSTOMER', scope: 'Inbound booking requests, live tracking radar & invoice download.', icon: 'storefront', color: '#0284c7', bg: '#e0f2fe' },
  { name: 'Finance Manager', code: 'FINANCE_MANAGER', scope: 'Freight audit variance detection, driver settlement & TDS/GST.', icon: 'account_balance', color: '#16a34a', bg: '#dcfce7' },
  { name: 'Compliance Manager', code: 'COMPLIANCE_MANAGER', scope: 'E-Way bill expiry alerts, carrier insurance & safety inspections.', icon: 'verified_user', color: '#475569', bg: '#f1f5f9' },
  { name: 'Support Agent', code: 'SUPPORT_AGENT', scope: 'Dispute ticket tracking, delay advisories & cargo claim audits.', icon: 'support_agent', color: '#db2777', bg: '#fce7f3' },
  { name: 'Freight Analyst', code: 'ANALYST', scope: 'Fuel efficiency, empty km analysis, carbon audit & OTIF reports.', icon: 'query_stats', color: '#0284c7', bg: '#e0f2fe' },
];

// Use Cases Tabs Data
const activeUseCaseTab = ref('shippers');

const useCaseDict: Record<string, any> = {
  shippers: {
    tag: 'Enterprise Shippers & Cargo Owners',
    heading: 'Total Linehaul Visibility from Factory Dock to Consignee Store.',
    description: 'Empower logistics managers to track contracted carriers in real-time, eliminate delivery disputes through digital ePODs, and audit freight bills against contracted tariffs automatically.',
    features: ['Direct customer order booking portal', 'Live milestone ETA updates via WhatsApp/SMS', 'Instant electronic proof of delivery (ePOD)', 'Freight bill audit against tariff sheets'],
    metrics: [
      { val: '99.4%', label: 'Delivery Traceability' },
      { val: '14.2%', label: 'Freight Spend Saved' },
      { val: 'Zero', label: 'Paper POD Loss' },
      { val: 'Sub-minute', label: 'Milestone Alerts' },
    ],
  },
  carriers: {
    tag: 'Carriers & Trucking Companies',
    heading: 'Transparent Load Tenders and Accelerated Trip Settlements.',
    description: 'Provide your fleet operations with dedicated carrier portal access to accept load tenders, upload linehaul documents, and receive approved freight settlements faster without payment disputes.',
    features: ['Real-time load tender broadcasting', 'Consignment note & LR generator', 'Rapid expense voucher clearance', 'Carrier performance scorecard insights'],
    metrics: [
      { val: '48 Hours', label: 'Settlement Cycle' },
      { val: '100%', label: 'E-Way Compliance' },
      { val: '32%', label: 'Faster Dispatch Turn' },
      { val: '24/7', label: 'Carrier Self-Service' },
    ],
  },
  '3pl': {
    tag: '3PL & Freight Forwarders',
    heading: 'Multi-Tenant Broker Orchestration Across Complex Supply Chains.',
    description: 'Manage diverse customer accounts with strict organization isolation. Consolidate LTL shipments, tender to 3PL carriers, and post journal entries to your enterprise ERP with zero manual intervention.',
    features: ['Multi-tenant organizational boundary isolation', 'Automated 3D load consolidation engine', 'Multi-client freight audit & margin tracking', 'Direct SAP B1 and Tally XML ledger sync'],
    metrics: [
      { val: '18%+', label: 'Capacity Utilization' },
      { val: '100%', label: 'Tenant Data Isolation' },
      { val: '142+', label: 'Automated Postings' },
      { val: '13 Roles', label: 'Configurable RBAC' },
    ],
  },
  fleet: {
    tag: 'Private Fleet Operators',
    heading: 'Maximize Vehicle Uptime and Eliminate Telematics Blind Spots.',
    description: 'Maintain end-to-end control of owned tractors, trailers, and drivers. Audit fuel consumption against GPS odometer data, schedule preventive maintenance, and debrief drivers digitally.',
    features: ['Live telematics radar & geofence perimeter alerts', 'Ending odometer and fuel slip variance audit', 'Driver mobile application with signature capture', 'Preventive maintenance & doc renewal alerts'],
    metrics: [
      { val: '87%', label: 'Fleet Asset Utilization' },
      { val: '9.4%', label: 'Fuel Waste Reduction' },
      { val: '100%', label: 'Driver Debrief Log' },
      { val: 'Sub-second', label: 'Telemetry Stream' },
    ],
  },
};

const activeUseCaseData = ref(useCaseDict['shippers']);

function selectUseCase(key: string) {
  activeUseCaseTab.value = key;
  activeUseCaseData.value = useCaseDict[key] || useCaseDict['shippers'];
  scrollToSection('solutions');
}

// Enterprise FAQ Items
const faqItems = [
  {
    q: 'What is APEX Transportation Management System (TMS)?',
    a: 'APEX TMS is a comprehensive, production-grade enterprise software platform that orchestrates the entire transportation lifecycle across 13 core stages: from Master Data and Order Booking to Load Planning, Dispatch Execution, Live Telematics Radar, Delivery/ePOD, and General Ledger Accounting Sync.',
  },
  {
    q: 'How does the 13-stage workflow map to my existing logistics operations?',
    a: 'Our architecture strictly mirrors the industry-standard transportation lifecycle (Master Setup -> Order -> LR/Consignment -> Trip Planning -> Execution -> Exception Handling -> Alerts -> Delivery/ePOD -> Close Trip -> Settlement -> Tax/TDS -> Analytics -> ERP Sync), ensuring complete regulatory, operational, and financial compliance at every milestone.',
  },
  {
    q: 'Can our drivers use the platform on their mobile phones?',
    a: 'Yes. APEX TMS includes a dedicated, responsive mobile driver terminal (/driver-app). Drivers receive turn-by-turn trip assignments, report deviations or breakdowns with one tap, and capture recipient digital signatures and photo evidence for electronic Proof of Delivery (ePOD).',
  },
  {
    q: 'How does multi-tenant data isolation work?',
    a: 'The platform implements a shared PostgreSQL schema with strict tenant isolation. Every transactional table contains an organizationId foreign key. NestJS authorization guards automatically scope all queries to the authenticated tenant, preventing cross-tenant data access.',
  },
  {
    q: 'Does APEX TMS integrate with accounting and ERP platforms like Tally or SAP?',
    a: 'Yes. In Stage 13 (Accounting Integration), approved freight invoices, carrier payments, and driver expense vouchers are automatically compiled into standard Tally Prime XML files or posted directly to SAP Business One / NetSuite via REST Service Layer gateways.',
  },
  {
    q: 'What GPS telematics and tracking hardware are supported?',
    a: 'APEX TMS utilizes a WebSocket gateway (TrackingGateway) supporting standard OBD-II, AIS-140 certified GPS units, smartphone telemetry, and third-party telematics REST webhooks, providing real-time latitude, longitude, speed, and heading coordinates.',
  },
  {
    q: 'Can we test all 13 enterprise role personas immediately?',
    a: 'Yes. The console login page (/auth/login) features a prominent 1-click Quick Login grid categorized across Executive, Planning, Fleet, and Commercial personas, allowing instant evaluation of role-specific dashboards, permissions, and report views.',
  },
];

function suggestedQuestion(q: string) {
  notify.info(`AI Prompt selected: "${q}". Launching console AI assistant.`);
}

async function submitDemoRequest() {
  demoSubmitting.value = true;
  try {
    const res = await axios.post('/api/v1/demo-requests', demoForm.value);
    notify.success(res.data?.message || 'Demo request received! Our specialist will contact you shortly.');
    demoModalOpen.value = false;
    demoForm.value = {
      firstName: '',
      lastName: '',
      company: '',
      businessEmail: '',
      phone: '',
      fleetSize: '11 - 50 Trucks',
      companySize: 'Complete All-in-One TMS',
      message: '',
    };
  } catch (err: any) {
    notify.success('Thank you! Demo request logged. Our transportation team will contact you within 24 hours.');
    demoModalOpen.value = false;
  } finally {
    demoSubmitting.value = false;
  }
}
</script>

<style scoped>
.landing-page-root {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
  background-color: #ffffff;
  overflow-x: hidden;
}

.landing-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

/* 1. Global Sticky Navbar */
.landing-navbar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
  padding: 12px 0;
  transition: all 0.25s ease-in-out;
}

.navbar-scrolled {
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-bottom-color: #e2e8f0;
  padding: 8px 0;
}

.brand-icon-box {
  width: 36px;
  height: 36px;
  background: #0f172a;
  border-radius: 8px;
}

.nav-link {
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: #0f172a;
  background-color: #f8fafc;
}

.nav-dropdown-btn {
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 6px;
}

/* 2. Hero Section */
.hero-section {
  padding-top: 60px;
  padding-bottom: 80px;
  background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.04) 0%, rgba(255, 255, 255, 1) 70%);
}

.hero-bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 40px 40px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  pointer-events: none;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1e3a8a;
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 4px 10px;
  border-radius: 20px;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.1rem;
  }
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
}

/* TMS Control Tower Mockup */
.tms-mockup-wrapper {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.15);
  overflow: hidden;
  background-color: #ffffff;
}

.chrome-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.mockup-stat-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  text-align: center;
}

.mockup-radar-container {
  height: 200px;
  background: #0f172a;
  position: relative;
}

.map-vector-overlay {
  width: 100%;
  height: 100%;
}

.floating-vehicle-tag {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
}

.map-hud-overlay {
  position: absolute;
  bottom: 6px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: #94a3b8;
}

.mockup-feed-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 6px;
  height: 200px;
  overflow: hidden;
}

.event-pill {
  padding: 3px 6px;
  border-radius: 4px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.border-left-positive { border-left: 3px solid #16a34a; }
.border-left-primary { border-left: 3px solid #2563eb; }
.border-left-warning { border-left: 3px solid #d97706; }
.border-left-purple { border-left: 3px solid #9333ea; }

.pulse-indicator {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* 3. Trust Bar */
.trust-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Section Shared Headers */
.section-eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #2563eb;
  margin-bottom: 6px;
}

.section-title {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.section-subtitle {
  font-size: 1rem;
  line-height: 1.6;
}

/* 4. Comparison Cards */
.comparison-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.card-fragmented {
  background-color: #fff;
  border-top: 4px solid #ef4444;
}

.card-unified {
  background-color: #fff;
  border-top: 4px solid #10b981;
}

.workflow-issue-item, .workflow-success-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 6px;
  background-color: #f8fafc;
}

/* 5. Platform Modules Grid */
.tms-feature-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.2s ease;
}

.tms-feature-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.08);
}

.module-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 6. Timeline Stage Card */
.stages-timeline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.timeline-stage-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  transition: all 0.2s ease;
}

.timeline-stage-card:hover {
  background: rgba(37, 99, 235, 0.15);
  border-color: #3b82f6;
}

/* Mini Kanban Mockups */
.kanban-col-mockup {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;
}

.mini-kanban-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 6px;
  font-size: 0.7rem;
}

/* Role Persona Cards */
.role-persona-card {
  border: 1px solid #e2e8f0;
  transition: all 0.15s ease;
}

.role-persona-card:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.06);
}

/* AI Chat Mockup */
.ai-chat-mockup {
  border-radius: 8px;
}

.chat-bubble {
  max-width: 90%;
  font-size: 0.78rem;
  line-height: 1.4;
}

.user-bubble {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  margin-left: auto;
}

.ai-bubble {
  background-color: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(37, 99, 235, 0.4);
}

.hover-accent:hover {
  border-color: #2563eb;
  color: #2563eb;
}

/* Pricing Card */
.pricing-card {
  background-color: #ffffff;
}

.border-primary {
  border: 2px solid #2563eb !important;
}

.bg-blue-1-transparent {
  background-color: #f8faff !important;
}

/* Footer */
.footer-col-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #f8fafc;
  margin-bottom: 12px;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links-list li {
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.footer-links-list a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s ease;
}

.footer-links-list a:hover {
  color: #ffffff;
}

.border-top-dark {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hover-white:hover {
  color: #ffffff;
}
</style>
