import { scanNextRoutes } from '../src/utils/nextjsParser';

describe('scanNextRoutes', () => {
  it('should return an array of routes', async () => {
    const routes = await scanNextRoutes();
    expect(Array.isArray(routes)).toBe(true);
  });
});
