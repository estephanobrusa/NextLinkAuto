import * as vscode from 'vscode';
import { getRouteCache } from './routeProvider';

export function provideRouteCompletions(): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(document, position, token, context) {
      const line = document.lineAt(position).text;
      const triggerPatterns = [
        /router\.(push|replace|prefetch)\s*\(\s*['"`]/,
        /useRouter\(\)\.(push|replace|prefetch)\s*\(\s*['"`]/,
        /<Link[^>]*href=\s*['"`]/,
        /redirect\s*\(\s*['"`]/,
        /notFound\s*\(\s*['"`]/
      ];
      const isRouteContext = triggerPatterns.some((re) => re.test(line));
      if (!isRouteContext) return undefined;
      const routes = getRouteCache();
      console.log('[nextjs-route-autocomplete] Autocomplete triggered. Routes:', routes);
      return routes.map((route) => {
        const item = new vscode.CompletionItem(route, vscode.CompletionItemKind.Value);
        if (/\[.*\]/.test(route)) {
          // Dynamic route: insert with template string
          item.insertText = route.replace(/\[(.+?)\]/g, '\${$1}');
          item.detail = 'Dynamic route';
        } else {
          item.insertText = route;
          item.detail = 'Static route';
        }
        item.documentation = `Route: ${route}`;
        return item;
      });
    },
  };
}
