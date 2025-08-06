import { OpenAPISpec, APIRouteInfo, SwaggerConfig } from '../types';

export class OpenAPIGenerator {
  private config: SwaggerConfig;

  constructor(config: SwaggerConfig = {}) {
    this.config = config;
  }

  generateSpec(routes: APIRouteInfo[]): OpenAPISpec {
    const spec: OpenAPISpec = {
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

  private addRouteToSpec(spec: OpenAPISpec, route: APIRouteInfo): void {
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

  private extractTagFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    return segments[1] || 'api';
  }
}