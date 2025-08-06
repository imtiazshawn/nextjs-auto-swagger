"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIRouteScanner = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class APIRouteScanner {
    constructor(appDir, config = {}) {
        this.appDir = appDir;
        this.config = config;
    }
    async scanRoutes() {
        const apiDir = path.join(this.appDir, 'api');
        if (!fs.existsSync(apiDir)) {
            return [];
        }
        const routes = [];
        await this.scanDirectory(apiDir, routes, '/api');
        return routes;
    }
    async scanDirectory(dir, routes, basePath) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                // Handle dynamic routes [param] and [...param]
                const routePath = item.name.startsWith('[') && item.name.endsWith(']')
                    ? `${basePath}/{${item.name.slice(1, -1).replace('...', '')}}`
                    : `${basePath}/${item.name}`;
                await this.scanDirectory(fullPath, routes, routePath);
            }
            else if (item.name === 'route.ts' || item.name === 'route.js') {
                const routeInfo = await this.analyzeRouteFile(fullPath, basePath);
                if (routeInfo) {
                    routes.push(routeInfo);
                }
            }
        }
    }
    async analyzeRouteFile(filePath, routePath) {
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
        }
        catch (error) {
            console.warn(`Failed to analyze route file ${filePath}:`, error);
            return null;
        }
    }
    extractHTTPMethods(content) {
        const methods = [];
        const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        for (const method of httpMethods) {
            const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'g');
            if (regex.test(content)) {
                methods.push(method.toLowerCase());
            }
        }
        return methods;
    }
    extractJSDocComments(content) {
        const comments = {
            summary: '',
            description: '',
            tags: []
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
    extractParameters(routePath, content) {
        const parameters = [];
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
    extractResponses(content) {
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
exports.APIRouteScanner = APIRouteScanner;
//# sourceMappingURL=index.js.map