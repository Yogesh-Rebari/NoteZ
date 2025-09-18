const aiService = require('../services/aiService');
const Note = require('../models/Note');
const Group = require('../models/Group');
const { AppError, catchAsync } = require('../utils/helpers');

/**
 * AI Controller for chatbot and AI-powered features
 */
class AIController {
  /**
   * Generate AI chat response
   */
  generateChatResponse = catchAsync(async (req, res) => {
    const { message, personality = 'helpful', studyMode = false } = req.body;
    const { groupId } = req.params;
    const userId = req.user.id;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const response = await aiService.generateChatResponse(message, {
      userId,
      groupId,
      personality,
      studyMode
    });

    res.status(200).json({
      status: 'success',
      data: {
        response
      }
    });
  });

  /**
   * Generate note summary
   */
  generateNoteSummary = catchAsync(async (req, res) => {
    const { noteId } = req.params;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const summary = await aiService.generateNoteSummary(noteId);

    res.status(200).json({
      status: 'success',
      data: {
        summary
      }
    });
  });

  /**
   * Generate quiz questions from note
   */
  generateQuizQuestions = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const { difficulty = 'medium', count = 5 } = req.body;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const quiz = await aiService.generateQuizQuestions(noteId, difficulty, count);

    res.status(200).json({
      status: 'success',
      data: {
        quiz
      }
    });
  });

  /**
   * Extract keywords from note
   */
  extractKeywords = catchAsync(async (req, res) => {
    const { noteId } = req.params;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const keywords = await aiService.extractKeywords(noteId);

    res.status(200).json({
      status: 'success',
      data: {
        keywords
      }
    });
  });

  /**
   * Analyze note sentiment
   */
  analyzeSentiment = catchAsync(async (req, res) => {
    const { noteId } = req.params;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const analysis = await aiService.analyzeSentiment(noteId);

    res.status(200).json({
      status: 'success',
      data: {
        analysis
      }
    });
  });

  /**
   * Generate study suggestions
   */
  generateStudySuggestions = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const suggestions = await aiService.generateStudySuggestions(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: {
        suggestions
      }
    });
  });

  /**
   * Generate note improvement suggestions
   */
  generateNoteImprovements = catchAsync(async (req, res) => {
    const { noteId } = req.params;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const improvements = await aiService.generateNoteImprovements(noteId);

    res.status(200).json({
      status: 'success',
      data: {
        improvements
      }
    });
  });

  /**
   * Get AI service status and available features
   */
  getAIStatus = catchAsync(async (req, res) => {
    const features = aiService.getAvailableFeatures();
    const isAvailable = aiService.isAvailable();

    res.status(200).json({
      status: 'success',
      data: {
        available: isAvailable,
        features
      }
    });
  });

  /**
   * Process multiple AI operations on a note
   */
  processNoteWithAI = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const { operations = ['summary', 'keywords', 'sentiment'] } = req.body;

    if (!aiService.isAvailable()) {
      throw new AppError('AI service is not available', 503);
    }

    const results = {};
    const note = await Note.findById(noteId);
    
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    // Process each requested operation
    for (const operation of operations) {
      try {
        switch (operation) {
          case 'summary':
            results.summary = await aiService.generateNoteSummary(noteId);
            break;
          case 'keywords':
            results.keywords = await aiService.extractKeywords(noteId);
            break;
          case 'sentiment':
            results.sentiment = await aiService.analyzeSentiment(noteId);
            break;
          case 'improvements':
            results.improvements = await aiService.generateNoteImprovements(noteId);
            break;
          case 'quiz':
            results.quiz = await aiService.generateQuizQuestions(noteId);
            break;
        }
      } catch (error) {
        console.error(`AI operation ${operation} failed:`, error);
        results[operation] = { error: 'Failed to process' };
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        noteId,
        operations: results
      }
    });
  });
}

module.exports = new AIController();
