import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import {
  ALL_MODELS,
  OrganizationModel,
  UserModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  UserRoleModel,
  LocationTypeModel,
  LocationModel,
  VehicleTypeModel,
  CargoTypeModel,
  PackageTypeModel,
  FacilityModel,
  DockModel,
  CustomerModel,
  CarrierModel,
  CarrierContractModel,
  CarrierRateModel,
  VehicleModel,
  DriverModel,
  DriverAssignmentModel,
  TransportOrderModel,
  OrderItemModel,
  ShipmentModel,
  RouteModel,
  RouteStopModel,
  DispatchModel,
  GeofenceModel,
  InvoiceModel,
  InvoiceItemModel,
  PaymentModel,
  NotificationModel,
} from './models';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined.');
    process.exit(1);
  }

  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    models: ALL_MODELS,
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('🌱 Starting Enterprise TMS Database Seeding with Sequelize...');

    // 1. Create Master Organization
    const [org] = await OrganizationModel.findOrCreate({
      where: { code: 'APEX-LOGISTICS' },
      defaults: {
        name: 'Apex Global Logistics Inc.',
        code: 'APEX-LOGISTICS',
        email: 'operations@apexlogistics.com',
        phone: '+1 (800) 555-0199',
        address: '100 South Wacker Dr, Suite 1800, Chicago, IL 60606',
        timezone: 'America/Chicago',
        currency: 'USD',
        status: 'ACTIVE',
      },
    });
    console.log('✅ Master Organization created:', org.name);

    // 2. Create 13 Enterprise Roles
    const rolesList = [
      { name: 'SUPER_ADMIN', description: 'Platform Administrator with unrestricted cross-tenant privileges' },
      { name: 'TMS_ADMIN', description: 'Organization Administrator with master data and config management' },
      { name: 'OPERATIONS_MANAGER', description: 'Oversees daily shipments, performance KPIs and exceptions' },
      { name: 'TRANSPORT_PLANNER', description: 'Manages load consolidation, capacity planning and route design' },
      { name: 'DISPATCHER', description: 'Controls dispatch board, vehicle-driver assignment and active trips' },
      { name: 'FLEET_MANAGER', description: 'Manages vehicle health, maintenance, telematics and inspections' },
      { name: 'DRIVER', description: 'Operates vehicle, accepts dispatches, updates ETA and collects POD' },
      { name: 'CARRIER', description: 'Third-party transport partner managing tender bids and assignments' },
      { name: 'CUSTOMER', description: 'Shipper creating transport orders and monitoring tracking/invoices' },
      { name: 'FINANCE_MANAGER', description: 'Handles freight audit, customer billing, payment reconciliation' },
      { name: 'COMPLIANCE_MANAGER', description: 'Oversees regulatory documents, driver licenses, certifications' },
      { name: 'SUPPORT_AGENT', description: 'Handles operational queries, exception tracking and communication' },
      { name: 'ANALYST', description: 'Evaluates KPI reports, carrier ratings and financial metrics' },
    ];

    const roleMap: Record<string, string> = {};
    for (const r of rolesList) {
      const [role] = await RoleModel.findOrCreate({
        where: { name: r.name },
        defaults: r,
      });
      roleMap[r.name] = role.id;
    }
    console.log('✅ 13 Enterprise Roles seeded.');

    // 3. Create Granular Permissions
    const permissionsList = [
      { key: 'orders:create', module: 'orders', action: 'create' },
      { key: 'orders:read', module: 'orders', action: 'read' },
      { key: 'orders:update', module: 'orders', action: 'update' },
      { key: 'orders:delete', module: 'orders', action: 'delete' },
      { key: 'orders:approve', module: 'orders', action: 'approve' },
      { key: 'shipments:create', module: 'shipments', action: 'create' },
      { key: 'shipments:read', module: 'shipments', action: 'read' },
      { key: 'shipments:update', module: 'shipments', action: 'update' },
      { key: 'shipments:cancel', module: 'shipments', action: 'cancel' },
      { key: 'planning:manage', module: 'planning', action: 'manage' },
      { key: 'dispatch:create', module: 'dispatch', action: 'create' },
      { key: 'dispatch:assign', module: 'dispatch', action: 'assign' },
      { key: 'dispatch:update', module: 'dispatch', action: 'update' },
      { key: 'dispatch:complete', module: 'dispatch', action: 'complete' },
      { key: 'vehicles:create', module: 'fleet', action: 'create' },
      { key: 'vehicles:read', module: 'fleet', action: 'read' },
      { key: 'vehicles:update', module: 'fleet', action: 'update' },
      { key: 'drivers:create', module: 'drivers', action: 'create' },
      { key: 'drivers:read', module: 'drivers', action: 'read' },
      { key: 'drivers:update', module: 'drivers', action: 'update' },
      { key: 'tracking:read', module: 'tracking', action: 'read' },
      { key: 'pod:submit', module: 'pod', action: 'submit' },
      { key: 'pod:verify', module: 'pod', action: 'verify' },
      { key: 'billing:read', module: 'billing', action: 'read' },
      { key: 'billing:create', module: 'billing', action: 'create' },
      { key: 'billing:audit', module: 'billing', action: 'audit' },
      { key: 'analytics:read', module: 'analytics', action: 'read' },
      { key: 'admin:config', module: 'admin', action: 'config' },
    ];

    const permissionMap: Record<string, string> = {};
    for (const p of permissionsList) {
      const [perm] = await PermissionModel.findOrCreate({
        where: { key: p.key },
        defaults: p,
      });
      permissionMap[p.key] = perm.id;
    }

    // Assign full permissions to SUPER_ADMIN and TMS_ADMIN
    for (const pId of Object.values(permissionMap)) {
      await RolePermissionModel.findOrCreate({
        where: { roleId: roleMap['SUPER_ADMIN'], permissionId: pId },
        defaults: { roleId: roleMap['SUPER_ADMIN'], permissionId: pId },
      });
      await RolePermissionModel.findOrCreate({
        where: { roleId: roleMap['TMS_ADMIN'], permissionId: pId },
        defaults: { roleId: roleMap['TMS_ADMIN'], permissionId: pId },
      });
    }
    console.log('✅ Permissions & Role-Permission mappings seeded.');

    // 4. Create 13 Demo Users (one per role)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Tms@123456', salt);

    const demoUsers = [
      { email: 'superadmin@tms.com', firstName: 'Alexander', lastName: 'Pierce', role: 'SUPER_ADMIN' },
      { email: 'admin@tms.com', firstName: 'Sarah', lastName: 'Connor', role: 'TMS_ADMIN' },
      { email: 'operations@tms.com', firstName: 'Marcus', lastName: 'Vance', role: 'OPERATIONS_MANAGER' },
      { email: 'planner@tms.com', firstName: 'Elena', lastName: 'Rostova', role: 'TRANSPORT_PLANNER' },
      { email: 'dispatcher@tms.com', firstName: 'David', lastName: 'Miller', role: 'DISPATCHER' },
      { email: 'fleet@tms.com', firstName: 'Robert', lastName: 'Chen', role: 'FLEET_MANAGER' },
      { email: 'driver@tms.com', firstName: 'James', lastName: 'Rodriguez', role: 'DRIVER' },
      { email: 'carrier@tms.com', firstName: 'Michael', lastName: 'Sterling', role: 'CARRIER' },
      { email: 'customer@tms.com', firstName: 'Emily', lastName: 'Watson', role: 'CUSTOMER' },
      { email: 'finance@tms.com', firstName: 'Patricia', lastName: 'Hayes', role: 'FINANCE_MANAGER' },
      { email: 'compliance@tms.com', firstName: 'Richard', lastName: 'Gomez', role: 'COMPLIANCE_MANAGER' },
      { email: 'support@tms.com', firstName: 'Jessica', lastName: 'Taylor', role: 'SUPPORT_AGENT' },
      { email: 'analyst@tms.com', firstName: 'Daniel', lastName: 'Kim', role: 'ANALYST' },
    ];

    const userMap: Record<string, UserModel> = {};
    for (const u of demoUsers) {
      const [userRecord] = await UserModel.findOrCreate({
        where: { email: u.email },
        defaults: {
          organizationId: org.id,
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          status: 'ACTIVE',
        },
      });
      userMap[u.role] = userRecord;

      await UserRoleModel.findOrCreate({
        where: { userId: userRecord.id, roleId: roleMap[u.role] },
        defaults: { userId: userRecord.id, roleId: roleMap[u.role] },
      });
    }
    console.log('✅ 13 Demo Users seeded (Password: Tms@123456).');

    // 5. Master Data: Vehicle Types, Cargo Types, Package Types
    const vehicleTypes = [
      { code: 'SEMI_53', name: '53ft Dry Van Semi-Trailer', maxWeightKg: 20000, maxVolumeCbm: 110, axleCount: 5 },
      { code: 'REEFER_53', name: '53ft Refrigerated Trailer', maxWeightKg: 19000, maxVolumeCbm: 100, axleCount: 5 },
      { code: 'FLATBED_48', name: '48ft Flatbed Truck', maxWeightKg: 22000, maxVolumeCbm: 90, axleCount: 5 },
      { code: 'BOX_TRUCK_26', name: '26ft Straight Box Truck', maxWeightKg: 7500, maxVolumeCbm: 45, axleCount: 2 },
      { code: 'SPRINTER_VAN', name: 'Cargo Sprinter Van', maxWeightKg: 1800, maxVolumeCbm: 14, axleCount: 2 },
    ];
    const vehicleTypeRecords: Record<string, string> = {};
    for (const vt of vehicleTypes) {
      const [rec] = await VehicleTypeModel.findOrCreate({ where: { code: vt.code }, defaults: vt });
      vehicleTypeRecords[vt.code] = rec.id;
    }

    const cargoTypes = [
      { code: 'GENERAL_FREIGHT', name: 'General Dry Freight', isHazardous: false, requiresTempControl: false },
      { code: 'COLD_CHAIN', name: 'Perishable Food / Cold Chain', isHazardous: false, requiresTempControl: true },
      { code: 'HAZMAT_CLASS_3', name: 'Flammable Liquids (Hazmat 3)', isHazardous: true, requiresTempControl: false },
      { code: 'ELECTRONICS', name: 'High-Value Fragile Electronics', isHazardous: false, requiresTempControl: false },
    ];
    const cargoTypeRecords: Record<string, string> = {};
    for (const ct of cargoTypes) {
      const [c] = await CargoTypeModel.findOrCreate({ where: { code: ct.code }, defaults: ct });
      cargoTypeRecords[ct.code] = c.id;
    }

    const packageTypes = [
      { code: 'STD_PALLET', name: 'Standard Pallet (48x40)', standardWeightKg: 500, standardVolumeCbm: 1.5 },
      { code: 'EU_PALLET', name: 'Euro Pallet (120x80)', standardWeightKg: 400, standardVolumeCbm: 1.2 },
      { code: 'CARTON_BOX', name: 'Corrugated Heavy Carton', standardWeightKg: 25, standardVolumeCbm: 0.1 },
      { code: 'DRUM_55GAL', name: '55 Gallon Steel Drum', standardWeightKg: 220, standardVolumeCbm: 0.4 },
    ];
    const packageTypeRecords: Record<string, string> = {};
    for (const pt of packageTypes) {
      const [p] = await PackageTypeModel.findOrCreate({ where: { code: pt.code }, defaults: pt });
      packageTypeRecords[pt.code] = p.id;
    }
    console.log('✅ Vehicle Types, Cargo Types & Package Types seeded.');

    // 6. Locations & Hub Facilities
    const [locTypeHub] = await LocationTypeModel.findOrCreate({
      where: { code: 'LOGISTICS_HUB' },
      defaults: { code: 'LOGISTICS_HUB', name: 'Logistics Distribution Hub' },
    });

    const locationsData = [
      {
        code: 'CHI-HUB-01',
        name: 'Apex Midwest Gateway Hub',
        addressLine1: '3800 S Laramie Ave',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60804',
        latitude: 41.8215,
        longitude: -87.7533,
      },
      {
        code: 'DAL-HUB-02',
        name: 'Apex South Central Terminal',
        addressLine1: '4200 Logistics Blvd',
        city: 'Dallas',
        state: 'TX',
        postalCode: '75237',
        latitude: 32.6845,
        longitude: -96.8621,
      },
      {
        code: 'ATL-HUB-03',
        name: 'Apex Southeast Consolidation Center',
        addressLine1: '1200 Tradewater Pkwy',
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30349',
        latitude: 33.6128,
        longitude: -84.4981,
      },
      {
        code: 'LAX-HUB-04',
        name: 'Apex West Coast Intermodal Facility',
        addressLine1: '2100 E 49th St',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90058',
        latitude: 34.0042,
        longitude: -118.2255,
      },
    ];

    const locationMap: Record<string, LocationModel> = {};
    for (const loc of locationsData) {
      const [l] = await LocationModel.findOrCreate({
        where: { code: loc.code },
        defaults: {
          organizationId: org.id,
          locationTypeId: locTypeHub.id,
          ...loc,
        },
      });
      locationMap[loc.code] = l;

      // Create facility & docks
      const [fac] = await FacilityModel.findOrCreate({
        where: { code: `FAC-${loc.code}` },
        defaults: {
          organizationId: org.id,
          locationId: l.id,
          name: `${loc.name} Facility`,
          code: `FAC-${loc.code}`,
          capacityDocks: 12,
        },
      });

      for (let i = 1; i <= 4; i++) {
        await DockModel.findOrCreate({
          where: { facilityId: fac.id, dockNumber: `Bay ${i}` },
          defaults: {
            facilityId: fac.id,
            dockNumber: `Bay ${i}`,
            dockType: i % 2 === 0 ? 'CROSS_DOCK' : 'STANDARD',
            status: 'AVAILABLE',
          },
        });
      }
    }
    console.log('✅ Hub Locations, Facilities & Docks seeded.');

    // 7. Customers & Carriers
    const customersData = [
      { customerCode: 'CUST-001', companyName: 'Global Retail Direct Inc.', email: 'logistics@globalretail.com', creditLimit: 250000 },
      { customerCode: 'CUST-002', companyName: 'OmniTech Electronics Corp.', email: 'freight@omnitech.com', creditLimit: 180000 },
      { customerCode: 'CUST-003', companyName: 'BioPharma Health Logistics', email: 'supplychain@biopharma.org', creditLimit: 300000 },
    ];
    const customerMap: Record<string, CustomerModel> = {};
    for (const c of customersData) {
      const [cust] = await CustomerModel.findOrCreate({
        where: { customerCode: c.customerCode },
        defaults: { organizationId: org.id, ...c },
      });
      customerMap[c.customerCode] = cust;
    }

    const carriersData = [
      { carrierCode: 'CARR-SWIFT', companyName: 'Swift Linehaul Express', email: 'dispatch@swiftlinehaul.com', address: 'Phoenix, AZ', rating: 4.8, onTimeDeliveryRate: 97.5 },
      { carrierCode: 'CARR-PRIME', companyName: 'Prime Freight Logistics', email: 'operations@primefreight.com', address: 'Springfield, MO', rating: 4.6, onTimeDeliveryRate: 95.0 },
      { carrierCode: 'CARR-JBHUNT', companyName: 'JB Dedicated Transport', email: 'loadboard@jbhunt.com', address: 'Lowell, AR', rating: 4.9, onTimeDeliveryRate: 98.2 },
    ];
    const carrierMap: Record<string, CarrierModel> = {};
    for (const cr of carriersData) {
      const [carrier] = await CarrierModel.findOrCreate({
        where: { carrierCode: cr.carrierCode },
        defaults: { organizationId: org.id, ...cr },
      });
      carrierMap[cr.carrierCode] = carrier;

      // Rate card
      await CarrierRateModel.findOrCreate({
        where: {
          carrierId: carrier.id,
          originLocationId: locationMap['CHI-HUB-01'].id,
          destinationLocationId: locationMap['DAL-HUB-02'].id,
        },
        defaults: {
          carrierId: carrier.id,
          originLocationId: locationMap['CHI-HUB-01'].id,
          destinationLocationId: locationMap['DAL-HUB-02'].id,
          baseRate: 1.95,
          rateType: 'PER_KM',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 86400000 * 365),
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ Customers, Carriers & Rate Cards seeded.');

    // 8. Fleet: Vehicles & Drivers
    const vehiclesData = [
      { reg: 'TRK-101', make: 'Freightliner', model: 'Cascadia', year: 2023, lat: 41.8215, lng: -87.7533 },
      { reg: 'TRK-102', make: 'Kenworth', model: 'T680', year: 2024, lat: 32.6845, lng: -96.8621 },
      { reg: 'TRK-103', make: 'Peterbilt', model: '579', year: 2022, lat: 33.6128, lng: -84.4981 },
      { reg: 'TRK-104', make: 'Volvo', model: 'VNL 860', year: 2023, lat: 34.0042, lng: -118.2255 },
    ];
    const vehicleRecords: VehicleModel[] = [];
    for (const v of vehiclesData) {
      const [veh] = await VehicleModel.findOrCreate({
        where: { vehicleNumber: v.reg },
        defaults: {
          organizationId: org.id,
          vehicleTypeId: vehicleTypeRecords['SEMI_53'],
          vehicleNumber: v.reg,
          make: v.make,
          model: v.model,
          year: v.year,
          capacityWeight: 20000,
          capacityVolume: 110,
          currentLatitude: v.lat,
          currentLongitude: v.lng,
          fuelLevelPercent: 88,
          status: 'AVAILABLE',
        },
      });
      vehicleRecords.push(veh);
    }

    const driverUser = userMap['DRIVER'];
    const [driverRecord] = await DriverModel.findOrCreate({
      where: { employeeCode: 'DRV-001' },
      defaults: {
        organizationId: org.id,
        userId: driverUser?.id,
        employeeCode: 'DRV-001',
        firstName: 'James',
        lastName: 'Rodriguez',
        phone: '+1 (312) 555-0144',
        email: 'driver@tms.com',
        licenseNumber: 'IL-CDL-998822',
        licenseExpiry: new Date('2028-12-31'),
        status: 'AVAILABLE',
      },
    });

    if (vehicleRecords[0]) {
      await DriverAssignmentModel.findOrCreate({
        where: { driverId: driverRecord.id, vehicleId: vehicleRecords[0].id },
        defaults: {
          driverId: driverRecord.id,
          vehicleId: vehicleRecords[0].id,
          startDate: new Date(),
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ Vehicles, Drivers & Driver Assignments seeded.');

    // 9. Operational Data: Transport Orders & Shipments
    const [order1] = await TransportOrderModel.findOrCreate({
      where: { orderNumber: 'ORD-2026-001' },
      defaults: {
        organizationId: org.id,
        customerId: customerMap['CUST-001'].id,
        orderNumber: 'ORD-2026-001',
        priority: 'HIGH',
        originLocationId: locationMap['CHI-HUB-01'].id,
        destinationLocationId: locationMap['DAL-HUB-02'].id,
        requestedPickupDate: new Date(),
        requestedDeliveryDate: new Date(Date.now() + 86400000 * 2),
        totalWeight: 12500,
        totalVolume: 65,
        totalPackages: 24,
        createdBy: userMap['SUPER_ADMIN']?.id,
        status: 'CONFIRMED',
      },
    });

    const [orderItem1] = await OrderItemModel.findOrCreate({
      where: { transportOrderId: order1.id, description: 'Consumer Electronics Pallets' },
      defaults: {
        transportOrderId: order1.id,
        description: 'Consumer Electronics Pallets',
        quantity: 24,
        packageType: 'STD_PALLET',
        packageTypeId: packageTypeRecords['STD_PALLET'],
        cargoTypeId: cargoTypeRecords['ELECTRONICS'],
        weight: 12500,
        volume: 65,
      },
    });

    const [shipment1] = await ShipmentModel.findOrCreate({
      where: { shipmentNumber: 'SHP-2026-1001' },
      defaults: {
        transportOrderId: order1.id,
        customerId: customerMap['CUST-001'].id,
        vehicleId: vehicleRecords[0]?.id,
        driverId: driverRecord?.id,
        shipmentNumber: 'SHP-2026-1001',
        carrierId: carrierMap['CARR-SWIFT'].id,
        mode: 'ROAD',
        distanceKm: 1485,
        status: 'IN_TRANSIT',
        freightCost: 2895.75,
        plannedPickup: new Date(),
        plannedDelivery: new Date(Date.now() + 86400000 * 2),
        totalWeight: 12500,
        totalVolume: 65,
      },
    });

    const [route1] = await RouteModel.findOrCreate({
      where: { shipmentId: shipment1.id, routeName: 'Chicago to Dallas Linehaul' },
      defaults: {
        shipmentId: shipment1.id,
        routeName: 'Chicago to Dallas Linehaul',
        totalDistanceKm: 1485,
        estimatedDurationMinutes: 1020,
      },
    });

    await RouteStopModel.findOrCreate({
      where: { routeId: route1.id, stopSequence: 1 },
      defaults: {
        routeId: route1.id,
        locationId: locationMap['CHI-HUB-01'].id,
        stopSequence: 1,
        stopType: 'PICKUP',
        status: 'COMPLETED',
      },
    });

    await RouteStopModel.findOrCreate({
      where: { routeId: route1.id, stopSequence: 2 },
      defaults: {
        routeId: route1.id,
        locationId: locationMap['DAL-HUB-02'].id,
        stopSequence: 2,
        stopType: 'DELIVERY',
        status: 'PENDING',
      },
    });

    const [dispatch1] = await DispatchModel.findOrCreate({
      where: { dispatchNumber: 'DSP-2026-001' },
      defaults: {
        shipmentId: shipment1.id,
        vehicleId: vehicleRecords[0].id,
        driverId: driverRecord.id,
        dispatchNumber: 'DSP-2026-001',
        dispatchTime: new Date(),
        status: 'IN_TRANSIT',
      },
    });
    console.log('✅ Transport Order, Shipment, Route & Dispatch seeded.');

    // 10. Geofences
    await GeofenceModel.findOrCreate({
      where: { name: 'Chicago Terminal Zone' },
      defaults: {
        organizationId: org.id,
        name: 'Chicago Terminal Zone',
        shapeType: 'CIRCLE',
        centerLatitude: 41.8215,
        centerLongitude: -87.7533,
        radiusMeters: 800,
      },
    });
    await GeofenceModel.findOrCreate({
      where: { name: 'Dallas Terminal Zone' },
      defaults: {
        organizationId: org.id,
        name: 'Dallas Terminal Zone',
        shapeType: 'CIRCLE',
        centerLatitude: 32.6845,
        centerLongitude: -96.8621,
        radiusMeters: 800,
      },
    });

    // 11. Invoicing & Billing
    const [invoice1] = await InvoiceModel.findOrCreate({
      where: { invoiceNumber: 'INV-2026-001' },
      defaults: {
        organizationId: org.id,
        customerId: customerMap['CUST-001'].id,
        shipmentId: shipment1.id,
        invoiceNumber: 'INV-2026-001',
        invoiceType: 'CUSTOMER_BILLING',
        subTotal: 3100.0,
        taxAmount: 248.0,
        totalAmount: 3348.0,
        contractedAmount: 3348.0,
        varianceAmount: 0.0,
        dueDate: new Date(Date.now() + 86400000 * 30),
        status: 'PAID',
      },
    });

    await InvoiceItemModel.findOrCreate({
      where: { invoiceId: invoice1.id, description: 'Linehaul Freight Service - CHI to DAL' },
      defaults: {
        invoiceId: invoice1.id,
        description: 'Linehaul Freight Service - CHI to DAL',
        quantity: 1,
        unitPrice: 3100.0,
        totalAmount: 3100.0,
        amount: 3100.0,
      },
    });

    await PaymentModel.findOrCreate({
      where: { paymentReference: 'PAY-REF-99214' },
      defaults: {
        invoiceId: invoice1.id,
        paymentReference: 'PAY-REF-99214',
        amount: 3348.0,
        paymentMethod: 'ACH_TRANSFER',
        paymentDate: new Date(),
        status: 'COMPLETED',
      },
    });

    // 12. Notification
    await NotificationModel.create({
      organizationId: org.id,
      userId: userMap['OPERATIONS_MANAGER']?.id,
      title: 'Shipment Dispatched',
      message: 'Shipment SHP-2026-1001 is en route to Dallas Hub.',
      type: 'INFO',
    });

    console.log('🎉 Enterprise TMS Master Database Seeding Completed Successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

seedDatabase();
