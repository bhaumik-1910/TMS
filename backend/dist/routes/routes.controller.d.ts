import { RoutesService } from './routes.service';
export declare class RoutesController {
    private routesService;
    constructor(routesService: RoutesService);
    findAll(orgId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(orgId: string, body: any): Promise<any>;
}
