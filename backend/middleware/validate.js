const validate = (schema) => (req, res, next) => {
  // If schema defines body/params/query top-level structure
  const inputToValidate = schema.shape && (schema.shape.body || schema.shape.params || schema.shape.query)
    ? {
        body: req.body || {},
        params: req.params || {},
        query: req.query || {}
      }
    : req.body;

  const result = schema.safeParse(inputToValidate);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => {
      // Clean up path display (e.g. "body.email" -> "email")
      const pathStr = issue.path.join('.');
      const cleanField = pathStr.startsWith('body.') ? pathStr.replace('body.', '') :
                         pathStr.startsWith('query.') ? pathStr.replace('query.', '') :
                         pathStr.startsWith('params.') ? pathStr.replace('params.', '') : pathStr;
      return {
        field: cleanField || 'root',
        path: pathStr,
        message: issue.message
      };
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      requestId: req.requestId || req.id
    });
  }

  // Populate req.validated
  req.validated = result.data;

  // If validated contains body/query/params objects, synchronize them
  if (result.data && typeof result.data === 'object') {
    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;
  }

  return next();
};

module.exports = validate;
