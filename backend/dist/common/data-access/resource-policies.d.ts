export declare class ShipmentPolicy {
    static canView(user: any, shipment: any): boolean;
    static canUpdate(user: any, shipment: any): boolean;
    static canDispatch(user: any, shipment: any): boolean;
    static canDelete(user: any, shipment: any): boolean;
    static sanitize(shipment: any, user: any): any;
}
export declare class InvoicePolicy {
    static canView(user: any, invoice: any): boolean;
    static canApprove(user: any, invoice: any): boolean;
}
export declare class UserPolicy {
    static sanitize(userResponse: any): any;
}
