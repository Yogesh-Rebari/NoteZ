const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { checkAIAccess } = require('../middleware/permissions');
const { validateAIRequest } = require('../middleware/validation');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * @route   GET /api/ai/status
 * @desc    Get AI service status and available features
 * @access  Private
 */
router.get('/status', aiController.getAIStatus);

/**
 * @route   POST /api/ai/chat/:groupId
 * @desc    Generate AI chat response
 * @access  Private (Group members only)
 */
router.post('/chat/:groupId', 
  checkAIAccess,
  validateAIRequest('chat'),
  aiController.generateChatResponse
);

/**
 * @route   POST /api/ai/summary/:noteId
 * @desc    Generate note summary using AI
 * @access  Private (Note access required)
 */
router.post('/summary/:noteId',
  validateAIRequest('summary'),
  aiController.generateNoteSummary
);

/**
 * @route   POST /api/ai/quiz/:noteId
 * @desc    Generate quiz questions from note
 * @access  Private (Note access required)
 */
router.post('/quiz/:noteId',
  validateAIRequest('quiz'),
  aiController.generateQuizQuestions
);

/**
 * @route   POST /api/ai/keywords/:noteId
 * @desc    Extract keywords from note
 * @access  Private (Note access required)
 */
router.post('/keywords/:noteId',
  validateAIRequest('keywords'),
  aiController.extractKeywords
);

/**
 * @route   POST /api/ai/sentiment/:noteId
 * @desc    Analyze note sentiment
 * @access  Private (Note access required)
 */
router.post('/sentiment/:noteId',
  validateAIRequest('sentiment'),
  aiController.analyzeSentiment
);

/**
 * @route   POST /api/ai/suggestions/:groupId
 * @desc    Generate study suggestions
 * @access  Private (Group members only)
 */
router.post('/suggestions/:groupId',
  checkAIAccess,
  validateAIRequest('suggestions'),
  aiController.generateStudySuggestions
);

/**
 * @route   POST /api/ai/improvements/:noteId
 * @desc    Generate note improvement suggestions
 * @access  Private (Note access required)
 */
router.post('/improvements/:noteId',
  validateAIRequest('improvements'),
  aiController.generateNoteImprovements
);

/**
 * @route   POST /api/ai/process/:noteId
 * @desc    Process note with multiple AI operations
 * @access  Private (Note access required)
 */
router.post('/process/:noteId',
  validateAIRequest('process'),
  aiController.processNoteWithAI
);

module.exports = router;
