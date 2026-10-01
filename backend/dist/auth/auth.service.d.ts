import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModel, AuditLogModel } from '../database/models';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userModel;
    private auditLogModel;
    private jwtService;
    private configService;
    constructor(userModel: typeof UserModel, auditLogModel: typeof AuditLogModel, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, pass: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            phone: any;
            status: any;
            organizationId: any;
            organization: any;
            roles: any;
            permissions: string[];
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
