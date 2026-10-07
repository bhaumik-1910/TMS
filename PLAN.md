# 🎹 Enterprise TMS - Comprehensive Tally-Style Keyboard Navigation Plan (`plan.md`)

## 1. Executive Summary & Vision

This plan establishes a **100% keyboard-first, zero-mouse operational experience** modeled after **Tally Prime / ERP 9** for the Transport Management System (TMS). 

Every action, menu, screen transition, table row, and form input can be navigated at lightning speed using:
- **Arrow Keys (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>←</kbd>, <kbd>→</kbd>)**: Move seamlessly between table rows, menu items, tabs, and grid cells.
- **Mnemonic Accelerator Hotkeys (<kbd>Alt+Letter</kbd> & Single Letters)**: Jump instantly to any module with distinct, non-overlapping keys.
- **Function Keys (<kbd>F1</kbd>–<kbd>F12</kbd> & <kbd>Ctrl+F...</kbd> / <kbd>Alt+F...</kbd>)**: Standardized voucher and workflow hotkeys matching traditional Indian transport accounting workflows.
- **Universal Flow Keys**:
  - <kbd>Enter</kbd>: Select, Open record, or advance to next input field.
  - <kbd>Esc</kbd>: Go back, dismiss modal/drawer, or exit dropdown menu.
  - <kbd>Ctrl+A</kbd>: Accept / Save active form.
  - <kbd>Alt+C</kbd> / <kbd>Alt+N</kbd>: Create new record (LR, Order, Invoice, Vehicle, etc.).
  - <kbd>Alt+D</kbd>: Delete selected record (with confirmation).
  - <kbd>Alt+F3</kbd>: Switch Company / Organization picker dialog.

---

## 2. Collision-Free Menu & Accelerator Mapping Table

No two menu items within the same scope share the same accelerator key.

### A. Top-Level Menus (<kbd>Alt + Key</kbd>)
| Menu Label | Hotkey | Target / Behavior |
|:---|:---:|:---|
| **<u>G</u>**ateway / Dashboard | <kbd>Alt+G</kbd> / <kbd>Alt+D</kbd> | Opens Main Dashboard directly |
| **<u>M</u>**asters | <kbd>Alt+M</kbd> | Opens Masters dropdown menu |
| **<u>O</u>**perations | <kbd>Alt+O</kbd> | Opens Operations dropdown menu |
| **<u>F</u>**leet Expenses | <kbd>Alt+F</kbd> | Opens Fleet Expenses dropdown menu |
| Fi**<u>n</u>**ance & Billing | <kbd>Alt+N</kbd> | Opens Finance & Billing dropdown menu |
| **<u>I</u>**nsights & Reports | <kbd>Alt+I</kbd> | Opens Insights dropdown menu |
| **<u>A</u>**dmin & Security | <kbd>Alt+A</kbd> | Opens Admin dropdown menu |
| Switch **<u>C</u>**ompany | <kbd>Alt+F3</kbd> | Opens Tally Company Picker Modal |
| Quick **<u>K</u>**eys Help | <kbd>F1</kbd> / <kbd>Ctrl+Alt+K</kbd> | Opens Keyboard Shortcuts Cheat-Sheet |

---

### B. Submenu Items (Single Key Press when dropdown is open, or Direct Hotkey)

#### 1. Masters Menu (<kbd>Alt+M</kbd>)
| Submenu Item | Key | Direct Hotkey | Route |
|:---|:---:|:---:|:---|
| **<u>B</u>**ranches & Hubs | <kbd>B</kbd> | <kbd>Ctrl+Shift+B</kbd> | `/branches` |
| **<u>V</u>**ehicles & Fleet | <kbd>V</kbd> | <kbd>Ctrl+Shift+V</kbd> | `/fleet` |
| **<u>D</u>**rivers Master | <kbd>D</kbd> | <kbd>Ctrl+Shift+W</kbd> | `/drivers` |
| **<u>C</u>**ustomers / Debtors | <kbd>C</kbd> | <kbd>Ctrl+Shift+C</kbd> | `/customers` |
| Carriers & Trans**<u>p</u>**orters | <kbd>P</kbd> | <kbd>Ctrl+Shift+P</kbd> | `/carriers` |
| **<u>R</u>**outes, Tolls & Hubs | <kbd>R</kbd> | <kbd>Ctrl+Shift+R</kbd> | `/routes` |
| D**<u>o</u>**cuments & Vault | <kbd>O</kbd> | <kbd>Ctrl+Shift+O</kbd> | `/documents` |

