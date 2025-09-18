const express = require('express');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const uploadService = require('../services/uploadService');

const router = express.Router();

// All upload routes require authentication
router.use(protect);

/**
 * @route   POST /api/uploads/images
 * @desc    Upload images
 * @access  Private
 */
router.post('/images',
  uploadService.getImageUploadMiddleware('images', 5),
  uploadService.validateUploadRequest,
  uploadController.uploadImages
);

/**
 * @route   POST /api/uploads/documents
 * @desc    Upload documents
 * @access  Private
 */
router.post('/documents',
  uploadService.getDocumentUploadMiddleware('documents', 3),
  uploadService.validateUploadRequest,
  uploadController.uploadDocuments
);

/**
 * @route   GET /api/uploads/:filename
 * @desc    Get file information
 * @access  Private
 */
router.get('/:filename', uploadController.getFileInfo);

/**
 * @route   DELETE /api/uploads/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', uploadController.deleteFile);

/**
 * @route   POST /api/uploads/cleanup
 * @desc    Cleanup temporary files
 * @access  Private (Admin only)
 */
router.post('/cleanup', uploadController.cleanupTempFiles);

module.exports = router;

