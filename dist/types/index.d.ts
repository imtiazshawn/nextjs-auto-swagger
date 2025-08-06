export interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description?: string;
    };
    servers: Array<{
        url: string;
        description?: string;
    }>;
    paths: Record<string, any>;
    components?: {
        schemas?: Record<string, any>;
    };
}
export interface APIRouteInfo {
    path: string;
    filePath: string;
    methods: string[];
    parameters?: any[];
    responses?: Record<string, any>;
    summary?: string;
    description?: string;
    tags?: string[];
}
export interface SwaggerConfig {
    title?: string;
    version?: string;
    description?: string;
    basePath?: string;
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    includePatterns?: string[];
    excludePatterns?: string[];
}
//# sourceMappingURL=index.d.ts.map