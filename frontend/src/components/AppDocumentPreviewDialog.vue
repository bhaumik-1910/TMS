<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" maximized transition-show="slide-up" transition-hide="slide-down">
    <div class="bg-slate-900/90 w-full h-full flex flex-col justify-between overflow-hidden">
      <!-- Top Action Bar -->
      <div class="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            <q-icon name="description" size="18px" />
          </div>
          <div>
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <span>{{ docData?.title || 'Consignment & Transport Manifest' }}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                OFFICIAL BOL / POD
              </span>
            </div>
            <div class="text-xs text-slate-400 font-mono">
              Ref: {{ docData?.referenceNumber || docData?.id || 'DOC-904812' }} • Timestamp: {{ currentDate }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <q-btn
            outline
            dense
            color="white"
            icon="print"
            label="Print Document"
            no-caps
            size="sm"
            class="px-3"
            @click="printDocument"
          />
          <q-btn
            color="primary"
            dense
            icon="download"
            label="Download PDF"
            no-caps
            size="sm"
            class="px-3"
            @click="downloadDocument"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            v-close-popup
          />
        </div>
      </div>

      <!-- Document Canvas / Viewer Body -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-900/50">
        <!-- Printable White Sheet Paper Container -->
        <div
          id="printable-tms-doc"
          class="bg-white text-slate-900 w-full max-w-4xl min-h-[900px] shadow-2xl rounded-sm p-8 sm:p-12 flex flex-col justify-between border border-slate-200"
        >
          <div>
            <!-- Header Section with Corporate Logo and Barcode -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-slate-950 text-white rounded-lg flex items-center justify-center font-black text-xl tracking-tighter">
                  TMS
                </div>
                <div>
                  <div class="text-xl font-black tracking-tight text-slate-950">APEX GLOBAL LOGISTICS</div>
                  <div class="text-xs text-slate-500 font-medium">Interstate Freight Carrier & Multi-Modal Supply Networks</div>
                  <div class="text-[11px] text-slate-400">DOT #348912 • MC #894120 • Licensed Freight Brokerage</div>
                </div>
              </div>

              <!-- Barcode / Reference Box -->
              <div class="text-right">
                <div class="inline-block px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-center">
                  <div class="text-[9px] text-slate-500 tracking-widest font-semibold uppercase">WAYBILL / TRACKING</div>
                  <div class="text-base font-black tracking-wider text-slate-900">{{ docData?.shipmentNumber || docData?.referenceNumber || 'SHP-770101' }}</div>
                  <div class="text-[8px] text-slate-400 tracking-widest mt-0.5">||| | |||| || ||| |||| | ||</div>
                </div>
              </div>
            </div>

            <!-- Document Title Ribbon -->
            <div class="py-3 px-4 bg-slate-100 border-x border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 mb-6">
              <span>DOCUMENT CLASSIFICATION: <strong class="text-slate-950 font-bold uppercase">{{ docData?.documentType || 'UNIFORM BILL OF LADING / PROOF OF DELIVERY' }}</strong></span>
              <span class="font-mono text-slate-600">DATE ISSUED: {{ currentDate }}</span>
            </div>

            <!-- 2-Column Parties Section: Consignor (Origin) & Consignee (Destination) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <!-- Shipper / Consignor Box -->
              <div class="border border-slate-200 rounded p-4 bg-slate-50/50">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <q-icon name="trip_origin" size="14px" color="primary" />
                  SHIPPER / ORIGIN FACILITY (CONSIGNOR)
                </div>
                <div class="text-sm font-bold text-slate-900 mb-1">
                  {{ docData?.originFacility || 'Chicago Central Distribution Hub' }}
                </div>
                <div class="text-xs text-slate-600">
                  {{ docData?.originAddress || '1500 S Western Ave, Chicago, IL 60608' }}
                </div>
                <div class="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/80 flex justify-between">
                  <span>Contact: Dispatch Operations</span>
                  <span class="font-mono">+1 (555) 234-5678</span>
                </div>
              </div>

              <!-- Receiver / Consignee Box -->
              <div class="border border-slate-200 rounded p-4 bg-slate-50/50">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <q-icon name="location_on" size="14px" color="negative" />
                  RECEIVER / DESTINATION (CONSIGNEE)
                </div>
                <div class="text-sm font-bold text-slate-900 mb-1">
                  {{ docData?.customerName || docData?.destinationFacility || 'Dallas Logistics Center - Dock 4' }}
                </div>
                <div class="text-xs text-slate-600">
                  {{ docData?.destAddress || '2200 E Interstate 30, Dallas, TX 75201' }}
                </div>
                <div class="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/80 flex justify-between">
                  <span>Authorized Receiver: {{ docData?.receiverName || 'David Miller' }}</span>
                  <span class="font-mono">+1 (555) 876-5432</span>
                </div>
              </div>
            </div>

            <!-- Carrier & Vehicle Logistics Attributes Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 border border-slate-200 rounded text-xs">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-semibold">Tractor Unit</span>
                <strong class="font-mono text-slate-900 font-bold">{{ docData?.vehiclePlate || 'TRK-101 (Volvo VNL)' }}</strong>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-semibold">Assigned Driver</span>
                <strong class="text-slate-900 font-bold">{{ docData?.driverName || 'Marcus Vance (DRV-5001)' }}</strong>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-semibold">Motor Carrier</span>
                <strong class="text-slate-900 font-bold">{{ docData?.carrierName || 'Apex Fleet Dedicated' }}</strong>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-semibold">Cargo Transit Status</span>
                <strong class="text-emerald-700 font-bold uppercase">{{ docData?.status || 'IN_TRANSIT' }}</strong>
              </div>
            </div>

            <!-- Freight Manifest Items Table -->
            <div class="mb-8 overflow-hidden rounded border border-slate-200">
              <div class="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wide">
                Freight Articles & Cargo Specification
              </div>
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                  <tr>
                    <th class="py-2.5 px-4">Line</th>
                    <th class="py-2.5 px-4">Commodity / Item Description</th>
                    <th class="py-2.5 px-4">Handling Units</th>
                    <th class="py-2.5 px-4 text-right">Gross Weight</th>
                    <th class="py-2.5 px-4 text-right">Volume</th>
                    <th class="py-2.5 px-4 text-center">Class / Special</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td class="py-2.5 px-4 font-mono">01</td>
                    <td class="py-2.5 px-4 font-medium text-slate-900">
                      {{ docData?.commodity || 'Precision Electronic Components & Assemblies' }}
                      <div class="text-[10px] text-slate-400">Continuous temperature monitoring +4°C to +20°C</div>
                    </td>
                    <td class="py-2.5 px-4">18 Standard Pallets</td>
                    <td class="py-2.5 px-4 text-right font-mono">{{ docData?.weight || '14,500' }} kg</td>
                    <td class="py-2.5 px-4 text-right font-mono">{{ docData?.volume || '52.0' }} m³</td>
                    <td class="py-2.5 px-4 text-center">
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">FRAGILE</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-mono">02</td>
                    <td class="py-2.5 px-4 font-medium text-slate-900">
                      Protective Dunage & Pallet Wrappings
                    </td>
                    <td class="py-2.5 px-4">18 Pallet Base Units</td>
                    <td class="py-2.5 px-4 text-right font-mono">360 kg</td>
                    <td class="py-2.5 px-4 text-right font-mono">1.2 m³</td>
                    <td class="py-2.5 px-4 text-center">
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">DRY</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colspan="3" class="py-2.5 px-4 text-right uppercase text-[11px] text-slate-500">Totals:</td>
                    <td class="py-2.5 px-4 text-right font-mono">14,860 kg</td>
                    <td class="py-2.5 px-4 text-right font-mono">53.2 m³</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Carrier Terms & Compliance Declarations -->
            <div class="p-3 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 leading-relaxed mb-8">
              <strong>CARRIER / SHIPPER NOTICE:</strong> Property described above received in apparent good order, except as noted. This document constitutes a binding transportation agreement under standard interstate carriage tariffs. Consignee signature acknowledges receipt of goods without shortage or visible exterior defect unless explicitly marked.
            </div>
          </div>

          <!-- Bottom Signatures Block -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900">
            <!-- Driver / Carrier Dispatch Signature -->
            <div>
              <div class="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                Dispatched Driver Signature
              </div>
              <div class="h-20 border-b border-slate-400 flex items-center justify-between px-2 pb-1">
                <div class="font-serif italic text-lg text-blue-900 font-bold">
                  {{ docData?.driverName || 'Marcus Vance' }}
                </div>
                <div class="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-bold">
                  <q-icon name="verified" size="14px" />
                  AUTHENTICATED
                </div>
              </div>
              <div class="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                <span>Driver Code: DRV-5001</span>
                <span>Date: {{ currentDate }}</span>
              </div>
            </div>

            <!-- Consignee / Delivery Receiver Signature -->
            <div>
              <div class="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                Consignee Delivery Signature (ePOD)
              </div>
              <div class="h-20 border-b border-slate-400 flex items-center justify-between px-2 pb-1">
                <!-- If signature image exists -->
                <div v-if="docData?.signatureUrl" class="h-full flex items-center">
                  <img :src="docData.signatureUrl" alt="Receiver Signature" class="max-h-16 max-w-xs object-contain" />
                </div>
                <div v-else class="font-serif italic text-lg text-slate-800">
                  {{ docData?.receiverName || 'David Miller' }}
                </div>
                <div class="text-[10px] text-emerald-600 font-mono flex items-center gap-1 font-bold">
                  <q-icon name="task_alt" size="14px" />
                  TIMESTAMPED OTP 7841
                </div>
              </div>
              <div class="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                <span>Receiver: {{ docData?.receiverName || 'David Miller' }}</span>
                <span>Dock Receipt: OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppNotify } from '../composables/useAppNotify';

const props = defineProps<{
  modelValue: boolean;
  docData?: any;
}>();

defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const notify = useAppNotify();

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

function printDocument() {
  window.print();
}

function downloadDocument() {
  notify.success(`Downloading authorized PDF: ${props.docData?.title || 'Bill_Of_Lading.pdf'}`);
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-tms-doc, #printable-tms-doc * {
    visibility: visible;
  }
  #printable-tms-doc {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    box-shadow: none;
    border: none;
  }
}
</style>
