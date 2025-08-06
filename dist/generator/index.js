"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAPIGenerator = void 0;
class OpenAPIGenerator {
    constructor(config = {}) {
        this.config = config;
    }
    generateSpec(routes) {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: this.config.title || 'Next.js API Documentation',
                version: this.config.version || '1.0.0',
                description: this.config.description || 'Auto-generated API documentation'
            },
            servers: this.config.servers || [
                {
                    url: 'http://localhost:3000',
                    description: 'Development server'
                }
            ],
            paths: {}
        };
        for (const route of routes) {
            this.addRouteToSpec(spec, route);
        }
        return spec;
    }
    addRouteToSpec(spec, route) {
        if (!spec.paths[route.path]) {
            spec.paths[route.path] = {};
        }
        for (const method of route.methods) {
            spec.paths[route.path][method] = {
                summary: route.summary || `${method.toUpperCase()} ${route.path}`,
                description: route.description || `${method.toUpperCase()} endpoint for ${route.path}`,
                tags: route.tags || [this.extractTagFromPath(route.path)],
                parameters: route.parameters || [],
                responses: route.responses || {
                    '200': {
                        description: 'Successful response'
                    }
                }
            };
        }
    }
    extractTagFromPath(path) {
        const segments = path.split('/').filter(Boolean);
        return segments[1] || 'api';
    }
}
exports.OpenAPIGenerator = OpenAPIGenerator;
//# sourceMappingURL=index.js.map