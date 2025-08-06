import * as fs from 'fs';
import * as path from 'path';
import { APIRouteInfo, SwaggerConfig } from '../types';

export class APIRouteScanner {
  private appDir: string;
  private config: SwaggerConfig;

  constructor(appDir: string, config: SwaggerConfig = {}) {
    this.appDir = appDir;
    this.config = config;
  }

  async scanRoutes(): Promise<APIRouteInfo[]> {
    const apiDir = path.join(this.appDir, 'api');
    
    if (!fs.existsSync(apiDir)) {
      return [];
    }

    const routes: APIRouteInfo[] = [];
    await this.scanDirectory(apiDir, routes, '/api');
    
    return routes;
  }

  private async scanDirectory(dir: string, routes: APIRouteInfo[], basePath: string): Promise<void> {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Handle dynamic routes [param] and [...param]
        const routePath = item.name.startsWith('[') && item.name.endsWith(']')
          ? `${basePath}/{${item.name.slice(1, -1).replace('...', '')}}`
          : `${basePath}/${item.name}`;
        
        await this.scanDirectory(fullPath, routes, routePath);
      } else if (item.name === 'route.ts' || item.name === 'route.js') {
        const routeInfo = await this.analyzeRouteFile(fullPath, basePath);
        if (routeInfo) {
          routes.push(routeInfo);
        }
      }
    }
  }

  private async analyzeRouteFile(filePath: string, routePath: string): Promise<APIRouteInfo | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const methods = this.extractHTTPMethods(content);
      
      if (methods.length === 0) {
        return null;
      }

      const comments = this.extractJSDocComments(content);
      
      return {
        path: routePath,
        filePath,
        methods,
        summary: comments.summary,
        description: comments.description,
        tags: comments.tags,
        parameters: this.extractParameters(routePath, content),
        responses: this.extractResponses(content)
      };
    } catch (error) {
      console.warn(`Failed to analyze route file ${filePath}:`, error);
      return null;
    }
  }

  private extractHTTPMethods(content: string): string[] {
    const methods: string[] = [];
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    
    for (const method of httpMethods) {
      const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'g');
      if (regex.test(content)) {
        methods.push(method.toLowerCase());
      }
    }
    
    return methods;
  }

  private extractJSDocComments(content: string): {
    summary: string;
    description: string;
    tags: string[];
  } {
    const comments = {
      summary: '',
      description: '',
      tags: [] as string[]
    };

    // Extract JSDoc comments
    const jsdocRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
    const matches = content.match(jsdocRegex);
    
    if (matches && matches.length > 0) {
      const comment = matches[0];
      
      // Extract summary (first line)
      const summaryMatch = comment.match(/\*\s*([^@\n]+)/);
      if (summaryMatch) {
        comments.summary = summaryMatch[1].trim();
      }
      
      // Extract tags
      const tagMatches = comment.match(/@(\w+)\s+([^\n@]+)/g);
      if (tagMatches) {
        tagMatches.forEach(tag => {
          const [, tagName, tagValue] = tag.match(/@(\w+)\s+(.+)/) || [];
          if (tagName === 'tag') {
            comments.tags.push(tagValue.trim());
          }
        });
      }
    }

    return comments;
  }

  private extractParameters(routePath: string, content: string): any[] {
    const parameters: any[] = [];
    
    // Extract path parameters
    const pathParamRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = pathParamRegex.exec(routePath)) !== null) {
      parameters.push({
        name: match[1],
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        }
      });
    }
    
    return parameters;
  }

  private extractResponses(content: string): Record<string, any> {
    return {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object'
            }
          }
        }
      },
      '400': {
        description: 'Bad request'
      },
      '500': {
        description: 'Internal server error'
      }
    };
  }
}