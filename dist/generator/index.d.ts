import { OpenAPISpec, APIRouteInfo, SwaggerConfig } from '../types';
export declare class OpenAPIGenerator {
    private config;
    constructor(config?: SwaggerConfig);
    generateSpec(routes: APIRouteInfo[]): OpenAPISpec;
    private addRouteToSpec;
    private extractTagFromPath;
}
//# sourceMappingURL=index.d.ts.map