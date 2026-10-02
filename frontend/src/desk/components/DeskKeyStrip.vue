<template>
  <div class="desk-key-strip">
    <div class="desk-key-strip-left">
      <span class="desk-key-badge"><kbd>↵ Enter</kbd> Next</span>
      <span class="desk-key-badge"><kbd>Shift+↵</kbd> Back</span>
      <span class="desk-key-badge"><kbd>Ctrl+A</kbd> Save</span>
      <span class="desk-key-badge"><kbd>Esc</kbd> Close</span>
      <span class="desk-key-badge"><kbd>F2</kbd> Date</span>
      <span class="desk-key-badge"><kbd>Space</kbd> Select</span>
    </div>
    <div class="desk-key-strip-right">
      <span class="desk-brand-tag">TALLY DESK &bull; FAST ENTRY</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stateless bottom keyboard shortcuts toolbar
</script>

<style scoped>
.desk-key-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #060b14;
  border-top: 1px solid rgba(0, 242, 254, 0.2);
  padding: 6px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  color: #94a3b8;
  user-select: none;
}

.desk-key-strip-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.desk-key-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #cbd5e1;
}

.desk-key-badge kbd {
  background: #111e33;
  border: 1px solid #0284c7;
  color: #38bdf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.desk-key-strip-right {
  display: flex;
  align-items: center;
}

.desk-brand-tag {
  color: #00f2fe;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 0.65rem;
  opacity: 0.85;
}
</style>
