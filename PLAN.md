# Vehicle Master: Tally-Style Fast Keyboard Entry Plan & Architecture

## 1. Executive Summary
This document outlines the complete plan, keyboard navigation matrix, architecture, and file structure implemented for the **Vehicle Master** module in the Transport Management System (TMS).

The goal is to provide a **100% hands-on-keyboard data entry experience** inspired by Tally Prime / ERP, without altering the existing visual user interface (UI) design.

---

## 2. Keyboard Navigation Matrix

| Shortcut Key | Action | Behavior & Details |
|---|---|---|
| **Alt + C** / **Insert** | Open Add Vehicle Form | Triggers from anywhere on the Fleet / Vehicle Master page. Automatically sets cursor focus to the first input field (`Registration No`). |
| **Enter** | Advance to Next Field | Moves smoothly forward from input to input without jumping to non-input buttons or icons. |
| **Enter (on Dropdown)** | 1. Open list (if closed)<br>2. Select & Advance (if open) | - If the dropdown is closed, pressing `Enter` opens the options list with the **1st real option already highlighted**.<br>- Pressing `Enter` again selects that highlighted option and **immediately advances to the next field**. |
| **↓ / ↑ (Arrow Keys)** | Navigate Dropdown Options | Moves the active highlight up or down in the dropdown menu. |
| **Space** / **Alt + ↓** | Open Dropdown Menu | Alternate keyboard trigger to open dropdowns. |
| **Shift + Enter** | Move to Previous Field | Steps backward to the previous input field so operators can fix mistakes without using a mouse. |
| **Ctrl + A** / **Alt + S** | Instant Save / Accept | Submits and saves the entire vehicle record immediately from any field at any stage. |
| **Enter (on Final Field)** | Submit / Save on Completion | Pressing `Enter` on the 19th field (*Road Tax Expiry*) automatically submits and saves the record to the database. |
| **Escape (Esc)** | Close / Cancel | Closes the open dropdown menu (if open) or cancels and closes the drawer without saving. |

---

## 3. Step-by-Step Operator Flow

```
[Alt + C] (From Vehicle Master List)
   │
   ▼
[Field 01] REGISTRATION NO
   ├─ Type registration number (e.g. 'gj01ab1234')
   ├─ Automatically converts to uppercase: 'GJ01AB1234'
   └─ Press [Enter] ────────────────────────────────────────────────────────┐
                                                                           ▼
[Field 02] VEHICLE TYPE (Dropdown)
   ├─ Press [Enter] (Dropdown opens, 1st option 'HCV' is pre-selected)
   ├─ Option A: Keep 'HCV' ➔ Press [Enter] (Confirms 'HCV' & advances)
   ├─ Option B: Choose 'Trailer' ➔ Press [↓] ➔ Press [Enter]
   └─ Cursor jumps to next field ──────────────────────────────────────────┐
                                                                           ▼
[Field 03] MAKE (Input) ➔ Type 'Tata' ➔ Press [Enter]                      │
[Field 04] MODEL (Input) ➔ Type 'Prima 4928.S' ➔ Press [Enter]             │
[Field 05] OWNERSHIP (Dropdown) ➔ Press [Enter] [Enter] (Picks 'Owned')     │
[Field 06] YEAR OF MFG (Input) ➔ Type '2022' ➔ Press [Enter]               │
[Field 07] CAPACITY (MT) (Input) ➔ Type '16 MT' ➔ Press [Enter]            │
[Field 08] TARGET KM/L (Input) ➔ Type '5.5' ➔ Press [Enter]                │
[Field 09] CHASSIS NO (Input) ➔ Type VIN ➔ Press [Enter]                   │
[Field 10] ENGINE NO (Input) ➔ Type Engine No ➔ Press [Enter]              │
[Field 11] GPS DEVICE ID (Input) ➔ Type GPS ID ➔ Press [Enter]             │
[Field 12] FASTAG ID (Input) ➔ Type FASTag ID ➔ Press [Enter]              │
[Field 13] STATUS (Dropdown) ➔ Press [Enter] [Enter] (Picks 'Active')      │
[Field 14] RC EXPIRY (Date) ➔ Set Date ➔ Press [Enter]                     │
[Field 15] FITNESS EXPIRY (Date) ➔ Set Date ➔ Press [Enter]                │
[Field 16] INSURANCE EXPIRY (Date) ➔ Set Date ➔ Press [Enter]              │
[Field 17] PUC EXPIRY (Date) ➔ Set Date ➔ Press [Enter]                    │
[Field 18] NATIONAL PERMIT EXPIRY (Date) ➔ Set Date ➔ Press [Enter]        │
                                                                           │
                                                                           ▼
[Field 19] ROAD TAX EXPIRY (Final Field)
   └─ Press [Enter]
          │
          ▼
   RECORD SAVED TO DATABASE & LOCAL STORAGE!
   Drawer closes automatically. Table refreshes with new record.
```