#### 2. Operations Menu (<kbd>Alt+O</kbd>)
| Submenu Item | Key | Direct Hotkey | Route |
|:---|:---:|:---:|:---|
| Lorry Receipt (**<u>B</u>**ilty / LR) | <kbd>B</kbd> | <kbd>F8</kbd> | `/lr-consignments` |
| Booking **<u>O</u>**rders | <kbd>O</kbd> | <kbd>F10</kbd> | `/orders` |
| Active **<u>S</u>**hipments | <kbd>S</kbd> | <kbd>Ctrl+Shift+S</kbd> | `/shipments` |
| **<u>L</u>**oad & Trip Planning | <kbd>L</kbd> | <kbd>Ctrl+Shift+L</kbd> | `/planning` |
| **<u>D</u>**ispatch & Loading | <kbd>D</kbd> | <kbd>F7</kbd> | `/dispatch` |
| Live GPS **<u>T</u>**racking | <kbd>T</kbd> | <kbd>Ctrl+Shift+T</kbd> | `/tracking` |
| **<u>P</u>**roof of Delivery (ePOD) | <kbd>P</kbd> | <kbd>F6</kbd> | `/pod` |
| Driver Delivery App (**<u>M</u>**obile) | <kbd>M</kbd> | <kbd>Ctrl+Shift+M</kbd> | `/driver-app` |

#### 3. Fleet Expenses Menu (<kbd>Alt+F</kbd>)
| Submenu Item | Key | Direct Hotkey | Route |
|:---|:---:|:---:|:---|
| **<u>F</u>**uel Entries & Logs | <kbd>F</kbd> | <kbd>F9</kbd> | `/fuel` |
| Driver Trip **<u>A</u>**dvances | <kbd>A</kbd> | <kbd>F5</kbd> | `/driver-advances` |
| Workshop & **<u>M</u>**aintenance | <kbd>M</kbd> | <kbd>Ctrl+Alt+M</kbd> | `/maintenance` |
| T**<u>y</u>**re Inventory & Life | <kbd>Y</kbd> | <kbd>Ctrl+Shift+Y</kbd> | `/tyres` |

#### 4. Finance & Billing Menu (<kbd>Alt+N</kbd>)
| Submenu Item | Key | Direct Hotkey | Route |
|:---|:---:|:---:|:---|
| Freight **<u>B</u>**illing & Invoices | <kbd>B</kbd> | <kbd>Ctrl+F8</kbd> | `/billing` |
| **<u>P</u>**urchase & Vendor Bills | <kbd>P</kbd> | <kbd>Ctrl+F9</kbd> | `/purchase-bills` |
| Trip **<u>S</u>**ettlements | <kbd>S</kbd> | <kbd>Ctrl+F5</kbd> | `/settlements` |
| Freight **<u>A</u>**udit & Claims | <kbd>A</kbd> | <kbd>Ctrl+Shift+A</kbd> | `/freight-audit` |
| Tally Prime / ERP **<u>Z</u>**-Sync | <kbd>Z</kbd> | <kbd>Ctrl+Alt+Z</kbd> | `/accounting-sync` |

