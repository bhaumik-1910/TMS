import { RouteModel, RouteStopModel } from '../database/models';
export declare class RoutesService {
    private readonly routeModel;
    private readonly routeStopModel;
    constructor(routeModel: typeof RouteModel, routeStopModel: typeof RouteStopModel);
    findAll(organizationId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(organizationId: string, data: any): Promise<any>;
}
