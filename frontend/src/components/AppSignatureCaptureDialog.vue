<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="width: 520px; max-width: 95vw;" class="tms-card overflow-hidden">
      <!-- Modal Header -->
      <div class="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white">
            <q-icon name="draw" size="18px" />
          </div>
          <div>
            <div class="text-sm font-bold">Proof of Delivery (ePOD)</div>
            <div class="text-[11px] text-slate-300 font-mono">
              Shipment: {{ shipment?.shipmentNumber || 'SHP-770101' }}
            </div>
          </div>
        </div>
        <q-btn icon="close" flat round dense color="white" v-close-popup />
      </div>

      <q-card-section class="p-5 space-y-4">
        <!-- Receiver Credentials -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Receiver Full Name *</label>
            <q-input
              v-model="form.receiverName"
              dense
              outlined
              placeholder="e.g. David Miller"
              class="bg-white"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Delivery OTP *</label>
            <q-input
              v-model="form.otp"
              dense
              outlined
              placeholder="e.g. 7841"
              maxlength="6"
              class="bg-white font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Receiver Contact / Phone</label>
          <q-input
            v-model="form.receiverContact"
            dense
            outlined
            placeholder="+1 (555) 012-3456"
            class="bg-white"
          />
        </div>

        <!-- Interactive HTML5 Signature Canvas -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <q-icon name="gesture" size="14px" color="primary" />
              Consignee Touch / Mouse Signature *
            </label>
            <button
              type="button"
              class="text-[11px] text-slate-500 hover:text-red-600 font-medium underline cursor-pointer"
              @click="clearCanvas"
            >
              Clear Canvas
            </button>
          </div>

          <div class="border-2 border-dashed border-slate-300 rounded-lg p-1 bg-slate-50 relative">
            <canvas
              ref="canvasRef"
              width="460"
              height="140"
              class="w-full h-36 bg-white rounded cursor-crosshair touch-none"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart.passive="handleTouchStart"
              @touchmove.passive="handleTouchMove"
              @touchend.passive="stopDrawing"
            ></canvas>

            <div
              v-if="!hasDrawn"
              class="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs gap-1.5"
            >
              <q-icon name="edit" size="16px" />
              <span>Sign inside box using finger or mouse</span>
            </div>
          </div>
        </div>

        <!-- Photo & Inspection Upload -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Unload Cargo Photo Proof</label>
          <div class="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <q-icon name="photo_camera" size="20px" color="primary" />
            <div class="flex-1">
              <span class="font-medium text-slate-800">cargo_unloaded_dock4.jpg</span>
              <span class="text-slate-400 block text-[10px]">Photo captured & GPS tagged</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ATTACHED
            </span>
          </div>
        </div>

        <!-- Remarks -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Driver Notes & Remarks</label>
          <q-input
            v-model="form.remarks"
            type="textarea"
            rows="2"
            dense
            outlined
            placeholder="All cargo pallets accepted in sound condition."
            class="bg-white text-xs"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <q-btn flat no-caps label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            color="positive"
            no-caps
            icon="verified"
            label="Transmit Verified ePOD"
            class="font-semibold px-4"
            :loading="submitting"
            @click="submitProofOfDelivery"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import api from '../api/client';
import { useAppNotify } from '../composables/useAppNotify';

const props = defineProps<{
  modelValue: boolean;
  shipment?: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'submitted', result: any): void;
}>();

const notify = useAppNotify();
const submitting = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const hasDrawn = ref(false);

const form = ref({
  receiverName: 'David Miller',
  receiverContact: '+1 (555) 876-5432',
  otp: '7841',
  remarks: 'All 18 cargo pallets unloaded and inspected at dock 4.',
});

function getCanvasCoords(event: MouseEvent | Touch) {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvasRef.value.width / rect.width),
    y: (event.clientY - rect.top) * (canvasRef.value.height / rect.height),
  };
}

function startDrawing(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  isDrawing.value = true;
  hasDrawn.value = true;
  const { x, y } = getCanvasCoords(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function draw(e: MouseEvent) {
  if (!isDrawing.value || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  const { x, y } = getCanvasCoords(e);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing.value = false;
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawing.value = true;
    hasDrawn.value = true;
    const { x, y } = getCanvasCoords(e.touches[0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
}

function handleTouchMove(e: TouchEvent) {
  if (!isDrawing.value || !canvasRef.value || e.touches.length === 0) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  const { x, y } = getCanvasCoords(e.touches[0]);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function clearCanvas() {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  hasDrawn.value = false;
}

async function submitProofOfDelivery() {
  if (!form.value.receiverName) {
    notify.warning('Receiver name is required');
    return;
  }
  if (!hasDrawn.value) {
    notify.warning('Please capture the receiver digital signature');
    return;
  }

  submitting.value = true;
  try {
    const signatureData = canvasRef.value?.toDataURL('image/png') || null;
    const shipmentId = props.shipment?.id;

    if (!shipmentId) {
      notify.error('No shipment selected');
      return;
    }

    const payload = {
      receiverName: form.value.receiverName,
      receiverContact: form.value.receiverContact,
      otp: form.value.otp,
      remarks: form.value.remarks,
      signatureData,
      photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    };

    const res = await api.post(`/api/v1/shipments/${shipmentId}/pod`, payload);
    notify.success('ePOD verified and transmitted! Shipment marked DELIVERED.');
    emit('update:modelValue', false);
    emit('submitted', res.data || res);
  } catch (err: any) {
    notify.error(err?.response?.data?.message || 'Failed to submit Proof of Delivery');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  nextTick(() => {
    clearCanvas();
  });
});
</script>
