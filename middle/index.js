const { verifyAuth, requireRole, requireAdmin, requireTechnician, requireRequester } = require('./authMiddleware');
const { upload, uploadSingleImage, uploadEvidence, uploadDir } = require('./uploadMiddleware');
const { validateComplaintSubmission, validateAssignment, validateFeedback } = require('./validateMiddleware');
const { notFoundHandler, errorHandler } = require('./errorMiddleware');
const { requestLogger } = require('./loggerMiddleware');

module.exports = {
  // Auth & RBAC
  verifyAuth,
  requireRole,
  requireAdmin,
  requireTechnician,
  requireRequester,

  // File Upload
  upload,
  uploadSingleImage,
  uploadEvidence,
  uploadDir,

  // Validation
  validateComplaintSubmission,
  validateAssignment,
  validateFeedback,

  // Error & Lifecycle
  notFoundHandler,
  errorHandler,
  requestLogger
};
