const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/helpers');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  next();
};

/**
 * Authentication validation
 */
const validateAuth = {
  register: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters')
      .trim(),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters')
      .trim(),
    handleValidationErrors
  ],
  login: [
    body('identifier')
      .notEmpty()
      .withMessage('Email or username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters')
      .trim(),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters')
      .trim(),
    handleValidationErrors
  ],
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    handleValidationErrors
  ]
};

/**
 * Group validation
 */
const validateGroup = {
  updateMember: [
    body('role')
      .notEmpty()
      .isIn(['admin', 'co-admin', 'member'])
      .withMessage('Role must be admin, co-admin, or member'),
    handleValidationErrors
  ],
  create: [
    body('name')
      .isLength({ min: 2, max: 100 })
      .withMessage('Group name must be between 2 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
    body('category')
      .optional()
      .isIn(['academic', 'study', 'project', 'social', 'work', 'other'])
      .withMessage('Invalid category'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    handleValidationErrors
  ],
  update: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Group name must be between 2 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
    body('category')
      .optional()
      .isIn(['academic', 'study', 'project', 'social', 'work', 'other'])
      .withMessage('Invalid category'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    handleValidationErrors
  ],
  invite: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    handleValidationErrors
  ]
};

/**
 * Note validation
 */
const validateNote = {
  addCollaborator: [
    body('collaborator')
      .notEmpty()
      .withMessage('Collaborator is required'),
    handleValidationErrors
  ],
  create: [
    body('title')
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters')
      .trim(),
    body('content')
      .isLength({ min: 1 })
      .withMessage('Content cannot be empty'),
    body('category')
      .optional()
      .isIn(['lecture', 'assignment', 'study-guide', 'summary', 'reference', 'discussion', 'other'])
      .withMessage('Invalid category'),
    handleValidationErrors
  ],
  update: [
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters')
      .trim(),
    body('content')
      .optional()
      .isLength({ min: 1 })
      .withMessage('Content cannot be empty'),
    body('category')
      .optional()
      .isIn(['lecture', 'assignment', 'study-guide', 'summary', 'reference', 'discussion', 'other'])
      .withMessage('Invalid category'),
    handleValidationErrors
  ]
};

/**
 * Chat validation
 */
const validateChatMessage = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
    .trim(),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'system', 'announcement', 'poll'])
    .withMessage('Invalid message type'),
  handleValidationErrors
];

/**
 * AI validation
 */
const validateAIRequest = (type) => {
  const validations = {
    chat: [
      body('message')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters')
        .trim(),
      body('personality')
        .optional()
        .isIn(['helpful', 'casual', 'professional', 'creative'])
        .withMessage('Invalid personality type'),
      handleValidationErrors
    ],

    summary: [
      param('noteId')
        .isMongoId()
        .withMessage('Invalid note ID'),
      handleValidationErrors
    ]
  };

  return validations[type] || [handleValidationErrors];
};

module.exports = {
  handleValidationErrors,
  validateAuth,
  validateGroup,
  validateNote,
  validateChatMessage,
  validateAIRequest
};