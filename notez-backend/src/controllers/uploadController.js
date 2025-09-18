const uploadService = require('../services/uploadService');
const { AppError, catchAsync } = require('../utils/helpers');
const path = require('path');

/**
 * Upload Controller for file management
 */
class UploadController {
  /**
   * Upload images
   */
  uploadImages = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No images uploaded', 400);
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Process image if it's an image file
        const processedFiles = await uploadService.processImage(file.path, {
          width: 1200,
          height: 1200,
          quality: 80
        });

        const fileInfo = await uploadService.getFileInfo(file.path);

        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: uploadService.getFileUrl(file.filename, 'images'),
          processed: processedFiles.processed ? uploadService.getFileUrl(path.basename(processedFiles.processed), 'images') : null,
          thumbnail: processedFiles.thumbnail ? uploadService.getFileUrl(path.basename(processedFiles.thumbnail), 'images') : null,
          uploadedAt: new Date()
        });
      } catch (error) {
        console.error('Image processing error:', error);
        // Still include the file even if processing failed
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: uploadService.getFileUrl(file.filename, 'images'),
          uploadedAt: new Date(),
          error: 'Processing failed'
        });
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  });

  /**
   * Upload documents
   */
  uploadDocuments = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No documents uploaded', 400);
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileInfo = await uploadService.getFileInfo(file.path);

      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadService.getFileUrl(file.filename, 'documents'),
        uploadedAt: new Date()
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  });

  /**
   * Get file information
   */
  getFileInfo = catchAsync(async (req, res) => {
    const { filename } = req.params;
    
    // Determine file type and path
    const imagePath = path.join(uploadService.uploadDir, 'images', filename);
    const documentPath = path.join(uploadService.uploadDir, 'documents', filename);
    
    let filePath;
    let fileType;
    
    try {
      const fs = require('fs').promises;
      await fs.access(imagePath);
      filePath = imagePath;
      fileType = 'images';
    } catch {
      try {
        await fs.access(documentPath);
        filePath = documentPath;
        fileType = 'documents';
      } catch {
        throw new AppError('File not found', 404);
      }
    }

    const fileInfo = await uploadService.getFileInfo(filePath);

    res.status(200).json({
      status: 'success',
      data: {
        filename,
        type: fileType,
        url: uploadService.getFileUrl(filename, fileType),
        ...fileInfo
      }
    });
  });

  /**
   * Delete file
   */
  deleteFile = catchAsync(async (req, res) => {
    const { filename } = req.params;
    
    // Try to delete from both image and document directories
    const imagePath = path.join(uploadService.uploadDir, 'images', filename);
    const documentPath = path.join(uploadService.uploadDir, 'documents', filename);
    
    const imageDeleted = await uploadService.deleteFile(imagePath);
    const documentDeleted = await uploadService.deleteFile(documentPath);
    
    if (!imageDeleted && !documentDeleted) {
      throw new AppError('File not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  });

  /**
   * Cleanup temporary files
   */
  cleanupTempFiles = catchAsync(async (req, res) => {
    const deletedCount = await uploadService.cleanupTempFiles();

    res.status(200).json({
      status: 'success',
      message: `Cleaned up ${deletedCount} temporary files`
    });
  });
}

module.exports = new UploadController();

