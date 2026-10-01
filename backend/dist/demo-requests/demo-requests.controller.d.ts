import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
export declare class DemoRequestsController {
    private readonly logger;
    createDemoRequest(dto: CreateDemoRequestDto): Promise<{
        success: boolean;
        data: {
            id: string;
            status: string;
            contact: string;
            company: string;
            email: string;
            createdAt: string;
        };
        message: string;
    }>;
}
