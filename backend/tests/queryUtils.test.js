const test = require('node:test');
const assert = require('node:assert/strict');
const {
  escapeRegex,
  parsePagination,
  parseSort,
  applyDateRange,
  formatPaginatedResponse,
  paginate
} = require('../shared/database/queryUtils');

test('QUERY UTILS: escapeRegex escapes special characters safely', () => {
  assert.equal(escapeRegex('Lake Tana (Monastery) & Boats [V1]'), 'Lake Tana \\(Monastery\\) & Boats \\[V1\\]');
  assert.equal(escapeRegex('price+$100?'), 'price\\+\\$100\\?');
  assert.equal(escapeRegex(''), '');
  assert.equal(escapeRegex(null), '');
  assert.equal(escapeRegex(123), '');
});

test('QUERY UTILS: parsePagination sanitizes page, limit, and calculates skip', () => {
  // Default values
  const def = parsePagination({});
  assert.equal(def.page, 1);
  assert.equal(def.limit, 10);
  assert.equal(def.skip, 0);

  // Custom valid params
  const valid = parsePagination({ page: '3', limit: '25' });
  assert.equal(valid.page, 3);
  assert.equal(valid.limit, 25);
  assert.equal(valid.skip, 50);

  // Enforces maxLimit and negative/zero fallbacks
  const clamped = parsePagination({ page: '-5', limit: '500' }, { maxLimit: 50 });
  assert.equal(clamped.page, 1);
  assert.equal(clamped.limit, 50);
  assert.equal(clamped.skip, 0);
});

test('QUERY UTILS: parseSort handles aliases and enforces field whitelists', () => {
  // Common aliases
  assert.deepEqual(parseSort('price-low'), { price: 1 });
  assert.deepEqual(parseSort('price-high'), { price: -1 });
  assert.deepEqual(parseSort('rating'), { rating: -1 });
  assert.deepEqual(parseSort('newest'), { createdAt: -1 });
  assert.deepEqual(parseSort('oldest'), { createdAt: 1 });

  // Comma-separated multi-sort with whitelist
  const allowed = ['price', 'rating', 'createdAt'];
  assert.deepEqual(
    parseSort('-price,rating:asc,forbiddenField', allowed),
    { price: -1, rating: 1 }
  );

  // Non-whitelisted field falls back to defaultSort
  assert.deepEqual(
    parseSort('maliciousInternalField', allowed, { createdAt: -1 }),
    { createdAt: -1 }
  );

  // Object sort
  assert.deepEqual(
    parseSort({ price: -1, unauthorized: 1 }, allowed),
    { price: -1 }
  );
});

test('QUERY UTILS: applyDateRange adds boundary conditions safely', () => {
  const baseFilter = { status: 'confirmed' };
  const result = applyDateRange(
    baseFilter,
    'date',
    '2026-01-01T00:00:00.000Z',
    '2026-12-31T23:59:59.999Z'
  );

  assert.equal(result.status, 'confirmed');
  assert.ok(result.date.$gte instanceof Date);
  assert.ok(result.date.$lte instanceof Date);

  // Ignores invalid dates gracefully
  const invalidFilter = applyDateRange({ category: 'boat' }, 'createdAt', 'not-a-date');
  assert.equal(invalidFilter.createdAt, undefined);
});

test('QUERY UTILS: formatPaginatedResponse creates standard payload', () => {
  const items = [{ id: 1 }, { id: 2 }];
  const res = formatPaginatedResponse(items, 15, 2, 5);

  assert.equal(res.success, true);
  assert.equal(res.count, 2);
  assert.equal(res.total, 15);
  assert.equal(res.page, 2);
  assert.equal(res.totalPages, 3);
  assert.equal(res.limit, 5);
  assert.equal(res.pagination.hasNextPage, true);
  assert.equal(res.pagination.hasPrevPage, true);
  assert.equal(res.pagination.nextPage, 3);
  assert.equal(res.pagination.prevPage, 1);
});

test('QUERY UTILS: paginate executes count and query with populate and search', async () => {
  let executedFilter = null;
  let executedSort = null;
  let executedSkip = null;
  let executedLimit = null;
  let populatedPaths = [];

  const fakeModel = {
    countDocuments: async (f) => {
      executedFilter = f;
      return 25;
    },
    find: (f) => {
      executedFilter = f;
      const queryObj = {
        sort: (s) => { executedSort = s; return queryObj; },
        skip: (sk) => { executedSkip = sk; return queryObj; },
        limit: (l) => { executedLimit = l; return queryObj; },
        select: () => queryObj,
        populate: (p) => { populatedPaths.push(p); return queryObj; },
        exec: async () => [{ id: 'svc1' }, { id: 'svc2' }]
      };
      return queryObj;
    }
  };

  const result = await paginate(fakeModel, {
    filter: { status: 'published' },
    query: { page: '2', limit: '5', search: 'Zege Monastery' },
    searchFields: ['title', 'description'],
    allowedSortFields: ['price', 'createdAt'],
    sort: 'price-low',
    populate: 'vendor'
  });

  assert.equal(result.success, true);
  assert.equal(result.total, 25);
  assert.equal(result.page, 2);
  assert.equal(result.limit, 5);
  assert.equal(result.totalPages, 5);
  assert.equal(executedSkip, 5);
  assert.equal(executedLimit, 5);
  assert.deepEqual(executedSort, { price: 1 });
  assert.equal(executedFilter.status, 'published');
  assert.ok(executedFilter.$or.length === 2);
  assert.deepEqual(populatedPaths, ['vendor']);
});
