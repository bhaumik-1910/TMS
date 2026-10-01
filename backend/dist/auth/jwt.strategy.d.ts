import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserModel, OrganizationModel } from '../database/models';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userModel;
    constructor(configService: ConfigService, userModel: typeof UserModel);
    validate(payload: any): Promise<{
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        organizationId: string;
        organization: OrganizationModel;
        roles: any[];
        permissions: string[];
    }>;
}
export {};
