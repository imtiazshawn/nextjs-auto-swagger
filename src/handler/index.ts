import * as fs from 'fs';
import * as path from 'path';
import { APIRouteScanner } from '../scanner';
import { OpenAPIGenerator } from '../generator';
import { SwaggerConfig } from '../types';

export function createSwaggerHandler(config: SwaggerConfig = {}) {
  return {
    async GET(request: Request) {
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Check if this is a request for OpenAPI JSON spec
      // Support: ?format=json, ?spec=json, ?openapi=json
      const isJsonRequest = searchParams.get('format') === 'json' || 
                           searchParams.get('spec') === 'json' ||
                           searchParams.get('openapi') === 'json';

      if (isJsonRequest) {
        try {
          const appDir = path.join(process.cwd(), 'app');
          const scanner = new APIRouteScanner(appDir, config);
          const routes = await scanner.scanRoutes();
          
          const generator = new OpenAPIGenerator(config);
          const spec = generator.generateSpec(routes);

          return new Response(JSON.stringify(spec, null, 2), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
          });
        } catch (error) {
          console.error('Failed to generate OpenAPI spec:', error);
          return new Response(JSON.stringify({ 
            error: 'Failed to generate API documentation',
            message: error instanceof Error ? error.message : 'Unknown error'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }

      // Serve Swagger UI HTML by default
      const specUrl = url.origin + url.pathname + '?format=json';
      const swaggerUIHTML = generateSwaggerUIHTML(specUrl);
      
      return new Response(swaggerUIHTML, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        },
      });
    }
  };
}

function generateSwaggerUIHTML(specUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      console.log('Loading Swagger UI from:', '${specUrl}');
      
      const ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        onComplete: function() {
          console.log('Swagger UI loaded successfully');
        },
        onFailure: function(error) {
          console.error('Failed to load Swagger UI:', error);
          document.getElementById('swagger-ui').innerHTML = 
            '<div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">' +
            '<h2 style="color: #d32f2f;">Failed to load API specification</h2>' +
            '<p>Could not load OpenAPI spec from: <code>${specUrl}</code></p>' +
            '<p>Check the browser console for more details.</p>' +
            '<button onclick="location.reload()" style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>' +
            '</div>';
        }
      });
    };
  </script>
</body>
</html>`;
}