#### 5. Insights & Analytics Menu (<kbd>Alt+I</kbd>)
| Submenu Item | Key | Direct Hotkey | Route |
|:---|:---:|:---:|:---|
| MIS & **<u>A</u>**nalytics | <kbd>A</kbd> | <kbd>Ctrl+Alt+R</kbd> | `/analytics` |
| Gati AI **<u>C</u>**opilot | <kbd>C</kbd> | <kbd>Ctrl+Shift+G</kbd> | `/copilot` |
| **<u>E</u>**xception Control Tower | <kbd>E</kbd> | <kbd>Ctrl+Shift+X</kbd> | `/exceptions` |
| System Audit Trai**<u>l</u>**s | <kbd>L</kbd> | <kbd>Ctrl+Alt+L</kbd> | `/audit-logs` |

#### 6. Admin & Security Menu (<kbd>Alt+A</kbd>)
| Submenu Item | Key | Direct Hotkey | Route |
|:---|:---:|:---:|:---|
| **<u>U</u>**sers & Security | <kbd>U</kbd> | <kbd>Ctrl+Shift+U</kbd> | `/admin/users` |
| **<u>R</u>**oles & Permissions Matrix | <kbd>R</kbd> | <kbd>Ctrl+Shift+K</kbd> | `/admin/roles` |
| **<u>S</u>**ystem Architecture Console | <kbd>S</kbd> | <kbd>Ctrl+Shift+J</kbd> | `/admin/system` |
| Company & Platform S**<u>e</u>**ttings | <kbd>E</kbd> | <kbd>F11</kbd> | `/settings` |

---

## 3. Function Key (F1–F12) Workflows

| Key | Tally Accounting Equivalent | TMS Operational Action |
|:---:|:---|:---|
| <kbd>F1</kbd> | Help / Select Accounts | Open Shortcuts Reference Dialog (`Ctrl+Alt+K`) |
| <kbd>Alt+F1</kbd> | Detailed / Condensed View | Toggle Detailed / Compact View on Tables |
| <kbd>F2</kbd> | Change Date | Change Operational Date / Date Filter |
| <kbd>Alt+F2</kbd> | Change Period | Open From/To Date Range Selector |
| <kbd>F3</kbd> | Company / Filter | Focus Global Table Search Filter (`Alt+F`) |
| <kbd>Alt+F3</kbd> | Select / Alter Company | Open Company Picker Dialog |
| <kbd>F4</kbd> | Contra Voucher | Bank / Cash Transfer |
| <kbd>F5</kbd> | Payment Voucher | Driver Advances Voucher (`/driver-advances`) |
| <kbd>Ctrl+F5</kbd> | Settlement Voucher | Trip Expense Settlements (`/settlements`) |
| <kbd>F6</kbd> | Receipt Voucher | Proof of Delivery / Receipt Note (`/pod`) |
| <kbd>F7</kbd> | Journal Voucher | Vehicle Dispatch & Trip Loading (`/dispatch`) |
| <kbd>F8</kbd> | Sales Voucher | Lorry Receipt (LR / Consignment) (`/lr-consignments`) |
| <kbd>Ctrl+F8</kbd> | Credit Note / Sales Invoice | Freight Billing Invoices (`/billing`) |
| <kbd>F9</kbd> | Purchase Voucher | Fuel Entry Logs (`/fuel`) |
| <kbd>Ctrl+F9</kbd> | Debit Note / Purchase Bill | Carrier / Vendor Purchase Bills (`/purchase-bills`) |
| <kbd>F10</kbd> | Reverse Journal / Memo | Booking Orders (`/orders`) |
| <kbd>F11</kbd> | Features | Company Features & Configuration (`/settings`) |
| <kbd>F12</kbd> | Configuration | Toggle Table Columns / Grid Settings |

---

## 4. Universal Arrow-Key Table Navigation Engine

Every data table across TMS (Billing, LRs, Orders, Fleet, Fuel, Advances, Dispatches) will support unified keyboard roaming:

