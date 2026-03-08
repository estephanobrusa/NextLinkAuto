// Utilidades puras para transformar paths de archivos Next.js a rutas
const EXCLUDE = ['_app', '_document', '_error', 'layout', 'template', 'loading', 'not-found', 'head', 'global-error'];

export function fileToRoute(file: string): string | null {
  // Remove extension
  file = file.replace(/\.(js|jsx|ts|tsx)$/, '');

  // Only allow under app/, src/app/, pages/, src/pages/
  let rel = '';
  let isApp = false;
  if (file.startsWith('app/')) {
    rel = file.slice(3).replace(/\/page$/, '');
    isApp = true;
  } else if (file.startsWith('src/app/')) {
    rel = file.slice(7).replace(/\/page$/, '');
    isApp = true;
  } else if (file.startsWith('pages/')) {
    rel = file.slice(5);
    if (rel === 'index') rel = '';
    rel = rel.replace(/\/index$/, '');
  } else if (file.startsWith('src/pages/')) {
    rel = file.slice(9);
    if (rel === 'index') rel = '';
    rel = rel.replace(/\/index$/, '');
  } else {
    return null;
  }

  // Exclude special folders (starting with '(' or '_') and excluded names
  const segments = rel.split('/').filter(Boolean);
  for (const seg of segments) {
    if (seg.startsWith('(') && seg.endsWith(')')) return null; // Ignore group folders
    if (seg.startsWith('_')) return null;
    if (isExcluded(seg)) return null;
  }

  if (rel === '') return '/';
  // Evita doble slash si rel ya empieza con /
  return rel.startsWith('/') ? rel : `/${rel}`;
}

function isExcluded(path: string): boolean {
  return EXCLUDE.some((ex) => path.includes(ex));
}
