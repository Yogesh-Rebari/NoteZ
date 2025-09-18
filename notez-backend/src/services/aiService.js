const OpenAI = require('openai');
const Note = require('../models/Note');
const Group = require('../models/Group');
const { AppError } = require('../utils/helpers');

/**
 * AI Service for NoteZ chatbot integration
 * Handles OpenAI API interactions and AI-powered features
 */
class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.personalities = {
      helpful: {
        system: "You are a helpful study assistant for NoteZ. You help students with their notes, provide summaries, answer questions, and create study materials. Be encouraging and educational.",
        temperature: 0.7
      },
      casual: {
        system: "You are a friendly, casual study buddy for NoteZ. You help with notes and studying but in a relaxed, conversational way. Use emojis occasionally and be approachable.",
        temperature: 0.8
      },
      professional: {
        system: "You are a professional academic assistant for NoteZ. You provide detailed, accurate information and maintain a formal tone. Focus on academic excellence and thorough explanations.",
        temperature: 0.5
      },
      creative: {
        system: "You are a creative study assistant for NoteZ. You help students learn through creative methods, analogies, and engaging explanations. Make learning fun and memorable.",
        temperature: 0.9
      }
    };
  }

  /**
   * Generate AI response for chat
   */
  async generateChatResponse(userMessage, context = {}) {
    try {
      const { userId, groupId, personality = 'helpful', studyMode = false } = context;
      
      // Get group context if available
      let groupContext = '';
      if (groupId) {
        const group = await Group.findById(groupId);
        if (group) {
          groupContext = `\nGroup Context: ${group.name} - ${group.description}`;
        }
      }

      // Get recent notes for context
      let notesContext = '';
      if (groupId) {
        const recentNotes = await Note.find({ group: groupId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title content category tags');
        
        if (recentNotes.length > 0) {
          notesContext = '\nRecent Notes Context:\n';
          recentNotes.forEach(note => {
            notesContext += `- ${note.title} (${note.category}): ${note.content.substring(0, 200)}...\n`;
          });
        }
      }

      const personalityConfig = this.personalities[personality] || this.personalities.helpful;
      
      const systemPrompt = `${personalityConfig.system}${groupContext}${notesContext}
      
      Study Mode: ${studyMode ? 'ON - Focus on educational content, provide detailed explanations, and suggest study techniques.' : 'OFF - Provide general assistance.'}

      Guidelines:
      - Keep responses concise but helpful
      - If asked about specific notes, reference them appropriately
      - Suggest study techniques when relevant
      - Be encouraging and supportive
      - If you don't know something, say so honestly`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: personalityConfig.temperature,
        max_tokens: 500
      });

      return {
        message: response.choices[0].message.content,
        personality,
        studyMode,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI chat response error:', error);
      throw new AppError('Failed to generate AI response', 500);
    }
  }

  /**
   * Generate note summary
   */
  async generateNoteSummary(noteId) {
    try {
      const note = await Note.findById(noteId);
      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a study assistant. Create a concise, well-structured summary of the provided note content. Focus on key points, main concepts, and important details. Use bullet points for clarity."
          },
          {
            role: "user",
            content: `Please summarize this note:\n\nTitle: ${note.title}\n\nContent: ${note.content}`
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      const summary = response.choices[0].message.content;
      
      // Update note with AI summary
      note.aiSummary = summary;
      await note.save();

      return {
        summary,
        noteId: note._id,
        title: note.title
      };
    } catch (error) {
      console.error('AI summary error:', error);
      throw new AppError('Failed to generate note summary', 500);
    }
  }

  /**
   * Generate quiz questions from note
   */
  async generateQuizQuestions(noteId, difficulty = 'medium', count = 5) {
    try {
      const note = await Note.findById(noteId);
      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const difficultyPrompts = {
        easy: "Create easy questions that test basic understanding and recall.",
        medium: "Create medium difficulty questions that test comprehension and application.",
        hard: "Create challenging questions that test analysis, synthesis, and critical thinking."
      };

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a study assistant creating quiz questions. ${difficultyPrompts[difficulty]} 
            
            Return the questions in this exact JSON format:
            {
              "questions": [
                {
                  "question": "Question text here",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": 0,
                  "explanation": "Explanation of the correct answer"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Create ${count} ${difficulty} quiz questions based on this note:\n\nTitle: ${note.title}\n\nContent: ${note.content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const quizData = JSON.parse(response.choices[0].message.content);
      
      // Update note with quiz questions
      note.studyMode.quizQuestions = quizData.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty
      }));
      
      await note.save();

      return {
        questions: quizData.questions,
        noteId: note._id,
        title: note.title,
        difficulty,
        count
      };
    } catch (error) {
      console.error('AI quiz generation error:', error);
      throw new AppError('Failed to generate quiz questions', 500);
    }
  }

  /**
   * Extract keywords from note
   */
  async extractKeywords(noteId) {
    try {
      const note = await Note.findById(noteId);
      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a study assistant. Extract the most important keywords and key phrases from the provided content. Return them as a comma-separated list, maximum 10 items."
          },
          {
            role: "user",
            content: `Extract keywords from this note:\n\nTitle: ${note.title}\n\nContent: ${note.content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      const keywords = response.choices[0].message.content
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      // Update note with AI keywords
      note.aiKeywords = keywords;
      await note.save();

      return {
        keywords,
        noteId: note._id,
        title: note.title
      };
    } catch (error) {
      console.error('AI keyword extraction error:', error);
      throw new AppError('Failed to extract keywords', 500);
    }
  }

  /**
   * Analyze note sentiment
   */
  async analyzeSentiment(noteId) {
    try {
      const note = await Note.findById(noteId);
      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis assistant. Analyze the sentiment of the provided content and return a JSON response with 'sentiment' (positive/neutral/negative) and 'confidence' (0-1)."
          },
          {
            role: "user",
            content: `Analyze the sentiment of this note:\n\nTitle: ${note.title}\n\nContent: ${note.content}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Update note with AI sentiment analysis
      note.aiSentiment = analysis.sentiment;
      note.aiConfidence = analysis.confidence;
      await note.save();

      return {
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        noteId: note._id,
        title: note.title
      };
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
      throw new AppError('Failed to analyze sentiment', 500);
    }
  }

  /**
   * Generate study suggestions
   */
  async generateStudySuggestions(groupId, userId) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new AppError('Group not found', 404);
      }

      // Get user's recent notes
      const recentNotes = await Note.find({
        group: groupId,
        author: userId
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title content category tags');

      if (recentNotes.length === 0) {
        return {
          suggestions: ['Start by creating your first note to get personalized study suggestions!'],
          noteCount: 0
        };
      }

      const notesContext = recentNotes.map(note => 
        `${note.title} (${note.category}): ${note.content.substring(0, 150)}...`
      ).join('\n');

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a study coach. Based on the user's recent notes, provide 5-7 personalized study suggestions. Focus on practical, actionable advice for improving their learning and retention."
          },
          {
            role: "user",
            content: `Based on these recent notes, provide study suggestions:\n\n${notesContext}`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });

      const suggestions = response.choices[0].message.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return {
        suggestions,
        noteCount: recentNotes.length,
        groupName: group.name
      };
    } catch (error) {
      console.error('AI study suggestions error:', error);
      throw new AppError('Failed to generate study suggestions', 500);
    }
  }

  /**
   * Generate note improvement suggestions
   */
  async generateNoteImprovements(noteId) {
    try {
      const note = await Note.findById(noteId);
      if (!note) {
        throw new AppError('Note not found', 404);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a study assistant. Analyze the provided note and suggest specific improvements for better learning, organization, and clarity. Focus on actionable suggestions."
          },
          {
            role: "user",
            content: `Analyze this note and suggest improvements:\n\nTitle: ${note.title}\n\nContent: ${note.content}`
          }
        ],
        temperature: 0.6,
        max_tokens: 300
      });

      const improvements = response.choices[0].message.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-*]\s*/, '').trim());

      return {
        improvements,
        noteId: note._id,
        title: note.title
      };
    } catch (error) {
      console.error('AI note improvements error:', error);
      throw new AppError('Failed to generate note improvements', 500);
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Get available AI features
   */
  getAvailableFeatures() {
    return {
      chat: this.isAvailable(),
      summarization: this.isAvailable(),
      quizGeneration: this.isAvailable(),
      keywordExtraction: this.isAvailable(),
      sentimentAnalysis: this.isAvailable(),
      studySuggestions: this.isAvailable(),
      noteImprovements: this.isAvailable()
    };
  }
}

module.exports = new AIService();
