<template>
  <div class="desk-key-strip">
    <div class="desk-key-strip-left">
      <span class="desk-key-badge cursor-pointer" title="Advance to next input field" @click="triggerAction('enter')">
        <kbd>↵ Enter</kbd> Next
      </span>
      <span class="desk-key-badge cursor-pointer" title="Move to previous field" @click="triggerAction('shift-enter')">
        <kbd>Shift+↵</kbd> Back
      </span>
      <span class="desk-key-badge cursor-pointer highlight" title="Create New Voucher / Record (Alt+C or Ctrl+A)" @click="triggerAction('alt-c')">
        <kbd>Alt+C / Ctrl+A</kbd> New
      </span>
      <span class="desk-key-badge cursor-pointer highlight-save" title="Save / Accept current form (Ctrl+A)" @click="triggerAction('ctrl-a')">
        <kbd>Ctrl+A</kbd> Accept
      </span>
      <span class="desk-key-badge cursor-pointer" title="Change Operational / Voucher Date (F2)" @click="triggerAction('f2')">
        <kbd>F2</kbd> Date
      </span>
      <span class="desk-key-badge cursor-pointer" title="Switch Company / Tenant (F3)" @click="triggerAction('f3')">
        <kbd>F3</kbd> Company
      </span>
      <span class="desk-key-badge cursor-pointer" title="Filter / Search in active table (Alt+F)" @click="triggerAction('alt-f')">
        <kbd>Alt+F</kbd> Filter
      </span>
      <span class="desk-key-badge cursor-pointer" title="Quick Command Palette (Ctrl+K)" @click="triggerAction('ctrl-k')">
        <kbd>Ctrl+K</kbd> Palette
      </span>
      <span class="desk-key-badge cursor-pointer" title="Close dialog / Back (Esc)" @click="triggerAction('esc')">
        <kbd>Esc</kbd> Quit
      </span>
    </div>
    <div class="desk-key-strip-right">
      <span class="desk-brand-tag">⚡ TALLY DESK &bull; KEYBOARD WORKBENCH</span>
    </div>
  </div>
</template>

<script setup lang="ts">
function triggerAction(action: string) {
  switch (action) {
    case 'alt-c':
      window.dispatchEvent(new CustomEvent('desk:new-record'));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', altKey: true, bubbles: true }));
      break;
    case 'ctrl-a':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
      break;
    case 'f2':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
      break;
    case 'f3':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F3', bubbles: true }));
      break;
    case 'alt-f':
      window.dispatchEvent(new CustomEvent('desk:focus-search'));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', altKey: true, bubbles: true }));
      break;
    case 'ctrl-k':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      break;
    case 'esc':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      break;
    case 'enter':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      break;
    case 'shift-enter':
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
      break;
  }
}
</script>

<style scoped>
.desk-key-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f5f9;
  border-top: 1px solid #cbd5e1;
  padding: 5px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  color: #475569;
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
  color: #334155;
  transition: all 0.12s ease;
}

.desk-key-badge:hover {
  color: #0284c7;
}

.desk-key-badge:hover kbd {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.4);
}

.desk-key-badge.highlight kbd {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0284c7;
}

.desk-key-badge.highlight-save kbd {
  background: #dcfce7;
  border-color: #16a34a;
  color: #15803d;
}

.desk-key-badge kbd {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0369a1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.12s ease;
}

.desk-key-strip-right {
  display: flex;
  align-items: center;
}

.desk-brand-tag {
  color: #0284c7;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 0.65rem;
}
</style>
