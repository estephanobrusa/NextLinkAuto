import { fileToRoute } from '../src/utils/routeUtils';

describe('fileToRoute', () => {
  const cases = [
    ['app/page.tsx', '/'],
    ['app/dashboard/page.tsx', '/dashboard'],
    ['app/blog/[slug]/page.tsx', '/blog/[slug]'],
    ['app/(admin)/page.tsx', null],
    ['app/_private/page.tsx', null],
    ['pages/index.tsx', '/'],
    ['pages/about.tsx', '/about'],
    ['pages/blog/[slug].tsx', '/blog/[slug]'],
    ['pages/_app.tsx', null],
    ['src/app/(group)/page.tsx', null],
    ['src/pages/foo.tsx', '/foo'],
    ['src/pages/blog/[...slug].tsx', '/blog/[...slug]'],
  ];
  cases.forEach(([input, expected]) => {
    it(`fileToRoute('${input}') -> ${expected}`, () => {
      const result = fileToRoute(input as string);
      console.log(`fileToRoute('${input}') =`, result);
      expect(result).toBe(expected);
    });
  });
});