---

## 4. Code Architecture & Component Breakdown

### 1. `frontend/src/framework/form/DeskCombo.vue`
- **Purpose**: Keyboard-first dropdown component wrapper around Quasar's `q-select`.
- **Key Enhancements**:
  - `getInitialTargetIndex()`: Evaluates options list and pre-selects the first meaningful option (skips placeholder `'— Select —'`).
  - `@popup-show`: Automatically focuses and highlights the initial option in the popup menu with visual indicator `.desk-option-active`.
  - `@keydown.capture`:
    - When closed: `Enter` opens the dropdown with the pre-selected option.
    - When open: `Enter` confirms the option, closes the dropdown, and advances focus to the next input field.
  - Prevents the dropdown from repeatedly re-opening after value selection.

### 2. `frontend/src/framework/focus/useDeskFocus.ts`
- **Purpose**: Core focus traversal engine for forms and dialogs.
- **Key Enhancements**:
  - `getFormInputs()`: Discovers all active inputs inside visible Quasar `.q-field` wrappers, native inputs, date inputs, and select elements in exact DOM order.
  - `focusNextInput()`: Traverses forward to the next input field. Returns `false` when on the final field so forms can trigger submit.
  - `focusPreviousInput()`: Traverses backward to the previous input field on `Shift + Enter`.

### 3. `frontend/src/framework/form/DeskForm.vue`
- **Purpose**: Master form wrapper providing keyboard shortcuts and lifecycle management.
- **Key Enhancements**:
  - Intercepts `Enter` to advance inputs or submit on the last field.
  - Intercepts `Shift + Enter` to move focus backward.
  - Intercepts `Ctrl + A`, `Alt + S`, and `Ctrl + S` to save immediately from any field.
  - Intercepts `Escape` to close the drawer.

### 4. `frontend/src/pages/fleet/FleetPage.vue`
- **Purpose**: Main Vehicle Master view and entry drawer.
- **Key Enhancements**:
  - Retains the exact original 540px right-side drawer layout (`DeskDialog`), section headers (`IDENTITY`, `DOCUMENTS — EXPIRY DATES`), and styling.
  - Automatically focuses `REGISTRATION NO` upon opening.
  - Auto-transforms input to uppercase (`toUpperCase()`) for registration, chassis, and engine numbers.
  - Global `keydown` listener for `Alt + C` and `Insert` to launch the Add Vehicle form.
  - Seamless persistence to backend REST API (`/api/v1/vehicles`) and local storage fallback.

### 5. `frontend/src/desk/`
- **Purpose**: Dedicated module for future desktop/Tally-style components.
- **Contents**:
  - `useDeskKeyboard.ts`: Composable for registering fields and custom keyboard events.
  - `DeskInput.vue`: Specialized standalone input with active focus glows and formatting.
  - `DeskSelect.vue`: Custom keyboard-driven dropdown alternative.
  - `DeskDate.vue`: Fast date input with F2 shortcut.
  - `DeskAcceptPrompt.vue`: Tally-style "Accept? Yes / No" dialog.
  - `DeskKeyStrip.vue`: Status bar displaying keyboard shortcut legends.
  - `VehicleMasterDeskModal.vue`: Modular version of the Vehicle Master entry screen.

---

## 5. Testing & Validation

1. **Open Modal**: Press `Alt + C` from the Fleet page. The drawer slides in from the right, and the cursor immediately focuses on `REGISTRATION NO`.
2. **Auto-Uppercase**: Typing lowercase `gj01` immediately renders as uppercase `GJ01`.
3. **Dropdown Selection**: Press `Enter` on `Vehicle Type`. The dropdown opens with `HCV` highlighted. Press `Enter` again. `HCV` is selected, and focus immediately jumps to `Make`.
4. **Backward Navigation**: From `Make`, press `Shift + Enter`. Focus jumps back to `Vehicle Type`.
5. **Instant Save**: Press `Ctrl + A` or `Alt + S` at any point. The vehicle is validated and saved to the database.
6. **Final Submit**: Navigating to `Road Tax Expiry` and pressing `Enter` submits the form and closes the drawer.
