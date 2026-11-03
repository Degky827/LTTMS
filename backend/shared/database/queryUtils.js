/**
 * Reusable Query, Pagination, Filtering, and Search Utilities
 * Lake Tana Tourism Management System (LTTMS V1)
 */

/**
 * Escape special regex characters to prevent ReDoS and unintentional pattern matching
 * @param {string} text - Unsanitized search string
 * @returns {string} - Escaped regex string safe for new RegExp()
 */
function escapeRegex(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Standardize and validate pagination parameters from request query
 * @param {Object} query - Express req.query
 * @param {Object} defaults - Configurable defaults
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query = {}, defaults = {}) {
  const defaultPage = defaults.defaultPage || 1;
  const defaultLimit = defaults.defaultLimit || 10;
  const maxLimit = defaults.maxLimit || 100;

  const rawPage = parseInt(query.page, 10);
  const rawLimit = parseInt(query.limit, 10);

  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : defaultPage;
  const limit = Number.isInteger(rawLimit) && rawLimit >= 1
    ? Math.min(rawLimit, maxLimit)
    : defaultLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Parse and sanitize sort parameter against a whitelist of allowed fields
 * @param {string|Object} sortParam - Sort input from query (e.g. '-createdAt', 'price:asc', 'price-low')
 * @param {string[]} allowedFields - Whitelist of allowed field names
 * @param {Object} defaultSort - Fallback sort object (default: { createdAt: -1 })
 * @returns {Object} - MongoDB sort specification
 */
function parseSort(sortParam, allowedFields = [], defaultSort = { createdAt: -1 }) {
  if (!sortParam) return defaultSort;

  // Handle common friendly sort aliases
  if (sortParam === 'price-low' || sortParam === 'price_asc') return { price: 1 };
  if (sortParam === 'price-high' || sortParam === 'price_desc') return { price: -1 };
  if (sortParam === 'rating' || sortParam === 'rating-high') return { rating: -1 };
  if (sortParam === 'oldest') return { createdAt: 1 };
  if (sortParam === 'newest') return { createdAt: -1 };

  // If already an object
  if (typeof sortParam === 'object' && !Array.isArray(sortParam)) {
    const sanitized = {};
    for (const [key, val] of Object.entries(sortParam)) {
      if (allowedFields.length === 0 || allowedFields.includes(key)) {
        sanitized[key] = val === -1 || val === '-1' || val === 'desc' ? -1 : 1;
      }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : defaultSort;
  }

  if (typeof sortParam !== 'string') return defaultSort;

  const sortObj = {};
  const tokens = sortParam.split(',').map(s => s.trim()).filter(Boolean);

  for (const token of tokens) {
    let field = token;
    let order = 1;

    if (field.startsWith('-')) {
      order = -1;
      field = field.substring(1);
    } else if (field.endsWith(':desc')) {
      order = -1;
      field = field.replace(/:desc$/, '');
    } else if (field.endsWith(':asc')) {
      order = 1;
      field = field.replace(/:asc$/, '');
    }

    if (allowedFields.length === 0 || allowedFields.includes(field)) {
      sortObj[field] = order;
    }
  }

  return Object.keys(sortObj).length > 0 ? sortObj : defaultSort;
}

/**
 * Apply safe date range filter to a MongoDB query filter object
 * @param {Object} filter - Query filter accumulator
 * @param {string} field - Date field name in model (e.g. 'createdAt', 'date')
 * @param {string|Date} startDate - Start date bound
 * @param {string|Date} endDate - End date bound
 */
function applyDateRange(filter, field = 'createdAt', startDate, endDate) {
  if (!startDate && !endDate) return filter;

  const range = {};
  if (startDate) {
    const from = new Date(startDate);
    if (!Number.isNaN(from.getTime())) {
      range.$gte = from;
    }
  }
  if (endDate) {
    const to = new Date(endDate);
    if (!Number.isNaN(to.getTime())) {
      range.$lte = to;
    }
  }

  if (Object.keys(range).length > 0) {
    filter[field] = Object.assign(filter[field] || {}, range);
  }

  return filter;
}

/**
 * Format standard pagination response payload
 * @param {Array} items - Retrieved document records
 * @param {number} total - Total matching records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Standardized response JSON structure
 */
function formatPaginatedResponse(items, total, page, limit) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return {
    success: true,
    count: items.length,
    total,
    page,
    totalPages,
    limit,
    data: items,
    pagination: {
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
}

/**
 * Execute a standard paginated query against a Mongoose model
 * @param {import('mongoose').Model} model - Mongoose model
 * @param {Object} options - Query execution options
 * @returns {Promise<Object>} - Formatted paginated response
 */
async function paginate(model, options = {}) {
  const {
    filter = {},
    query = {},
    allowedSortFields = [],
    defaultSort = { createdAt: -1 },
    populate = null,
    select = null,
    searchFields = [],
    search = null
  } = options;

  // Clone base filter
  const finalFilter = Object.assign({}, filter);

  // Parse pagination params
  const { page, limit, skip } = parsePagination(query, {
    defaultLimit: options.defaultLimit || 10,
    maxLimit: options.maxLimit || 100
  });

  // Apply search keyword across specified text fields if provided
  const searchKeyword = search || query.search;
  if (searchKeyword && typeof searchKeyword === 'string' && searchKeyword.trim()) {
    const trimmed = searchKeyword.trim();
    if (searchFields.length > 0) {
      const escaped = escapeRegex(trimmed);
      const searchRegex = new RegExp(escaped, 'i');
      finalFilter.$or = searchFields.map(f => ({ [f]: searchRegex }));
    } else {
      // Default to MongoDB text index if no individual fields are specified
      finalFilter.$text = { $search: trimmed };
    }
  }

  // Parse sort parameters
  const sortParam = query.sortBy || query.sort || options.sort;
  const sort = parseSort(sortParam, allowedSortFields, defaultSort);

  // Parallel count and document query
  const [total, data] = await Promise.all([
    model.countDocuments(finalFilter),
    (async () => {
      let q = model.find(finalFilter).sort(sort).skip(skip).limit(limit);
      if (select) q = q.select(select);
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(p => { q = q.populate(p); });
        } else {
          q = q.populate(populate);
        }
      }
      return await q.exec();
    })()
  ]);

  return formatPaginatedResponse(data, total, page, limit);
}

module.exports = {
  escapeRegex,
  parsePagination,
  parseSort,
  applyDateRange,
  formatPaginatedResponse,
  paginate
};
