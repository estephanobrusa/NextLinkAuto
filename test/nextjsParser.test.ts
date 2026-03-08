import { fileToRoute } from '../src/utils/routeUtils';

describe('fileToRoute', () => {
  const cases = [
    ['app/page.tsx', '/'],
    ['app/dashboard/page.tsx', '/dashboard'],
    ['app/blog/[slug]/page.tsx', '/blog/[slug]'],
    ['app/(admin)/page.tsx', '/'],
    ['app/_private/page.tsx', null],
    ['pages/index.tsx', '/'],
    ['pages/about.tsx', '/about'],
    ['pages/blog/[slug].tsx', '/blog/[slug]'],
    ['pages/_app.tsx', null],
    ['src/app/(group)/page.tsx', '/'],
    ['src/pages/foo.tsx', '/foo'],
    ['src/pages/blog/[...slug].tsx', '/blog/[...slug]'],
    // Route groups: segment is stripped, route is kept
    ['app/(marketing)/about/page.tsx', '/about'],
    ['app/(auth)/(admin)/dashboard/page.tsx', '/dashboard'],
    ['src/app/(group)/settings/page.tsx', '/settings'],
    // Files outside app/ and pages/ should NOT produce routes
    ['components/Button.tsx', null],
    ['lib/utils.ts', null],
    ['src/components/Header.tsx', null],
    ['src/lib/api/client.ts', null],
    ['utils/helpers.js', null],
    ['public/favicon.ico', null],
    ['styles/global.css', null],
    ['next.config.js', null],
  ];
  cases.forEach(([input, expected]) => {
    it(`fileToRoute('${input}') -> ${expected}`, () => {
      const result = fileToRoute(input as string);
      console.log(`fileToRoute('${input}') =`, result);
      expect(result).toBe(expected);
    });
  });
});
