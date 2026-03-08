import * as vscode from 'vscode';
import fg from 'fast-glob';
import { fileToRoute } from './routeUtils';

const APP_PATTERNS = [
  'app/**/page.{js,jsx,ts,tsx}',
  'src/app/**/page.{js,jsx,ts,tsx}'
];
const PAGES_PATTERNS = [
  'pages/**/*.{js,jsx,ts,tsx}',
  'src/pages/**/*.{js,jsx,ts,tsx}'
];

export async function scanNextRoutes(): Promise<string[]> {
  const wsFolders = vscode.workspace.workspaceFolders;
  if (!wsFolders) return [];
  const root = wsFolders[0].uri.fsPath;
  const files = await fg([...APP_PATTERNS, ...PAGES_PATTERNS], { cwd: root, absolute: false });
  const routes = files
    .map((file) => fileToRoute(file))
    .filter(Boolean) as string[];
  return Array.from(new Set(routes));
}
