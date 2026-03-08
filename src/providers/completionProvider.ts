import * as vscode from 'vscode';
import { getRouteCache } from './routeProvider';

export function provideRouteCompletions(): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(document, position, token, context) {
      const line = document.lineAt(position).text;
      const char = position.character;
      const textBefore = line.substring(0, char);

      console.log('[nextjs-route-autocomplete] ─── Completion Request ───');
      console.log('[nextjs-route-autocomplete] Trigger kind:', context.triggerKind, '| Trigger char:', JSON.stringify(context.triggerCharacter));
      console.log('[nextjs-route-autocomplete] Full line:', JSON.stringify(line));
      console.log('[nextjs-route-autocomplete] Text before cursor:', JSON.stringify(textBefore));

      const triggerPatterns = [
        /router\.(push|replace|prefetch)\s*\(\s*\{?\s*['"`]/,
        /useRouter\(\)\.(push|replace|prefetch)\s*\(\s*\{?\s*['"`]/,
        /<Link[^>]*href=\{?\s*['"`]/,
        /redirect\s*\(\s*\{?\s*['"`]/,
        /notFound\s*\(\s*\{?\s*['"`]/
      ];
      const matchedPattern = triggerPatterns.find((re) => re.test(line));
      const isRouteContext = !!matchedPattern;

      console.log('[nextjs-route-autocomplete] Route context?', isRouteContext, matchedPattern ? `(matched: ${matchedPattern})` : '(no pattern matched)');

      if (!isRouteContext) {
        console.log('[nextjs-route-autocomplete] ✗ Skipped — not a route context. VS Code native suggestions will show instead.');
        return undefined;
      }
      const routes = getRouteCache();
      console.log('[nextjs-route-autocomplete] ✓ Returning', routes.length, 'routes:', routes);
      // Detect if user already typed "/" before cursor to avoid double slash
      const hasLeadingSlash = /['"`]\/$/.test(textBefore);

      return routes.map((route, i) => {
        const item = new vscode.CompletionItem(route, vscode.CompletionItemKind.Value);
        item.sortText = `\0${String(i).padStart(4, '0')}`;
        item.filterText = route;
        if (route === '/') {
          item.preselect = true;
        }

        let insert = route;
        const isDynamic = /\[.*\]/.test(route);
        if (isDynamic) {
          // Step 1: Optional catch-all [[...param]] → [param]
          insert = insert.replace(/\[\[\.\.\.(.+?)\]\]/g, '[$1]');
          // Step 2: Catch-all [...param] → [param]
          insert = insert.replace(/\[\.\.\.(.+?)\]/g, '[$1]');
          // Step 3: Dynamic segment [param] → ${param}
          insert = insert.replace(/\[(.+?)\]/g, '\\${$1}');
          item.detail = 'Dynamic route';
        } else {
          item.detail = 'Static route';
        }

        // Avoid double "//" when user already typed "/"
        if (hasLeadingSlash && insert.startsWith('/')) {
          insert = insert.slice(1);
        }

        // Dynamic routes need backticks for template literal interpolation
        if (isDynamic) {
          // Find the opening quote position and replace it + content with backtick-wrapped string
          const quoteMatch = textBefore.match(/(['"`])\s*\/?$/);
          if (quoteMatch) {
            const quoteChar = quoteMatch[1];
            const quoteOffset = textBefore.lastIndexOf(quoteChar);
            // Find the closing quote after cursor
            const textAfter = line.substring(char);
            const closeIdx = textAfter.indexOf(quoteChar);
            const startPos = new vscode.Position(position.line, quoteOffset);
            const endPos = closeIdx >= 0
              ? new vscode.Position(position.line, char + closeIdx + 1)
              : position;
            item.range = new vscode.Range(startPos, endPos);
            insert = `\`${insert}\``;
          }
        }

        item.insertText = insert;
        item.documentation = `Route: ${route}`;
        return item;
      });
    },
  };
}