```
[ Table View ]
┌────────────────────────────────────────────────────────┐
│  Row 01: LR-2024-001  |  Ahmedabad -> Mumbai  [ACTIVE] │ <── Focused Row (Glowing Cyan / Tally Border)
│  Row 02: LR-2024-002  |  Surat -> Delhi       [PAID]   │
│  Row 03: LR-2024-003  |  Vadodara -> Pune     [TRANSIT]│
└────────────────────────────────────────────────────────┘
```

- <kbd>↓</kbd> (Down Arrow): Move to next table row.
- <kbd>↑</kbd> (Up Arrow): Move to previous table row.
- <kbd>Home</kbd>: Jump to first table row.
- <kbd>End</kbd>: Jump to last table row.
- <kbd>PageDown</kbd> / <kbd>PageUp</kbd>: Scroll 10 rows down/up.
- <kbd>Enter</kbd>: Open edit drawer or view details for currently selected row.
- <kbd>Space</kbd>: Check/uncheck row selection checkbox (multi-select).
- <kbd>Alt+C</kbd> or <kbd>Alt+N</kbd>: Create new record in that table.
- <kbd>Alt+D</kbd> or <kbd>Delete</kbd>: Delete currently selected row.
- <kbd>Alt+P</kbd>: Print voucher / generate PDF for currently selected row.
- <kbd>Alt+E</kbd>: Export table to Excel / CSV.
- <kbd>Esc</kbd>: Clear selection, blur table, or navigate back.

---

## 5. Universal Form Key Navigation

When filling vouchers (LR generation, Billing Invoice form, Fuel entry dialog, Dispatch create modal):

- <kbd>Enter</kbd>: Moves to next input field (Tally behavior).
- <kbd>Shift+Tab</kbd> / <kbd>↑</kbd>: Moves to previous input field.
- <kbd>Ctrl+A</kbd>: Accept & Save record immediately from any field.
- <kbd>Esc</kbd>: Exit form dialog (prompts "Quit? Y/N" if dirty).
- <kbd>Space</kbd>: Open dropdown / toggle checkbox.
- <kbd>Alt+C</kbd> inside a dropdown field: Quick-create a new Master on the fly (e.g. quick-add Customer or Vehicle without leaving the form).

---

## 6. Implementation Architecture

### Phase 1: Core Key Registry & Dispatcher (`frontend/src/desk/keys/`)
1. Update `presets.ts` with all non-overlapping NAV & ACTION bindings.
2. Update `labels.ts` with clean human-readable titles.
3. Enhance `dispatcher.ts` with table navigation listener hooks (`useTableNavigation`).

### Phase 2: Top Menu Bar Enhancements (`DeskMenuBar.vue` & `tmsMenu.ts`)
1. Ensure all single-letter accelerator keys in `tmsMenu.ts` are strictly distinct.
2. In `DeskMenuBar.vue`, ensure <kbd>←</kbd> and <kbd>→</kbd> switch smoothly between top menus when open, <kbd>↑</kbd> and <kbd>↓</kbd> scroll submenus, <kbd>Enter</kbd> activates.

### Phase 3: Reusable Table Keyboard Roaming Composable (`useTableNavigation.ts`)
1. Create `src/composables/useTableNavigation.ts` providing:
   - `focusedIndex`: Ref of selected row.
   - `onKeydown`: Arrow key handler with auto-scrolling into view.
   - `selectRow`: Callbacks for <kbd>Enter</kbd> (open), <kbd>Space</kbd> (toggle), <kbd>Alt+D</kbd> (delete).
2. Wire into primary tables:
   - `BillingPage.vue`
   - `LorryReceiptsPage.vue`
   - `OrdersPage.vue`
   - `DispatchPage.vue`
   - `FleetPage.vue`
   - `FuelEntryPage.vue`

### Phase 4: Validation & Visual Polish
1. Add high-visibility keyboard focus rings (`.tally-focused-row`) with smooth scrolling (`scrollIntoView({ block: 'nearest' })`).
2. Verify all keys via `F1` / `Ctrl+Alt+K` (DeskKeysDialog).
3. Test end-to-end zero-mouse flow in browser.
