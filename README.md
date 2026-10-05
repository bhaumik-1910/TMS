# APEX Enterprise Transportation Management System (TMS)

A production-grade, multi-tenant, high-concurrency **Enterprise Transportation Management System (TMS)** built with **NestJS**, **PostgreSQL 17**, **Sequelize ORM**, **Vue.js 3**, **Quasar Framework**, and **Socket.IO** real-time telematics.

---

## 1. System Architecture Overview

The system strictly follows the enterprise shared-schema multi-tenant architecture:
- **Frontend Layer**: Vue 3 + TypeScript + Quasar + Pinia + Vue Router + Leaflet (CartoDB tiles) + ECharts.
- **API & Business Layer**: NestJS 10 (Modular Services, Guards, Interceptors, DTOs, WebSockets).
- **Persistence Layer**: PostgreSQL 17 with UUID primary keys, foreign key constraints, pagination indexes, audit logging, and transactional safety.

---

## 2. 13 Enterprise Roles & Demo Accounts

All demo accounts are pre-seeded in the database with the default password: **`Tms@123456`**.

| Role Name | Demo Email | Primary Purpose / Responsibilities |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | `superadmin@tms.com` | Unrestricted cross-tenant oversight, subscription & tenant controls |
| **TMS_ADMIN** | `admin@tms.com` | Organization-level configuration, master data, user & role management |
| **OPERATIONS_MANAGER** | `operations@tms.com` | Daily freight operations, dispatch monitoring, SLA performance |
| **TRANSPORT_PLANNER** | `planner@tms.com` | Load consolidation, vehicle capacity simulation, route optimization |
| **DISPATCHER** | `dispatcher@tms.com` | Kanban dispatch board, assigning vehicle/driver/carrier, live trips |
| **FLEET_MANAGER** | `fleet@tms.com` | Vehicle telematics, preventive maintenance, fuel, and inspections |
| **DRIVER** | `driver@tms.com` | Dedicated mobile experience, turn-by-turn linehaul, OTP & signature POD |
| **CARRIER** | `carrier@tms.com` | 3PL freight partner portal, lane contracts, rate card tenders |
| **CUSTOMER** | `customer@tms.com` | Shipper booking transport orders, shipment tracking, customer invoices |
| **FINANCE_MANAGER** | `finance@tms.com` | Automated freight audit, customer billing, payment reconciliation |
| **COMPLIANCE_MANAGER**| `compliance@tms.com`| CDL license expiry, vehicle certifications, regulatory audit |
| **SUPPORT_AGENT** | `support@tms.com` | Shipment exception resolution, customer queries, communication |
| **ANALYST** | `analyst@tms.com` | Transportation spend analysis, OTD % benchmarking, KPI analytics |

> **Pro Tip**: Use the **Role Persona Switcher** in the top navigation bar to instantaneously toggle between any of the 13 roles without logging out!

---

## 3. Key Core Modules & Capabilities

1. **Transport Orders & Multi-Item Builder**:
   - Priority levels: `LOW`, `NORMAL`, `HIGH`, `URGENT`
   - Cargo & package classifications: pallets, cartons, drums, hazardous, fragile
   - Automated conversion to linehaul shipments upon confirmation

2. **Transport Planner Workspace**:
   - Visual calculation of vehicle weight capacity % and volume capacity %
   - Overload prevention protection and load consolidation

3. **Dispatch Board (Kanban)**:
   - Real-time columns: `ASSIGNED`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`
   - Interactive status advancement and vehicle allocation

4. **Real-Time GPS Tracking & Geofencing**:
   - Interactive Leaflet OpenStreetMap with vehicle markers, speed gauges, and route trails
   - Circular geofence boundaries (Chicago Hub, Dallas Terminal, Atlanta Hub)
   - Live GPS Telemetry Simulator to demonstrate real-time vehicle movement and WebSocket broadcasts

5. **Dedicated Driver Mobile App Experience**:
   - Tactile, distraction-free mobile screen for drivers
   - "Start Trip", "Report Traffic Delay", "Report Breakdown"
   - Complete Proof of Delivery (POD) workflow: Receiver Name, OTP verification, and Canvas Digital Signature

6. **Freight Audit & Variance Detection**:
   - Automated comparison of carrier billed invoices against contracted lane rates ($/km)
   - Overcharge variance detection and policy discrepancy alerts

7. **AI Transportation Assistant**:
   - Natural language intelligence assistant for operations managers
   - Pre-built queries: "Show today's delayed shipments", "Which carrier has highest OTD?", "Find underutilized vehicles"

---

## 4. How to Run Locally

### Prerequisites
- Node.js v18+ and npm
- PostgreSQL 17 running on `127.0.0.1:5432` with database `enterprise_tms`

### 1. Backend Setup
```bash
cd backend
npm install
npm run db:sync
npm run db:seed
npm run start:dev
```
Backend API will start on: **`http://localhost:3000`**
Swagger Interactive OpenAPI Docs: **`http://localhost:3000/api/docs`**

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Console will start on: **`http://localhost:5173`**

---

## 5. Docker Deployment

To launch the full stack (PostgreSQL, Redis, NestJS Backend, and Nginx Frontend) with one command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- API Docs: `http://localhost:3000/api/docs`
