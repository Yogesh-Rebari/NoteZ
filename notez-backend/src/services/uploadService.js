const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../utils/helpers');

/**
 * File Upload Service for NoteZ
 * Handles secure file uploads with validation, processing, and storage
 */
class UploadService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    this.initializeUploadDirectory();
    this.setupMulter();
  }

  /**
   * Initialize upload directory
   */
  async initializeUploadDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'temp'), { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  /**
   * Setup Multer configuration
   */
  setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = this.getUploadPath(file.mimetype);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
      }
    });

    this.upload = multer({
      storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 5 // Maximum 5 files per request
      },
      fileFilter: (req, file, cb) => {
        this.validateFile(file, cb);
      }
    });
  }

  /**
   * Get upload path based on file type
   */
  getUploadPath(mimetype) {
    if (this.allowedImageTypes.includes(mimetype)) {
      return path.join(this.uploadDir, 'images');
    } else if (this.allowedDocumentTypes.includes(mimetype)) {
      return path.join(this.uploadDir, 'documents');
    } else {
      return path.join(this.uploadDir, 'temp');
    }
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const uuid = uuidv4();
    return `${sanitizedName}_${uuid}${ext}`;
  }

  /**
   * Validate uploaded file
   */
  validateFile(file, cb) {
    const allowedTypes = [...this.allowedImageTypes, ...this.allowedDocumentTypes];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        400
      ), false);
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return cb(new AppError(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
        400
      ), false);
    }

    cb(null, true);
  }

  /**
   * Process uploaded image
   */
  async processImage(filePath, options = {}) {
    try {
      const {
        width = 1200,
        height = 1200,
        quality = 80,
        format = 'jpeg'
      } = options;

      const processedPath = filePath.replace(/\.[^/.]+$/, `_processed.${format}`);
      
      await sharp(filePath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(processedPath);

      // Generate thumbnail
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg');
      await sharp(filePath)
        .resize(300, 300, {
          fit: 'cover'
        })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);

      return {
        original: filePath,
        processed: processedPath,
        thumbnail: thumbnailPath
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new AppError('Failed to process image', 500);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      return {
        size: stats.size,
        extension: ext,
        mimeType: this.getMimeType(ext),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      throw new AppError('Failed to get file information', 500);
    }
  }

  /**
   * Get MIME type from extension
   */
  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Delete file
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(filePaths) {
    const results = await Promise.allSettled(
      filePaths.map(filePath => this.deleteFile(filePath))
    );
    
    return results.every(result => result.status === 'fulfilled' && result.value);
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles() {
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      const files = await fs.readdir(tempDir);
      
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Temp file cleanup error:', error);
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(filename, type = 'images') {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  /**
   * Validate file upload request
   */
  validateUploadRequest(req, res, next) {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    // Check total file size
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.maxFileSize * 5) { // 5 files max
      return next(new AppError('Total file size exceeds limit', 400));
    }

    next();
  }

  /**
   * Get upload middleware for different file types
   */
  getUploadMiddleware(fieldName = 'files', maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }

  /**
   * Get single file upload middleware
   */
  getSingleUploadMiddleware(fieldName = 'file') {
    return this.upload.single(fieldName);
  }

  /**
   * Get image upload middleware
   */
  getImageUploadMiddleware(fieldName = 'images', maxCount = 3) {
    return multer({
      storage: multer.diskStorage({
        destination: path.join(this.uploadDir, 'images'),
        filename: (req, file, cb) => {
          const uniqueName = this.generateUniqueFilename(file.originalname);
          cb(null, uniqueName);
        }
      }),
      limits: {
        fileSize: this.maxFileSize,
        files: maxCount
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedImageTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new AppError('Only image files are allowed', 400), false);
        }
      }
    }).array(fieldName, maxCount);
  }

  /**
   * Get document upload middleware
   */
  getDocumentUploadMiddleware(fieldName = 'documents', maxCount = 3) {
    return multer({
      storage: multer.diskStorage({
        destination: path.join(this.uploadDir, 'documents'),
        filename: (req, file, cb) => {
          const uniqueName = this.generateUniqueFilename(file.originalname);
          cb(null, uniqueName);
        }
      }),
      limits: {
        fileSize: this.maxFileSize,
        files: maxCount
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedDocumentTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new AppError('Only document files are allowed', 400), false);
        }
      }
    }).array(fieldName, maxCount);
  }
}

module.exports = new UploadService();
