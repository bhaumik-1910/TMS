"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPolicy = exports.InvoicePolicy = exports.ShipmentPolicy = void 0;
class ShipmentPolicy {
    static canView(user, shipment) {
        if (!user)
            return false;
        if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*'))
            return true;
        if (shipment.transportOrder?.organizationId && shipment.transportOrder.organizationId !== user.organizationId) {
            return false;
        }
        if (user.roles?.includes('DRIVER')) {
            if (shipment.driverId && shipment.driverId !== user.id && shipment.driver?.email !== user.email) {
                return false;
            }
        }
        if (user.roles?.includes('CUSTOMER')) {
            if (shipment.customerId && user.customerId && shipment.customerId !== user.customerId) {
                return false;
            }
        }
        if (user.roles?.includes('CARRIER')) {
            if (shipment.carrierId && user.carrierId && shipment.carrierId !== user.carrierId) {
                return false;
            }
        }
        return true;
    }
    static canUpdate(user, shipment) {
        if (!this.canView(user, shipment))
            return false;
        if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*'))
            return true;
        return user.permissions?.includes('shipment:update');
    }
    static canDispatch(user, shipment) {
        if (!this.canView(user, shipment))
            return false;
        if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*'))
            return true;
        return user.permissions?.includes('dispatch:dispatch');
    }
    static canDelete(user, shipment) {
        if (!this.canView(user, shipment))
            return false;
        if (user.roles?.includes('SUPER_ADMIN'))
            return true;
        return user.permissions?.includes('shipment:delete');
    }
    static sanitize(shipment, user) {
        if (!shipment)
            return shipment;
        const sanitized = { ...shipment };
        const hasFinancialAccess = user?.roles?.includes('SUPER_ADMIN') ||
            user?.roles?.includes('FINANCE_MANAGER') ||
            user?.permissions?.includes('*') ||
            user?.permissions?.includes('billing:view') ||
            user?.permissions?.includes('shipment:financial:view');
        if (!hasFinancialAccess) {
            delete sanitized.carrierRate;
            delete sanitized.internalMargin;
            delete sanitized.freightCost;
            delete sanitized.contractedRate;
        }
        return sanitized;
    }
}
exports.ShipmentPolicy = ShipmentPolicy;
class InvoicePolicy {
    static canView(user, invoice) {
        if (!user)
            return false;
        if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*'))
            return true;
        if (user.roles?.includes('CUSTOMER')) {
            return invoice.customerId === user.customerId;
        }
        if (invoice.customer?.organizationId && invoice.customer.organizationId !== user.organizationId) {
            return false;
        }
        return user.permissions?.includes('billing:view');
    }
    static canApprove(user, invoice) {
        if (!this.canView(user, invoice))
            return false;
        if (user.roles?.includes('SUPER_ADMIN'))
            return true;
        return user.permissions?.includes('billing:approve');
    }
}
exports.InvoicePolicy = InvoicePolicy;
class UserPolicy {
    static sanitize(userResponse) {
        if (!userResponse)
            return userResponse;
        const clean = { ...userResponse };
        delete clean.passwordHash;
        delete clean.refreshToken;
        delete clean.secret;
        return clean;
    }
}
exports.UserPolicy = UserPolicy;
//# sourceMappingURL=resource-policies.js.map