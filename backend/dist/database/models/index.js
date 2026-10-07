"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceModel = exports.LorryReceiptModel = exports.ProofOfDeliveryModel = exports.GeofenceEventModel = exports.GeofenceModel = exports.TrackingEventModel = exports.SettlementModel = exports.PurchaseBillModel = exports.BillingInvoiceModel = exports.PodRecordModel = exports.JobCardModel = exports.TyreInventoryModel = exports.TyreEventModel = exports.DriverAdvanceModel = exports.TenderRequestModel = exports.DispatchModel = exports.LoadPlanItemModel = exports.LoadPlanModel = exports.RouteStopModel = exports.RouteModel = exports.ShipmentItemModel = exports.ShipmentModel = exports.OrderItemModel = exports.TransportOrderModel = exports.FuelEntryModel = exports.DriverAssignmentModel = exports.DriverDocumentModel = exports.DriverModel = exports.VehicleMaintenanceModel = exports.VehicleDocumentModel = exports.VehicleModel = exports.CarrierDocumentModel = exports.CarrierRateModel = exports.CarrierContractModel = exports.CarrierModel = exports.CustomerModel = exports.AppointmentModel = exports.DockModel = exports.FacilityModel = exports.PackageTypeModel = exports.CargoTypeModel = exports.VehicleTypeModel = exports.LocationModel = exports.LocationTypeModel = exports.UserRoleModel = exports.RolePermissionModel = exports.PermissionModel = exports.RoleModel = exports.UserModel = exports.OrganizationModel = void 0;
exports.ALL_MODELS = exports.UserBranchModel = exports.ExceptionModel = exports.EntityEventModel = exports.CompanySettingModel = exports.PeriodLockModel = exports.DocumentSequenceModel = exports.BranchModel = exports.DemoRequestModel = exports.DocumentModel = exports.DocumentTypeModel = exports.AnalyticsDataModel = exports.AuditLogModel = exports.NotificationModel = exports.AccountingSyncModel = exports.ClaimItemModel = exports.ClaimModel = exports.TripExpenseModel = exports.PaymentModel = exports.InvoiceItemModel = void 0;
const organization_model_1 = require("./auth/organization.model");
Object.defineProperty(exports, "OrganizationModel", { enumerable: true, get: function () { return organization_model_1.OrganizationModel; } });
const user_model_1 = require("./auth/user.model");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return user_model_1.UserModel; } });
const role_model_1 = require("./auth/role.model");
Object.defineProperty(exports, "RoleModel", { enumerable: true, get: function () { return role_model_1.RoleModel; } });
const permission_model_1 = require("./auth/permission.model");
Object.defineProperty(exports, "PermissionModel", { enumerable: true, get: function () { return permission_model_1.PermissionModel; } });
const role_permission_model_1 = require("./auth/role-permission.model");
Object.defineProperty(exports, "RolePermissionModel", { enumerable: true, get: function () { return role_permission_model_1.RolePermissionModel; } });
const user_role_model_1 = require("./auth/user-role.model");
Object.defineProperty(exports, "UserRoleModel", { enumerable: true, get: function () { return user_role_model_1.UserRoleModel; } });
const master_data_model_1 = require("./master-data/master-data.model");
Object.defineProperty(exports, "LocationTypeModel", { enumerable: true, get: function () { return master_data_model_1.LocationTypeModel; } });
Object.defineProperty(exports, "LocationModel", { enumerable: true, get: function () { return master_data_model_1.LocationModel; } });
Object.defineProperty(exports, "VehicleTypeModel", { enumerable: true, get: function () { return master_data_model_1.VehicleTypeModel; } });
Object.defineProperty(exports, "CargoTypeModel", { enumerable: true, get: function () { return master_data_model_1.CargoTypeModel; } });
Object.defineProperty(exports, "PackageTypeModel", { enumerable: true, get: function () { return master_data_model_1.PackageTypeModel; } });
const facility_model_1 = require("./master-data/facility.model");
Object.defineProperty(exports, "FacilityModel", { enumerable: true, get: function () { return facility_model_1.FacilityModel; } });
Object.defineProperty(exports, "DockModel", { enumerable: true, get: function () { return facility_model_1.DockModel; } });
Object.defineProperty(exports, "AppointmentModel", { enumerable: true, get: function () { return facility_model_1.AppointmentModel; } });
const partners_model_1 = require("./partners/partners.model");
Object.defineProperty(exports, "CustomerModel", { enumerable: true, get: function () { return partners_model_1.CustomerModel; } });
Object.defineProperty(exports, "CarrierModel", { enumerable: true, get: function () { return partners_model_1.CarrierModel; } });
Object.defineProperty(exports, "CarrierContractModel", { enumerable: true, get: function () { return partners_model_1.CarrierContractModel; } });
Object.defineProperty(exports, "CarrierRateModel", { enumerable: true, get: function () { return partners_model_1.CarrierRateModel; } });
Object.defineProperty(exports, "CarrierDocumentModel", { enumerable: true, get: function () { return partners_model_1.CarrierDocumentModel; } });
const fleet_model_1 = require("./fleet/fleet.model");
Object.defineProperty(exports, "VehicleModel", { enumerable: true, get: function () { return fleet_model_1.VehicleModel; } });
Object.defineProperty(exports, "VehicleDocumentModel", { enumerable: true, get: function () { return fleet_model_1.VehicleDocumentModel; } });
Object.defineProperty(exports, "VehicleMaintenanceModel", { enumerable: true, get: function () { return fleet_model_1.VehicleMaintenanceModel; } });
Object.defineProperty(exports, "DriverModel", { enumerable: true, get: function () { return fleet_model_1.DriverModel; } });
Object.defineProperty(exports, "DriverDocumentModel", { enumerable: true, get: function () { return fleet_model_1.DriverDocumentModel; } });
Object.defineProperty(exports, "DriverAssignmentModel", { enumerable: true, get: function () { return fleet_model_1.DriverAssignmentModel; } });
Object.defineProperty(exports, "FuelEntryModel", { enumerable: true, get: function () { return fleet_model_1.FuelEntryModel; } });
const operations_model_1 = require("./operations/operations.model");
Object.defineProperty(exports, "TransportOrderModel", { enumerable: true, get: function () { return operations_model_1.TransportOrderModel; } });
Object.defineProperty(exports, "OrderItemModel", { enumerable: true, get: function () { return operations_model_1.OrderItemModel; } });
Object.defineProperty(exports, "ShipmentModel", { enumerable: true, get: function () { return operations_model_1.ShipmentModel; } });
Object.defineProperty(exports, "ShipmentItemModel", { enumerable: true, get: function () { return operations_model_1.ShipmentItemModel; } });
Object.defineProperty(exports, "RouteModel", { enumerable: true, get: function () { return operations_model_1.RouteModel; } });
Object.defineProperty(exports, "RouteStopModel", { enumerable: true, get: function () { return operations_model_1.RouteStopModel; } });
Object.defineProperty(exports, "LoadPlanModel", { enumerable: true, get: function () { return operations_model_1.LoadPlanModel; } });
Object.defineProperty(exports, "LoadPlanItemModel", { enumerable: true, get: function () { return operations_model_1.LoadPlanItemModel; } });
Object.defineProperty(exports, "DispatchModel", { enumerable: true, get: function () { return operations_model_1.DispatchModel; } });
Object.defineProperty(exports, "TenderRequestModel", { enumerable: true, get: function () { return operations_model_1.TenderRequestModel; } });
Object.defineProperty(exports, "DriverAdvanceModel", { enumerable: true, get: function () { return operations_model_1.DriverAdvanceModel; } });
Object.defineProperty(exports, "TyreEventModel", { enumerable: true, get: function () { return operations_model_1.TyreEventModel; } });
Object.defineProperty(exports, "TyreInventoryModel", { enumerable: true, get: function () { return operations_model_1.TyreInventoryModel; } });
Object.defineProperty(exports, "JobCardModel", { enumerable: true, get: function () { return operations_model_1.JobCardModel; } });
Object.defineProperty(exports, "PodRecordModel", { enumerable: true, get: function () { return operations_model_1.PodRecordModel; } });
Object.defineProperty(exports, "BillingInvoiceModel", { enumerable: true, get: function () { return operations_model_1.BillingInvoiceModel; } });
Object.defineProperty(exports, "PurchaseBillModel", { enumerable: true, get: function () { return operations_model_1.PurchaseBillModel; } });
Object.defineProperty(exports, "SettlementModel", { enumerable: true, get: function () { return operations_model_1.SettlementModel; } });
const telematics_model_1 = require("./telematics/telematics.model");
Object.defineProperty(exports, "TrackingEventModel", { enumerable: true, get: function () { return telematics_model_1.TrackingEventModel; } });
Object.defineProperty(exports, "GeofenceModel", { enumerable: true, get: function () { return telematics_model_1.GeofenceModel; } });
Object.defineProperty(exports, "GeofenceEventModel", { enumerable: true, get: function () { return telematics_model_1.GeofenceEventModel; } });
Object.defineProperty(exports, "ProofOfDeliveryModel", { enumerable: true, get: function () { return telematics_model_1.ProofOfDeliveryModel; } });
Object.defineProperty(exports, "LorryReceiptModel", { enumerable: true, get: function () { return telematics_model_1.LorryReceiptModel; } });
const finance_model_1 = require("./finance/finance.model");
Object.defineProperty(exports, "InvoiceModel", { enumerable: true, get: function () { return finance_model_1.InvoiceModel; } });
Object.defineProperty(exports, "InvoiceItemModel", { enumerable: true, get: function () { return finance_model_1.InvoiceItemModel; } });
Object.defineProperty(exports, "PaymentModel", { enumerable: true, get: function () { return finance_model_1.PaymentModel; } });
Object.defineProperty(exports, "TripExpenseModel", { enumerable: true, get: function () { return finance_model_1.TripExpenseModel; } });
Object.defineProperty(exports, "ClaimModel", { enumerable: true, get: function () { return finance_model_1.ClaimModel; } });
Object.defineProperty(exports, "ClaimItemModel", { enumerable: true, get: function () { return finance_model_1.ClaimItemModel; } });
Object.defineProperty(exports, "AccountingSyncModel", { enumerable: true, get: function () { return finance_model_1.AccountingSyncModel; } });
const system_model_1 = require("./system/system.model");
Object.defineProperty(exports, "NotificationModel", { enumerable: true, get: function () { return system_model_1.NotificationModel; } });
Object.defineProperty(exports, "AuditLogModel", { enumerable: true, get: function () { return system_model_1.AuditLogModel; } });
Object.defineProperty(exports, "AnalyticsDataModel", { enumerable: true, get: function () { return system_model_1.AnalyticsDataModel; } });
Object.defineProperty(exports, "DocumentTypeModel", { enumerable: true, get: function () { return system_model_1.DocumentTypeModel; } });
Object.defineProperty(exports, "DocumentModel", { enumerable: true, get: function () { return system_model_1.DocumentModel; } });
Object.defineProperty(exports, "DemoRequestModel", { enumerable: true, get: function () { return system_model_1.DemoRequestModel; } });
const branch_model_1 = require("./foundation/branch.model");
Object.defineProperty(exports, "BranchModel", { enumerable: true, get: function () { return branch_model_1.BranchModel; } });
const document_sequence_model_1 = require("./foundation/document-sequence.model");
Object.defineProperty(exports, "DocumentSequenceModel", { enumerable: true, get: function () { return document_sequence_model_1.DocumentSequenceModel; } });
const period_lock_model_1 = require("./foundation/period-lock.model");
Object.defineProperty(exports, "PeriodLockModel", { enumerable: true, get: function () { return period_lock_model_1.PeriodLockModel; } });
const company_setting_model_1 = require("./foundation/company-setting.model");
Object.defineProperty(exports, "CompanySettingModel", { enumerable: true, get: function () { return company_setting_model_1.CompanySettingModel; } });
const entity_event_model_1 = require("./foundation/entity-event.model");
Object.defineProperty(exports, "EntityEventModel", { enumerable: true, get: function () { return entity_event_model_1.EntityEventModel; } });
const exception_model_1 = require("./foundation/exception.model");
Object.defineProperty(exports, "ExceptionModel", { enumerable: true, get: function () { return exception_model_1.ExceptionModel; } });
const user_branch_model_1 = require("./foundation/user-branch.model");
Object.defineProperty(exports, "UserBranchModel", { enumerable: true, get: function () { return user_branch_model_1.UserBranchModel; } });
exports.ALL_MODELS = [
    organization_model_1.OrganizationModel,
    user_model_1.UserModel,
    role_model_1.RoleModel,
    permission_model_1.PermissionModel,
    role_permission_model_1.RolePermissionModel,
    user_role_model_1.UserRoleModel,
    master_data_model_1.LocationTypeModel,
    master_data_model_1.LocationModel,
    master_data_model_1.VehicleTypeModel,
    master_data_model_1.CargoTypeModel,
    master_data_model_1.PackageTypeModel,
    facility_model_1.FacilityModel,
    facility_model_1.DockModel,
    facility_model_1.AppointmentModel,
    partners_model_1.CustomerModel,
    partners_model_1.CarrierModel,
    partners_model_1.CarrierContractModel,
    partners_model_1.CarrierRateModel,
    partners_model_1.CarrierDocumentModel,
    fleet_model_1.VehicleModel,
    fleet_model_1.VehicleDocumentModel,
    fleet_model_1.VehicleMaintenanceModel,
    fleet_model_1.DriverModel,
    fleet_model_1.DriverDocumentModel,
    fleet_model_1.DriverAssignmentModel,
    fleet_model_1.FuelEntryModel,
    operations_model_1.TransportOrderModel,
    operations_model_1.OrderItemModel,
    operations_model_1.ShipmentModel,
    operations_model_1.ShipmentItemModel,
    operations_model_1.RouteModel,
    operations_model_1.RouteStopModel,
    operations_model_1.LoadPlanModel,
    operations_model_1.LoadPlanItemModel,
    operations_model_1.DispatchModel,
    operations_model_1.TenderRequestModel,
    operations_model_1.DriverAdvanceModel,
    operations_model_1.TyreEventModel,
    operations_model_1.TyreInventoryModel,
    operations_model_1.JobCardModel,
    operations_model_1.PodRecordModel,
    operations_model_1.BillingInvoiceModel,
    operations_model_1.PurchaseBillModel,
    operations_model_1.SettlementModel,
    telematics_model_1.TrackingEventModel,
    telematics_model_1.GeofenceModel,
    telematics_model_1.GeofenceEventModel,
    telematics_model_1.ProofOfDeliveryModel,
    telematics_model_1.LorryReceiptModel,
    finance_model_1.InvoiceModel,
    finance_model_1.InvoiceItemModel,
    finance_model_1.PaymentModel,
    finance_model_1.TripExpenseModel,
    finance_model_1.ClaimModel,
    finance_model_1.ClaimItemModel,
    finance_model_1.AccountingSyncModel,
    system_model_1.NotificationModel,
    system_model_1.AuditLogModel,
    system_model_1.AnalyticsDataModel,
    system_model_1.DocumentTypeModel,
    system_model_1.DocumentModel,
    system_model_1.DemoRequestModel,
    branch_model_1.BranchModel,
    document_sequence_model_1.DocumentSequenceModel,
    period_lock_model_1.PeriodLockModel,
    company_setting_model_1.CompanySettingModel,
    entity_event_model_1.EntityEventModel,
    exception_model_1.ExceptionModel,
    user_branch_model_1.UserBranchModel,
];
//# sourceMappingURL=index.js.map