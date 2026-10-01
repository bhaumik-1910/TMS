import { ForbiddenException } from '@nestjs/common';

/**
 * Enterprise Resource Policies
 * Enforces business-layer policy checks and field-level sanitization.
 */
export class ShipmentPolicy {
  static canView(user: any, shipment: any): boolean {
    if (!user) return false;
    if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) return true;

    // Organization tenant boundary
    if (shipment.transportOrder?.organizationId && shipment.transportOrder.organizationId !== user.organizationId) {
      return false;
    }

    // Role-specific assignment rules
    if (user.roles?.includes('DRIVER')) {
      // Driver can only view shipments assigned to them
      if (shipment.driverId && shipment.driverId !== user.id && shipment.driver?.email !== user.email) {
        return false;
      }
    }

    if (user.roles?.includes('CUSTOMER')) {
      // Customer can only view their own shipments
      if (shipment.customerId && user.customerId && shipment.customerId !== user.customerId) {
        return false;
      }
    }

    if (user.roles?.includes('CARRIER')) {
      // Carrier can only view shipments contracted to them
      if (shipment.carrierId && user.carrierId && shipment.carrierId !== user.carrierId) {
        return false;
      }
    }

    return true;
  }

  static canUpdate(user: any, shipment: any): boolean {
    if (!this.canView(user, shipment)) return false;
    if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) return true;
    return user.permissions?.includes('shipment:update');
  }

  static canDispatch(user: any, shipment: any): boolean {
    if (!this.canView(user, shipment)) return false;
    if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) return true;
    return user.permissions?.includes('dispatch:dispatch');
  }

  static canDelete(user: any, shipment: any): boolean {
    if (!this.canView(user, shipment)) return false;
    if (user.roles?.includes('SUPER_ADMIN')) return true;
    return user.permissions?.includes('shipment:delete');
  }

  /**
   * Field-Level Security:
   * Masks financial rate, profit margin, and accessorial cost data unless
   * the authenticated user has explicit billing/financial permissions.
   */
  static sanitize(shipment: any, user: any): any {
    if (!shipment) return shipment;
    const sanitized = { ...shipment };

    const hasFinancialAccess =
      user?.roles?.includes('SUPER_ADMIN') ||
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

export class InvoicePolicy {
  static canView(user: any, invoice: any): boolean {
    if (!user) return false;
    if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) return true;

    // Customer can only view invoices issued to them
    if (user.roles?.includes('CUSTOMER')) {
      return invoice.customerId === user.customerId;
    }

    // Tenant check
    if (invoice.customer?.organizationId && invoice.customer.organizationId !== user.organizationId) {
      return false;
    }

    return user.permissions?.includes('billing:view');
  }

  static canApprove(user: any, invoice: any): boolean {
    if (!this.canView(user, invoice)) return false;
    if (user.roles?.includes('SUPER_ADMIN')) return true;
    return user.permissions?.includes('billing:approve');
  }
}

export class UserPolicy {
  static sanitize(userResponse: any): any {
    if (!userResponse) return userResponse;
    const clean = { ...userResponse };
    delete clean.passwordHash;
    delete clean.refreshToken;
    delete clean.secret;
    return clean;
  }
}
