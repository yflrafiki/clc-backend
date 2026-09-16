module.exports = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
  });
};
