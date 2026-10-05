<template>
  <DeskModal
    :model-value="modelValue"
    :title="isEditing ? 'EDIT VEHICLE MASTER' : 'ADD VEHICLE MASTER'"
    :subtitle="isEditing ? form.regNo : 'TALLY FAST ENTRY'"
    width="680px"
    @update:model-value="emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <DeskForm ref="deskFormRef" @submit="handleSubmit" @cancel="handleClose">
      <!-- Top Action Bar / Helper -->
      <div class="desk-form-topbar">
        <div class="desk-topbar-info">
          <span class="desk-topbar-tag font-mono">
            {{ isEditing ? 'MODIFYING ASSET' : 'NEW REGISTRATION' }}
          </span>
          <span class="desk-topbar-instruction">
            Use <strong>[Enter]</strong> to advance, <strong>[Shift+Enter]</strong> to go back, <strong>[Ctrl+A]</strong> to save.
          </span>
        </div>
        <div class="desk-topbar-actions">
          <button
            type="button"
            class="desk-btn-save-top"
            @click="handleSubmit"
          >
            <span class="key-underline">S</span>ave (Ctrl+A)
          </button>
        </div>
      </div>

      <!-- SECTION 1: IDENTITY & REGISTRATION -->
      <div class="desk-section-heading">
        <span class="desk-section-num">01</span>
        <span class="desk-section-title">IDENTITY & REGISTRATION</span>
        <div class="desk-section-line"></div>
      </div>

      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-sm-6">
          <DeskInput
            ref="regNoInputRef"
            v-model="form.regNo"
            label="Registration No"
            required
            uppercase
            placeholder="GJ-01-AB-1234"
            :error="errors.regNo"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskSelect
            v-model="form.type"
            label="Vehicle Type"
            required
            :options="vehicleTypeOptions"
            placeholder="Select Type..."
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskInput
            v-model="form.make"
            label="Make / Manufacturer"
            required
            placeholder="Tata / Ashok Leyland / Mahindra"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskInput
            v-model="form.model"
            label="Model"
            required
            placeholder="Prima 4928.S / Dost+ / Signa"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskSelect
            v-model="form.owner"
            label="Ownership Type"
            required
            :options="['Owned', 'Attached', 'Market']"
            placeholder="Select Ownership..."
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskSelect
            v-model="form.status"
            label="Operating Status"
            required
            :options="['Active', 'Maintenance', 'Idle']"
            placeholder="Select Status..."
          />
        </div>
      </div>

      <!-- SECTION 2: SPECIFICATIONS & TELEMATICS -->
      <div class="desk-section-heading q-mt-md">
        <span class="desk-section-num">02</span>
        <span class="desk-section-title">SPECIFICATIONS & TELEMATICS</span>
        <div class="desk-section-line"></div>
      </div>

      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-sm-4">
          <DeskInput
            v-model="form.capacity"
            label="Capacity (Payload)"
            placeholder="16 MT"
          />
        </div>
        <div class="col-12 col-sm-4">
          <DeskInput
            v-model="form.mfgYear"
            label="Mfg Year"
            placeholder="2022"
            type="number"
          />
        </div>
        <div class="col-12 col-sm-4">
          <DeskInput
            v-model="form.targetKmpl"
            label="Target Mileage"
            placeholder="5.5"
            suffix="KM/L"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskInput
            v-model="form.chassisNo"
            label="Chassis Number (VIN)"
            uppercase
            placeholder="MAT445183MCA12345"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskInput
            v-model="form.engineNo"
            label="Engine Number"
            uppercase
            placeholder="ENG4928AB2134"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskInput
            v-model="form.gpsId"
            label="GPS Tracker ID"
            placeholder="GPS-001"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskInput
            v-model="form.fastagId"
            label="FASTag Barcode ID"
            placeholder="FT-GJ-1122"
          />
        </div>
      </div>

      <!-- SECTION 3: STATUTORY & COMPLIANCE EXPIRIES -->
      <div class="desk-section-heading q-mt-md">
        <span class="desk-section-num">03</span>
        <span class="desk-section-title">STATUTORY & COMPLIANCE DATES</span>
        <div class="desk-section-line"></div>
      </div>

      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-sm-6">
          <DeskDate
            v-model="form.fitness"
            label="Fitness Certificate Expiry"
            required
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskDate
            v-model="form.insurance"
            label="Insurance Expiry Date"
            required
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskDate
            v-model="form.puc"
            label="PUC Certificate Expiry"
            required
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskDate
            v-model="form.rcExpiry"
            label="RC Registration Expiry"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskDate
            v-model="form.permitExpiry"
            label="Permit Expiry (National/State)"
          />
        </div>
        <div class="col-12 col-sm-6">
          <DeskDate
            v-model="form.roadTaxExpiry"
            label="Road Tax Validity"
          />
        </div>
      </div>

      <!-- Bottom Manual Action Row -->
      <div class="desk-form-bottom-actions q-mt-lg q-mb-sm">
        <button
          type="button"
          class="desk-btn-bottom-cancel"
          @click="handleClose"
        >
          Cancel [Esc]
        </button>
        <button
          type="submit"
          class="desk-btn-bottom-save"
        >
          Accept & Save [Ctrl+A]
        </button>
      </div>
    </DeskForm>
  </DeskModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import DeskModal from '../components/DeskModal.vue';
