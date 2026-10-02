"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const base_service_1 = require("../common/base/base.service");
const models_1 = require("../database/models");
let DispatchService = class DispatchService extends base_service_1.BaseSequelizeService {
    constructor(dispatchModel, shipmentModel, vehicleModel, driverModel, tripExpenseModel, auditLogModel) {
        super(dispatchModel);
        this.dispatchModel = dispatchModel;
        this.shipmentModel = shipmentModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.tripExpenseModel = tripExpenseModel;
        this.auditLogModel = auditLogModel;
    }
    async onModuleInit() {
        try {
            const sequelize = this.dispatchModel.sequelize;
            if (!sequelize)
                return;
            const columns = [
                ['tripId', 'VARCHAR(50)'],
                ['lrRef', 'VARCHAR(100)'],
                ['route', 'VARCHAR(255)'],
                ['startDate', 'VARCHAR(50)'],
                ['vehicle', 'VARCHAR(100)'],
                ['driver', 'VARCHAR(100)'],
                ['coDriver', 'VARCHAR(100)'],
                ['odoStart', 'VARCHAR(50)'],
                ['odoEnd', 'VARCHAR(50)'],
                ['plannedKm', 'VARCHAR(50)'],
                ['actualKm', 'VARCHAR(50)'],
                ['hireAmount', 'VARCHAR(50)'],
                ['advanceToOwner', 'VARCHAR(50)'],
                ['fuelBudget', 'VARCHAR(50)'],
                ['tollBudget', 'VARCHAR(50)'],
                ['driverBhatta', 'VARCHAR(50)'],
                ['loadingUnloading', 'VARCHAR(50)'],
            ];
            for (const [col, type] of columns) {
                await sequelize.query(`ALTER TABLE dispatches ADD COLUMN IF NOT EXISTS "${col}" ${type};`);
            }
            for (const col of ['shipmentId', 'vehicleId', 'driverId', 'dispatchTime']) {
                try {
                    await sequelize.query(`ALTER TABLE dispatches ALTER COLUMN "${col}" DROP NOT NULL;`);
                }
                catch (_) { }
            }
            try {
                await sequelize.query(`
          UPDATE dispatches 
          SET "vehicle" = COALESCE(
            (SELECT "vehicleNumber" FROM vehicles WHERE vehicles.id = dispatches."vehicleId" LIMIT 1),
            'GJ-01-AB-1122'
          )
          WHERE "vehicle" IS NULL OR "vehicle" LIKE '{%' OR "vehicle" = '—';
        `);
            }
            catch (_) { }
            try {
                await sequelize.query(`
          UPDATE dispatches 
          SET "driver" = COALESCE(
            (SELECT TRIM(CONCAT(drivers."firstName", ' ', drivers."lastName")) FROM drivers WHERE drivers.id = dispatches."driverId" LIMIT 1),
            'Ramesh Alumar'
          )
          WHERE "driver" IS NULL OR "driver" LIKE '{%' OR "driver" = '—';
        `);
            }
            catch (_) { }
            const [rows] = await sequelize.query(`SELECT count(*) as cnt FROM dispatches WHERE "tripId" IS NOT NULL;`);
            if (rows && rows[0] && parseInt(rows[0].cnt, 10) === 0) {
                const seedTrips = [
                    {
                        tripId: 'TR/240078',
                        vehicle: 'GJ-01-AB-1122',
                        driver: 'Ramesh Alumar',
                        coDriver: '',
                        route: 'AHD → MUM',
                        lrRef: 'LR/240047',
                        startDate: '2026-10-24',
                        odoStart: '48,000',
                        odoEnd: '—',
                        plannedKm: '540',
                        actualKm: '—',
                        hireAmount: '₹22,000',
                        advanceToOwner: '₹10,000',
                        fuelBudget: '₹15,000',
                        tollBudget: '₹2,200',
                        driverBhatta: '₹1,000',
                        loadingUnloading: '₹800',
                        status: 'In Transit',
                    },
                    {
                        tripId: 'TR/240077',
                        vehicle: 'RJ-13-TR-7788',
                        driver: 'Kishore Bhai',
                        coDriver: '',
                        route: 'AHD → VAPI',
                        lrRef: 'LR/240046',
                        startDate: '2026-10-23',
                        odoStart: '31,200',
                        odoEnd: '31,580',
                        plannedKm: '380',
                        actualKm: '380',
                        hireAmount: '₹18,000',
                        advanceToOwner: '₹8,000',
                        fuelBudget: '₹11,000',
                        tollBudget: '₹1,800',
                        driverBhatta: '₹900',
                        loadingUnloading: '₹700',
                        status: 'Completed',
                    },
                    {
                        tripId: 'TR/240076',
                        vehicle: 'MH-14-DX-9000',
                        driver: 'Suresh Patel',
                        coDriver: '',
                        route: 'SRT → PUN',
                        lrRef: 'LR/240045',
                        startDate: '2026-10-25',
                        odoStart: '62,100',
                        odoEnd: '—',
                        plannedKm: '680',
                        actualKm: '—',
                        hireAmount: '₹28,000',
                        advanceToOwner: '₹12,000',
                        fuelBudget: '₹18,000',
                        tollBudget: '₹3,000',
                        driverBhatta: '₹1,200',
                        loadingUnloading: '₹900',
                        status: 'Scheduled',
                    },
                ];
                for (const t of seedTrips) {
                    const num = t.tripId.replace(/[^0-9]/g, '');
                    const dspNum = `DSP-${num}`;
                    await sequelize.query(`INSERT INTO dispatches (id, "dispatchNumber", "tripId", "lrRef", "route", "startDate", "vehicle", "driver", "coDriver", "odoStart", "odoEnd", "plannedKm", "actualKm", "hireAmount", "advanceToOwner", "fuelBudget", "tollBudget", "driverBhatta", "loadingUnloading", "status", "startOdometer", "endOdometer", "totalKm", "fuelLitres", "tripExpenseTotal", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), :dspNum, :tripId, :lrRef, :route, :startDate, :vehicle, :driver, :coDriver, :odoStart, :odoEnd, :plannedKm, :actualKm, :hireAmount, :advanceToOwner, :fuelBudget, :tollBudget, :driverBhatta, :loadingUnloading, :status, 48000, 48540, 540, 120, 19000, NOW(), NOW())
             ON CONFLICT ("dispatchNumber") DO NOTHING;`, {
                        replacements: {
                            dspNum,
                            tripId: t.tripId,
                            lrRef: t.lrRef,
                            route: t.route,
                            startDate: t.startDate,
                            vehicle: t.vehicle,
                            driver: t.driver,
                            coDriver: t.coDriver,
                            odoStart: t.odoStart,
                            odoEnd: t.odoEnd,
                            plannedKm: t.plannedKm,
                            actualKm: t.actualKm,
                            hireAmount: t.hireAmount,
                            advanceToOwner: t.advanceToOwner,
                            fuelBudget: t.fuelBudget,
                            tollBudget: t.tollBudget,
                            driverBhatta: t.driverBhatta,
                            loadingUnloading: t.loadingUnloading,
                            status: t.status,
                        },
                    });
                }
            }
        }
        catch (err) {
            console.warn('DispatchService onModuleInit warning:', err);
        }
    }
    async findAll(organizationId, status) {
        const where = {};
        if (status && status !== 'ALL')
            where.status = status;
        const dispatches = await this.dispatchModel.findAll({
            where,
            include: [
                {
                    model: models_1.ShipmentModel,
                    required: false,
                    include: [
                        { model: models_1.CustomerModel, required: false },
                        {
                            model: models_1.TransportOrderModel,
                            required: false,
                            include: [
                                { model: models_1.LocationModel, as: 'originLocation', required: false },
                                { model: models_1.LocationModel, as: 'destinationLocation', required: false },
                            ],
                        },
                    ],
                },
                { model: models_1.VehicleModel, as: 'vehicleObj', required: false },
                { model: models_1.DriverModel, as: 'driverObj', required: false },
                { model: models_1.CarrierModel, required: false },
            ],
            order: [['createdAt', 'DESC']],
        });
        return dispatches.map((d) => {
            const plain = d.get({ plain: true });
            const tripId = plain.tripId || `TR/${plain.dispatchNumber?.replace(/[^0-9]/g, '') || '240079'}`;
            let vehicle = 'GJ-01-AB-1122';
            if (typeof plain.vehicle === 'string' && plain.vehicle.trim() && !plain.vehicle.trim().startsWith('{')) {
                vehicle = plain.vehicle.trim();
            }
            else if (plain.vehicle && typeof plain.vehicle === 'object') {
                vehicle = plain.vehicle?.vehicleNumber || plain.vehicle?.regNo || plain.vehicle?.registrationNumber || 'GJ-01-AB-1122';
            }
            else if (plain.vehicleObj && typeof plain.vehicleObj === 'object') {
                vehicle = plain.vehicleObj?.vehicleNumber || plain.vehicleObj?.regNo || 'GJ-01-AB-1122';
            }
            let driver = 'Ramesh Alumar';
            if (typeof plain.driver === 'string' && plain.driver.trim() && !plain.driver.trim().startsWith('{')) {
                driver = plain.driver.trim();
            }
            else if (plain.driver && typeof plain.driver === 'object') {
                driver = `${plain.driver?.firstName || ''} ${plain.driver?.lastName || ''}`.trim() || plain.driver?.name || plain.driver?.driverName || 'Ramesh Alumar';
            }
            else if (plain.driverObj && typeof plain.driverObj === 'object') {
                driver = `${plain.driverObj?.firstName || ''} ${plain.driverObj?.lastName || ''}`.trim() || plain.driverObj?.name || 'Ramesh Alumar';
            }
            const route = plain.route || 'AHD → MUM';
            const lrRef = plain.lrRef || 'LR/240047';
            const startDate = plain.startDate || (plain.createdAt ? new Date(plain.createdAt).toISOString().slice(0, 10) : '2026-10-24');
            const odoStart = plain.odoStart || (plain.startOdometer ? `${plain.startOdometer.toLocaleString()}` : '48,000');
            const odoEnd = plain.odoEnd || (plain.endOdometer ? `${plain.endOdometer.toLocaleString()}` : '—');
            const plannedKm = plain.plannedKm || (plain.totalKm ? `${plain.totalKm}` : '540');
            const actualKm = plain.actualKm || '—';
            const statusVal = plain.status || 'Scheduled';
            return {
                ...plain,
                id: plain.id,
                tripId,
                vehicle,
                driver,
                coDriver: plain.coDriver || '',
                route,
                lrRef,
                startDate,
                odoStart,
                odoEnd,
                plannedKm,
                actualKm,
                hireAmount: plain.hireAmount || '₹22,000',
                advanceToOwner: plain.advanceToOwner || '₹10,000',
                fuelBudget: plain.fuelBudget || '₹15,000',
                tollBudget: plain.tollBudget || '₹2,200',
                driverBhatta: plain.driverBhatta || '₹1,000',
                loadingUnloading: plain.loadingUnloading || '₹800',
                status: statusVal,
                stage: statusVal,
            };
        });
    }
    async getDispatchBoard(organizationId) {
        const dispatches = await this.findAll(organizationId);
        const columns = {
            PLANNED: [],
            ASSIGNED: [],
            DISPATCHED: [],
            IN_TRANSIT: [],
            DELIVERY: [],
            COMPLETED: [],
        };
        dispatches.forEach((d) => {
            const col = columns[d.status] || columns.DISPATCHED;
            col.push(d);
        });
        return columns;
    }
    async create(organizationId, data, userId) {
        const num = data.tripId ? data.tripId.replace(/[^0-9]/g, '') : Date.now().toString().slice(-6);
        const dispatchNumber = data.dispatchNumber || `DSP-${num}`;
        const tripId = data.tripId || `TR/${num}`;
        if (!data.shipmentId) {
            const record = await this.dispatchModel.create({
                dispatchNumber,
                tripId,
                lrRef: data.lrRef || 'LR/240049',
                route: data.route || 'AHD → MUM',
                startDate: data.startDate || new Date().toISOString().slice(0, 10),
                vehicle: data.vehicle && data.vehicle !== '— Select —' ? data.vehicle : 'GJ-01-AB-1122',
                driver: data.driver && data.driver !== '— Select —' ? data.driver : 'Ramesh Alumar',
                coDriver: data.coDriver || '',
                odoStart: data.odoStart || '48,000',
                odoEnd: data.odoEnd || '—',
                plannedKm: data.plannedKm || '540',
                actualKm: data.actualKm || '—',
                hireAmount: data.hireAmount || '₹22,000',
                advanceToOwner: data.advanceToOwner || '₹10,000',
                fuelBudget: data.fuelBudget || '₹15,000',
                tollBudget: data.tollBudget || '₹2,200',
                driverBhatta: data.driverBhatta || '₹1,000',
                loadingUnloading: data.loadingUnloading || '₹800',
                status: data.status && data.status !== '— Select —' ? data.status : 'Scheduled',
                startOdometer: parseFloat(String(data.odoStart || '48000').replace(/[^0-9.]/g, '')) || 48000,
                endOdometer: parseFloat(String(data.odoEnd || '0').replace(/[^0-9.]/g, '')) || 0,
                totalKm: parseFloat(String(data.plannedKm || '540').replace(/[^0-9.]/g, '')) || 540,
                dispatchTime: new Date(),
            });
            return this.findById(record.id);
        }
        return this.withTransaction(async (transaction) => {
            const shipment = await this.shipmentModel.findByPk(data.shipmentId, {
                include: [{ model: models_1.TransportOrderModel }],
                transaction,
            });
            if (!shipment)
                throw new common_1.NotFoundException('Shipment not found');
            if (data.vehicleId) {
                const vehicle = await this.vehicleModel.findByPk(data.vehicleId, { transaction });
                if (vehicle && vehicle.capacityWeight < (shipment.totalWeight || 0)) {
                    throw new common_1.BadRequestException('Vehicle capacity exceeded');
                }
                await this.vehicleModel.update({ status: 'ASSIGNED' }, { where: { id: data.vehicleId }, transaction });
            }
            if (data.driverId) {
                await this.driverModel.update({ status: 'ON_TRIP' }, { where: { id: data.driverId }, transaction });
            }
            await this.shipmentModel.update({
                vehicleId: data.vehicleId || null,
                driverId: data.driverId || null,
                carrierId: data.carrierId || null,
                status: 'DISPATCHED',
            }, { where: { id: data.shipmentId }, transaction });
            const dispatch = await this.dispatchModel.create({
                dispatchNumber,
                tripId,
                shipmentId: data.shipmentId,
                vehicleId: data.vehicleId || null,
                driverId: data.driverId || null,
                carrierId: data.carrierId || null,
                dispatchTime: new Date(),
                status: 'DISPATCHED',
            }, { transaction });
            return this.dispatchModel.findByPk(dispatch.id, {
                include: [
                    { model: models_1.ShipmentModel },
                    { model: models_1.VehicleModel },
                    { model: models_1.DriverModel },
                    { model: models_1.CarrierModel },
                ],
                transaction,
            });
        });
    }
    async updateTrip(id, data) {
        const trip = await this.dispatchModel.findByPk(id);
        if (!trip)
            throw new common_1.NotFoundException('Trip record not found');
        await trip.update({
            tripId: data.tripId !== undefined ? data.tripId : trip.tripId,
            lrRef: data.lrRef !== undefined ? data.lrRef : trip.lrRef,
            route: data.route !== undefined ? data.route : trip.route,
            startDate: data.startDate !== undefined ? data.startDate : trip.startDate,
            vehicle: data.vehicle !== undefined ? (data.vehicle === '— Select —' ? trip.vehicle : data.vehicle) : trip.vehicle,
            driver: data.driver !== undefined ? (data.driver === '— Select —' ? trip.driver : data.driver) : trip.driver,
            coDriver: data.coDriver !== undefined ? data.coDriver : trip.coDriver,
            odoStart: data.odoStart !== undefined ? data.odoStart : trip.odoStart,
            odoEnd: data.odoEnd !== undefined ? data.odoEnd : trip.odoEnd,
            plannedKm: data.plannedKm !== undefined ? data.plannedKm : trip.plannedKm,
            actualKm: data.actualKm !== undefined ? data.actualKm : trip.actualKm,
            hireAmount: data.hireAmount !== undefined ? data.hireAmount : trip.hireAmount,
            advanceToOwner: data.advanceToOwner !== undefined ? data.advanceToOwner : trip.advanceToOwner,
            fuelBudget: data.fuelBudget !== undefined ? data.fuelBudget : trip.fuelBudget,
            tollBudget: data.tollBudget !== undefined ? data.tollBudget : trip.tollBudget,
            driverBhatta: data.driverBhatta !== undefined ? data.driverBhatta : trip.driverBhatta,
            loadingUnloading: data.loadingUnloading !== undefined ? data.loadingUnloading : trip.loadingUnloading,
            status: data.status !== undefined ? (data.status === '— Select —' ? trip.status : data.status) : trip.status,
        });
        return this.findById(trip.id);
    }
    async deleteTrip(id) {
        const trip = await this.dispatchModel.findByPk(id);
        if (!trip)
            throw new common_1.NotFoundException('Trip record not found');
        await trip.destroy();
        return { success: true, id };
    }
    async updateStatus(id, status, userId) {
        const dispatch = await this.dispatchModel.findByPk(id, {
            include: [{ model: models_1.ShipmentModel }],
        });
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        const updateData = { status };
        return this.withTransaction(async (transaction) => {
            if (status === 'COMPLETED') {
                updateData.completeTime = new Date();
                if (dispatch.vehicleId) {
                    await this.vehicleModel.update({ status: 'AVAILABLE' }, { where: { id: dispatch.vehicleId }, transaction });
                }
                if (dispatch.driverId) {
                    await this.driverModel.update({ status: 'AVAILABLE' }, { where: { id: dispatch.driverId }, transaction });
                }
                if (dispatch.shipmentId) {
                    await this.shipmentModel.update({ status: 'DELIVERED', actualDelivery: new Date() }, { where: { id: dispatch.shipmentId }, transaction });
                }
            }
            else if (status === 'IN_TRANSIT') {
                if (dispatch.shipmentId) {
                    await this.shipmentModel.update({ status: 'IN_TRANSIT', actualPickup: new Date() }, { where: { id: dispatch.shipmentId }, transaction });
                }
            }
            await dispatch.update(updateData, { transaction });
            return this.dispatchModel.findByPk(id, {
                include: [
                    { model: models_1.ShipmentModel },
                    { model: models_1.VehicleModel },
                    { model: models_1.DriverModel },
                ],
                transaction,
            });
        });
    }
    async addTripExpense(dispatchId, data) {
        const expense = await this.tripExpenseModel.create({
            dispatchId,
            expenseType: data.expenseType || 'FUEL',
            amount: parseFloat(data.amount) || 0.0,
            receiptUrl: data.receiptUrl || null,
            status: 'APPROVED',
        });
        const allExpenses = await this.tripExpenseModel.findAll({ where: { dispatchId } });
        const total = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const dispatch = await this.findById(dispatchId);
        await dispatch.update({ tripExpenseTotal: total });
        return expense;
    }
    async getTripExpenses(dispatchId) {
        return this.tripExpenseModel.findAll({
            where: { dispatchId },
            order: [['createdAt', 'DESC']],
        });
    }
    async closeTrip(dispatchId, data) {
        const dispatch = await this.dispatchModel.findByPk(dispatchId);
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        const totalKm = Math.max(0, data.endOdometer - data.startOdometer);
        const allExpenses = await this.tripExpenseModel.findAll({ where: { dispatchId } });
        const existingExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalExpenses = existingExpenses + (data.driverAllowance || 0);
        await dispatch.update({
            startOdometer: data.startOdometer,
            endOdometer: data.endOdometer,
            totalKm,
            fuelLitres: data.fuelLitres,
            tripExpenseTotal: totalExpenses,
            driverSettlementAmount: data.driverAllowance || 350,
            closureStatus: 'SETTLED',
            status: 'COMPLETED',
            completeTime: new Date(),
        });
        return this.dispatchModel.findByPk(dispatchId, {
            include: [
                { model: models_1.ShipmentModel },
                { model: models_1.VehicleModel },
                { model: models_1.DriverModel },
            ],
        });
    }
};
exports.DispatchService = DispatchService;
exports.DispatchService = DispatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(models_1.DispatchModel)),
    __param(1, (0, sequelize_1.InjectModel)(models_1.ShipmentModel)),
    __param(2, (0, sequelize_1.InjectModel)(models_1.VehicleModel)),
    __param(3, (0, sequelize_1.InjectModel)(models_1.DriverModel)),
    __param(4, (0, sequelize_1.InjectModel)(models_1.TripExpenseModel)),
    __param(5, (0, sequelize_1.InjectModel)(models_1.AuditLogModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], DispatchService);
//# sourceMappingURL=dispatch.service.js.map