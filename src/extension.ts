import * as vscode from 'vscode';
import { provideRouteCompletions } from './providers/completionProvider';
import { initRouteWatcher, disposeRouteWatcher } from './providers/routeProvider';


export function activate(context: vscode.ExtensionContext) {
  console.log('[nextjs-route-autocomplete] Activating extension');
  // Initialize route watcher (scans and watches for changes)
  initRouteWatcher(context);
  console.log('[nextjs-route-autocomplete] Route watcher initialized');

  // Register completion provider for relevant languages
  const selector: vscode.DocumentSelector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'typescript', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' },
  ];
  const provider = vscode.languages.registerCompletionItemProvider(
    selector,
    provideRouteCompletions(),
    '"', "'", '/'
  );
  context.subscriptions.push(provider);
  console.log('[nextjs-route-autocomplete] Completion provider registered');

  // Register command to refresh routes manually
  context.subscriptions.push(
    vscode.commands.registerCommand('nextjsRoutes.refreshRoutes', () => {
      vscode.window.showInformationMessage('Refreshing Next.js routes...');
      console.log('[nextjs-route-autocomplete] Refresh routes command triggered');
      initRouteWatcher(context, true);
    })
  );
  console.log('[nextjs-route-autocomplete] Command registered');
}

export function deactivate() {
  disposeRouteWatcher();
}
