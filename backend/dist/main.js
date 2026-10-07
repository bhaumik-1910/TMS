"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_js_1 = require("./app.module.js");
const errors_js_1 = require("./framework/errors.js");
const app_config_js_1 = require("./config/app.config.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    const config = app.get(app_config_js_1.appConfig.KEY);
    app.enableCors({ origin: config.corsOrigins, credentials: false });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) => (0, errors_js_1.fieldErrors)((0, errors_js_1.flattenValidationErrors)(errors)),
    }));
    app.enableShutdownHooks();
    await app.listen(config.port);
}
bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map