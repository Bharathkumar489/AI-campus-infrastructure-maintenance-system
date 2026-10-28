/**
 * Request Validation Middleware
 * Validates payload structures and required fields before reaching API controllers
 */

function validateComplaintSubmission(req, res, next) {
  const { title, description, location } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Complaint title is mandatory.');
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Detailed description of the issue is mandatory.');
  }
  if (!location || typeof location !== 'string' || !location.trim()) {
    errors.push('Campus location / building code is mandatory.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }

  next();
}

function validateAssignment(req, res, next) {
  const { request_id, technician_id } = req.body;
  if (!request_id || !technician_id) {
    return res.status(400).json({
      error: 'Both request_id and technician_id are required for technician assignment.'
    });
  }
  next();
}

function validateFeedback(req, res, next) {
  const { request_id, user_id, rating } = req.body;
  if (!request_id || !user_id) {
    return res.status(400).json({ error: 'request_id and user_id are required for feedback.' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Feedback rating must be an integer between 1 and 5 stars.' });
  }

  next();
}

module.exports = {
  validateComplaintSubmission,
  validateAssignment,
  validateFeedback
};
