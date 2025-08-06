import * as path from 'path';

export function isNextJSProject(projectPath: string): boolean {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = require(packageJsonPath);
    return packageJson.dependencies?.next || packageJson.devDependencies?.next;
  } catch {
    return false;
  }
}

export function findAppDirectory(projectPath: string): string | null {
  const appDir = path.join(projectPath, 'app');
  try {
    const fs = require('fs');
    if (fs.existsSync(appDir) && fs.statSync(appDir).isDirectory()) {
      return appDir;
    }
  } catch {
    // Directory doesn't exist
  }
  return null;
}

export function normalizeApiPath(filePath: string, appDir: string): string {
  const relativePath = path.relative(appDir, filePath);
  const pathSegments = relativePath.split(path.sep);
  
  // Remove 'route.ts' or 'route.js' from the end
  if (pathSegments[pathSegments.length - 1].startsWith('route.')) {
    pathSegments.pop();
  }
  
  return '/' + pathSegments.join('/');
}