import * as vscode from 'vscode';
import { scanNextRoutes } from '../utils/nextjsParser';

let routeCache: string[] = [];
let watcher: vscode.FileSystemWatcher | undefined;

export function initRouteWatcher(context: vscode.ExtensionContext, forceRescan = false) {
  if (watcher && !forceRescan) return;
  if (watcher) watcher.dispose();

  // Scan routes initially
  scanAndCacheRoutes();
  console.log('[nextjs-route-autocomplete] Initial route scan started');

  // Watch for changes in /app and /pages
  watcher = vscode.workspace.createFileSystemWatcher('**/{app,pages}/**/*.{js,jsx,ts,tsx}');
  watcher.onDidCreate(() => {
    console.log('[nextjs-route-autocomplete] Route file created');
    scanAndCacheRoutes();
  });
  watcher.onDidDelete(() => {
    console.log('[nextjs-route-autocomplete] Route file deleted');
    scanAndCacheRoutes();
  });
  watcher.onDidChange(() => {
    console.log('[nextjs-route-autocomplete] Route file changed');
    scanAndCacheRoutes();
  });
  context.subscriptions.push(watcher);
  console.log('[nextjs-route-autocomplete] FileSystemWatcher registered');
}

export function disposeRouteWatcher() {
  if (watcher) watcher.dispose();
}

export function getRouteCache(): string[] {
  return routeCache;
}

async function scanAndCacheRoutes() {
  routeCache = await scanNextRoutes();
  console.log('[nextjs-route-autocomplete] Routes scanned:', routeCache);
}
