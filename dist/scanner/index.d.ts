import { APIRouteInfo, SwaggerConfig } from '../types';
export declare class APIRouteScanner {
    private appDir;
    private config;
    constructor(appDir: string, config?: SwaggerConfig);
    scanRoutes(): Promise<APIRouteInfo[]>;
    private scanDirectory;
    private analyzeRouteFile;
    private extractHTTPMethods;
    private extractJSDocComments;
    private extractParameters;
    private extractResponses;
}
//# sourceMappingURL=index.d.ts.map