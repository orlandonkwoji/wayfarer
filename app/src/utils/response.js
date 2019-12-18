const successResponse = (res, code, data, status = 'success') =>
  res.status(code).json({
    status,
    data,
  });

const badRequestResponse = (res, error, status = 'error') =>
  res.status(400).json({
    status,
    error: error || 'Bad request',
  });

const unauthorizedResponse = (res, error, status = 'error') =>
  res.status(401).json({
    status,
    error: error || 'Unauthorized',
  });

const forbiddenResponse = (res, error, status = 'error') =>
  res.status(403).json({
    status,
    error: error || 'Forbidden',
  });

const nullResponse = (res, error, status = 'error') =>
  res.status(404).json({
    status,
    error: error || 'NOT FOUND',
  });

const conflictResponse = (res, error, status = 'error') =>
  res.status(409).json({
    status,
    error: error || 'Conflict',
  });

const internalErrREesponse = (res, error, status = 'error') =>
  res.status(500).json({
    status,
    error: error || 'Internal Server Error',
  });

export {
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  nullResponse,
  conflictResponse,
  successResponse,
  internalErrREesponse,
};