import DeskForm from '../components/DeskForm.vue';
import DeskInput from '../components/DeskInput.vue';
import DeskSelect from '../components/DeskSelect.vue';
import DeskDate from '../components/DeskDate.vue';

const props = defineProps<{
  modelValue: boolean;
  vehicle?: any | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'save', payload: any): void;
  (e: 'close'): void;
}>();

const deskFormRef = ref<any>(null);
const regNoInputRef = ref<any>(null);

const isEditing = computed(() => !!props.vehicle?.id);

const vehicleTypeOptions = [
  'HCV',
  'LCV',
  'Trailer',
  'Container',
  'Tanker',
  'Bus',
  'Dumper',
];

interface FormState {
  id?: string;
  regNo: string;
  make: string;
  model: string;
  type: string;
  owner: string;
  capacity: string;
  mfgYear: string;
  targetKmpl: string;
  chassisNo: string;
  engineNo: string;
  gpsId: string;
  fastagId: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  fitness: string;
  insurance: string;
  puc: string;
  rcExpiry: string;
  permitExpiry: string;
  roadTaxExpiry: string;
}

const defaultForm: FormState = {
  regNo: '',
  make: 'Tata',
  model: 'Prima 4928.S',
  type: 'HCV',
  owner: 'Owned',
  capacity: '16 MT',
  mfgYear: '2022',
  targetKmpl: '5.5',
  chassisNo: '',
  engineNo: '',
  gpsId: '',
  fastagId: '',
  status: 'Active',
  fitness: '2026-01-18',
  insurance: '2026-03-10',
  puc: '2025-03-10',
  rcExpiry: '2031-01-18',
  permitExpiry: '2026-06-01',
  roadTaxExpiry: '2030-01-01',
};

const form = ref<FormState>({ ...defaultForm });
const errors = ref<Record<string, string>>({});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errors.value = {};
      if (props.vehicle) {
        const v = props.vehicle;
        const parts = (v.makeModel || '').split(' ');
        const make = v.make || (parts.length > 0 ? parts[0] : 'Tata');
        const model = v.model || (parts.length > 1 ? parts.slice(1).join(' ') : 'Prima 4928.S');

        form.value = {
          id: v.id,
          regNo: v.regNo || v.vehicleNumber || '',
          make,
          model,
          type: v.type || v.vehicleTypeStr || 'HCV',
          owner: v.owner || 'Owned',
          capacity: v.capacity || '16 MT',
          mfgYear: v.mfgYear || '2022',
          targetKmpl: v.targetKmpl || '5.5',
          chassisNo: v.chassisNo || '',
          engineNo: v.engineNo || '',
          gpsId: v.gpsId || '',
          fastagId: v.fastagId || '',
          status: v.status || 'Active',
          fitness: v.fitness || '2026-01-18',
          insurance: v.insurance || '2026-03-10',
          puc: v.puc || '2025-03-10',
          rcExpiry: v.rcExpiry || '2031-01-18',
          permitExpiry: v.permitExpiry || '2026-06-01',
          roadTaxExpiry: v.roadTaxExpiry || '2030-01-01',
        };
      } else {
        form.value = { ...defaultForm };
      }

      nextTick(() => {
        regNoInputRef.value?.focus();
      });
    }
  },
  { immediate: true }
);

function handleSubmit() {
  errors.value = {};

  if (!form.value.regNo || !form.value.regNo.trim()) {
    errors.value.regNo = 'Registration number is required';
    regNoInputRef.value?.focus();
    return;
  }

  const makeModel = `${form.value.make} ${form.value.model}`.trim();
  const payload = {
    ...form.value,
    regNo: form.value.regNo.trim().toUpperCase(),
    makeModel,
    vehicleNumber: form.value.regNo.trim().toUpperCase(),
    vehicleTypeStr: form.value.type,
  };

  emit('save', payload);
  emit('update:modelValue', false);
}

function handleClose() {
  emit('update:modelValue', false);
  emit('close');
}
</script>

<style scoped>
.desk-form-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 14px;
}

.desk-topbar-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.desk-topbar-tag {
  background: #0284c7;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.desk-topbar-instruction {
  font-size: 0.74rem;
  color: #64748b;
}

.desk-topbar-instruction strong {
  color: #0284c7;
}

.desk-btn-save-top {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.desk-btn-save-top:hover {
  background: #0369a1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.key-underline {
  text-decoration: underline;
}

.desk-section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  margin-top: 8px;
}

.desk-section-num {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 900;
  color: #0284c7;
  background: #e0f2fe;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #bae6fd;
}

.desk-section-title {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.06em;
}

.desk-section-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.desk-form-bottom-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #cbd5e1;
}

.desk-btn-bottom-cancel {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.desk-btn-bottom-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.desk-btn-bottom-save {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.desk-btn-bottom-save:hover {
  background: #0369a1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
