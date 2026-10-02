# Tally-Style Fast Keyboard Entry: Implementation & Architecture Plan

## 1. Objective
Provide **100% hands-on-keyboard data entry** (like Tally Prime / ERP) on the **Vehicle Master** form while keeping the exact original UI design intact.

---

## 2. Keyboard Shortcuts Summary

| Shortcut Key | Action |
|---|---|
| **Alt + C** / **Insert** | Open Add Vehicle drawer from the page |
| **Enter** | Move to next input field |
| **Enter (on Dropdown)** | If closed: opens list with **1st option highlighted**.<br>If open: selects highlighted option and **jumps to next field**. |
| **↓ / ↑ (Arrow Keys)** | Move highlight up / down inside dropdown options |
| **Space** / **Alt + ↓** | Open dropdown list |
| **Shift + Enter** | Move back to previous field |
| **Ctrl + A** / **Alt + S** | Instant Save from any field |
| **Enter (on last field)** | Automatically submit & save on completion |
| **Escape (Esc)** | Close dropdown (if open) or close drawer / cancel |

---

## 3. Keyboard Operator Flow

```
[Alt + C] (From Vehicle Master List)
   │
   ▼
[Field 01] REGISTRATION NO (Input)
   ├─ Type 'gj01ab1234' ➔ Automatically converts to 'GJ01AB1234'
   └─ Press [Enter] ────────────────────────────────────────────────────────┐
                                                                           ▼
[Field 02] VEHICLE TYPE (Dropdown)
   ├─ Press [Enter] ➔ List opens with 'HCV' (1st option) highlighted
   ├─ Press [Enter] ➔ Confirms 'HCV' & cursor jumps to 'MAKE'
   └─ (Or press [↓] then [Enter] to choose 'Trailer') ──────────────────────┐
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
[Field 14] RC EXPIRY (Date) ➔ Press [Enter]                                │
[Field 15] FITNESS EXPIRY (Date) ➔ Press [Enter]                           │
[Field 16] INSURANCE EXPIRY (Date) ➔ Press [Enter]                         │
[Field 17] PUC EXPIRY (Date) ➔ Press [Enter]                               │
[Field 18] NATIONAL PERMIT EXPIRY (Date) ➔ Press [Enter]                   │
                                                                           │
                                                                           ▼
[Field 19] ROAD TAX EXPIRY (Final Field)
   └─ Press [Enter]
          │
          ▼
   RECORD SAVED TO DATABASE & LOCAL STORAGE!
   Drawer closes automatically.
```

---

## 4. Modified & Created Files

1. **[PLAN.md](file:///d:/Transport%20Management%20System/PLAN.md)**: Main workspace plan and documentation.
2. **[DeskCombo.vue](file:///d:/Transport%20Management%20System/frontend/src/framework/form/DeskCombo.vue)**:
   - Added `getInitialTargetIndex()` to skip placeholder (`'— Select —'`) and highlight the first real option (`'HCV'`, `'Owned'`).
   - `Enter` opens dropdown when closed, and confirms + advances to next input when open.
   - Prevents dropdown from repeatedly re-opening.
3. **[useDeskFocus.ts](file:///d:/Transport%20Management%20System/frontend/src/framework/focus/useDeskFocus.ts)**:
   - Added `getFormInputs()` for discovering all active inputs inside visible Quasar `.q-field` wrappers.
   - Added `focusNextInput()` and `focusPreviousInput()` for seamless traversal.
4. **[DeskForm.vue](file:///d:/Transport%20Management%20System/frontend/src/framework/form/DeskForm.vue)**:
   - Form-wide `Enter`, `Shift + Enter`, `Ctrl + A`, `Alt + S`, and `Escape` handlers.
5. **[FleetPage.vue](file:///d:/Transport%20Management%20System/frontend/src/pages/fleet/FleetPage.vue)**:
   - Exact original UI layout preserved (`DeskDialog`, 540px right drawer, sections, inputs).
   - Auto-focus on Registration No upon drawer open.
   - Auto-uppercase transformation for Registration No, Chassis No, Engine No.
   - `Alt + C` / `Insert` hotkey to launch form from the page.
