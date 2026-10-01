<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" maximized transition-show="slide-up" transition-hide="slide-down">
    <div class="bg-slate-900/95 w-full h-full flex flex-col justify-between overflow-hidden">
      <!-- Top Action Bar -->
      <div class="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between z-10 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
            <q-icon name="receipt_long" size="20px" />
          </div>
          <div>
            <div class="text-sm font-bold text-white flex items-center gap-2">
              <span>Freight Billing Tax Invoice</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                OFFICIAL TAX INVOICE
              </span>
            </div>
            <div class="text-xs text-slate-400 font-mono">
              Invoice: {{ invoice?.invoiceNumber || 'INV-2026-001' }} • Status: {{ invoice?.status || 'PENDING' }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <q-btn
            outline
            dense
            color="white"
            icon="print"
            label="Print"
            no-caps
            size="sm"
            class="px-3"
            @click="printInvoice"
          />
          <q-btn
            color="positive"
            dense
            icon="download"
            label="Download Invoice PDF"
            no-caps
            size="sm"
            class="px-3 text-weight-bold"
            @click="downloadInvoicePdf"
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

      <!-- Printable Invoice Canvas Area -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-900/60">
        <!-- Printable White Sheet Paper Container -->
        <div
          id="printable-tms-invoice"
          class="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-8 sm:p-12 text-slate-800 font-sans border border-slate-200"
          style="min-height: 1050px;"
        >
          <!-- Header: Brand + Invoice Title -->
          <div class="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
                  ▲
                </div>
                <span class="text-2xl font-black tracking-tight text-slate-900">APEX GLOBAL TMS</span>
              </div>
              <p class="text-xs text-slate-500 font-mono uppercase tracking-wider">Enterprise Freight & Logistics Network</p>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                400 Logistics Parkway, Suite 1200<br />
                Chicago, IL 60601, United States<br />
                Tax ID / EIN: 36-9812490 • contact@apexlogistics.com
              </p>
            </div>

            <div class="text-right">
              <span class="inline-block px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider mb-2"
                :class="invoice?.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'"
              >
                {{ invoice?.status || 'PENDING' }}
              </span>
              <h1 class="text-3xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
              <p class="text-sm font-mono font-bold text-blue-600 mt-1">{{ invoice?.invoiceNumber || 'INV-2026-001' }}</p>
              <div class="text-xs text-slate-500 mt-2 space-y-0.5 font-mono">
                <div>Issue Date: <strong>{{ invoiceDate }}</strong></div>
                <div>Payment Due: <strong>{{ dueDate }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Bill To / Consignee & Shipment Info -->
          <div class="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-200 text-xs">
            <div>
              <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">BILLED TO (CUSTOMER / SHIPPER):</h3>
              <p class="text-sm font-bold text-slate-900 mb-1">{{ invoice?.customer?.companyName || 'Acme Retail Supply Corp' }}</p>
              <p class="text-slate-600 leading-relaxed">
                Account ID: {{ invoice?.customerId || 'CUST-8821' }}<br />
                {{ invoice?.customer?.billingAddress || '742 Evergreen Terrace, Logistics Park' }}<br />
                Dallas, TX 75201, United States<br />
                Billing Contact: accounts-payable@acmeretail.com
              </p>
            </div>

            <div>
              <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">SHIPMENT & FREIGHT DETAILS:</h3>
              <div class="space-y-1.5 font-mono">
                <div class="flex justify-between">
                  <span class="text-slate-500">Consignment / BOL #:</span>
                  <span class="font-bold text-slate-900">{{ invoice?.shipment?.shipmentNumber || 'LR-89104' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Freight Corridor:</span>
                  <span class="font-bold text-slate-900">Chicago Central Hub → Dallas Terminal</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Gross Weight / Volume:</span>
                  <span class="font-bold text-slate-900">14,500 kg • 52.0 m³</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Carrier / Unit:</span>
                  <span class="font-bold text-slate-900">Apex Dedicated Fleet • TRK-101</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Linehaul Invoice Items Table -->
          <div class="mb-8">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b-2 border-slate-900 font-mono text-[11px] text-slate-600 uppercase">
                  <th class="py-2.5 font-bold">Item Description</th>
                  <th class="py-2.5 text-center font-bold">Qty / Miles</th>
                  <th class="py-2.5 text-right font-bold">Rate</th>
                  <th class="py-2.5 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono">
                <tr>
                  <td class="py-3">
                    <div class="font-sans font-bold text-slate-900">FTL Interstate Linehaul Transportation</div>
                    <div class="text-[11px] text-slate-500 font-sans">Full truckload freight Chicago Central Hub (IL) to Dallas Terminal (TX)</div>
                  </td>
                  <td class="py-3 text-center">920 mi</td>
                  <td class="py-3 text-right">${{ baseRate.toFixed(2) }}</td>
                  <td class="py-3 text-right font-bold text-slate-900">${{ linehaulAmount.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="py-3">
                    <div class="font-sans font-bold text-slate-900">Standard Fuel Surcharge (FSC)</div>
                    <div class="text-[11px] text-slate-500 font-sans">DOE National Average Index Fuel Adjustment (12.5%)</div>
                  </td>
                  <td class="py-3 text-center">12.5%</td>
                  <td class="py-3 text-right">-</td>
                  <td class="py-3 text-right font-bold text-slate-900">${{ fuelSurcharge.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="py-3">
                    <div class="font-sans font-bold text-slate-900">Terminal Handling & Dock Loading</div>
                    <div class="text-[11px] text-slate-500 font-sans">Cross-dock pallet staging and mechanized forklift loading</div>
                  </td>
                  <td class="py-3 text-center">18 Pallets</td>
                  <td class="py-3 text-right">$8.00</td>
                  <td class="py-3 text-right font-bold text-slate-900">$144.00</td>
                </tr>
                <tr>
                  <td class="py-3">
                    <div class="font-sans font-bold text-slate-900">Electronic Proof of Delivery (ePOD) Certification</div>
                    <div class="text-[11px] text-slate-500 font-sans">Digital signature verification and EDI status transmission</div>
                  </td>
                  <td class="py-3 text-center">1 Transit</td>
                  <td class="py-3 text-right">$0.00</td>
                  <td class="py-3 text-right font-bold text-slate-900">$0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Calculation Breakdown -->
          <div class="flex justify-end mb-8">
            <div class="w-72 space-y-2 text-xs font-mono">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span class="font-semibold">${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Applicable State Freight Tax (5%):</span>
                <span class="font-semibold">${{ taxAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-slate-900 text-sm font-bold pt-2 border-t-2 border-slate-900">
                <span>Total Amount Due:</span>
                <span class="text-blue-600 font-black text-base">${{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Remittance Banking Details & Footer -->
          <div class="border-t border-slate-200 pt-6 mt-6 grid grid-cols-2 gap-6 text-xs text-slate-500">
            <div>
              <h4 class="font-mono font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">PAYMENT INSTRUCTIONS (ACH / WIRE):</h4>
              <p class="font-mono leading-relaxed">
                Bank: JPMorgan Chase Bank, N.A.<br />
                Routing (ABA): 021000021<br />
                Account #: 883920194821<br />
                Beneficiary: Apex Global TMS Inc.
              </p>
            </div>
            <div class="text-right">
              <h4 class="font-mono font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">TERMS & CERTIFICATION:</h4>
              <p class="leading-relaxed">
                Payment due within 30 days of invoice date. Late payments subject to 1.5% monthly financing charge. Certified authentic document generated by Enterprise TMS Engine.
              </p>
            </div>
          </div>

          <div class="text-center text-[10px] text-slate-400 font-mono mt-10 pt-4 border-t border-slate-100">
            Page 1 of 1 • Apex Global Logistics Inc. • Generated on {{ currentDate }}
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
  invoice?: any;
}>();

defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const notify = useAppNotify();

const totalAmount = computed(() => Number(props.invoice?.totalAmount || 2850));
const subtotal = computed(() => totalAmount.value / 1.05);
const taxAmount = computed(() => totalAmount.value - subtotal.value);
const linehaulAmount = computed(() => Math.max(0, subtotal.value - 144 - (subtotal.value * 0.11)));
const baseRate = computed(() => linehaulAmount.value / 920);
const fuelSurcharge = computed(() => Math.max(0, subtotal.value - linehaulAmount.value - 144));

const invoiceDate = computed(() => {
  if (props.invoice?.createdAt) return new Date(props.invoice.createdAt).toLocaleDateString('en-US');
  return new Date().toLocaleDateString('en-US');
});

const dueDate = computed(() => {
  if (props.invoice?.dueDate) return new Date(props.invoice.dueDate).toLocaleDateString('en-US');
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toLocaleDateString('en-US');
});

const currentDate = computed(() => {
  return new Date().toLocaleString('en-US');
});

function printInvoice() {
  window.print();
}

function downloadInvoicePdf() {
  const invoiceNum = props.invoice?.invoiceNumber || 'INV-2026-001';
  const customer = props.invoice?.customer?.companyName || 'Acme Retail';
  const element = document.getElementById('printable-tms-invoice');
  if (!element) {
    window.print();
    return;
  }

  // Create clean printable HTML window that automatically triggers PDF save/print
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice_${invoiceNum}.pdf</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { border-bottom: 2px solid #0f172a; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; font-family: monospace; }
            td { border-bottom: 1px solid #f1f5f9; padding: 10px 8px; font-size: 12px; }
            .total-box { margin-top: 20px; float: right; width: 280px; font-family: monospace; font-size: 12px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .grand-total { border-top: 2px solid #0f172a; padding-top: 6px; font-size: 15px; font-weight: bold; color: #2563eb; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 1500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    notify.success(`Generated official PDF invoice for ${invoiceNum}`);
  } else {
    window.print();
  }
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-tms-invoice, #printable-tms-invoice * {
    visibility: visible;
  }
  #printable-tms-invoice {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 24px;
    box-shadow: none;
    border: none;
  }
}
</style>
