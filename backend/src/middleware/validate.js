/**
 * Simple request validation helpers.
 * Returns 400 with message if validation fails.
 */
export function requireBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body required' });
  }
  next();
}

export function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === '');
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

export function requireParams(params) {
  return (req, res, next) => {
    const missing = params.filter((p) => !req.params[p]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required params: ${missing.join(', ')}` });
    }
    next();
  };
}
