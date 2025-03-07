const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const pdfConverter = require('./utils/pdfConverter');
const { analyzeDocumentWithOpenAI } = require('./utils/openaiHelper');
const ocrHelper = require('./utils/ocrHelper');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory storage for documents
const documents = [];

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
};

// Extract text from document using OCR
app.post('/extract-text', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { processedBuffer, extractedText } = await ocrHelper.processDocument(
            req.file.buffer,
            req.file.mimetype
        );

        res.json({
            success: true,
            text: extractedText,
            processedBuffer: processedBuffer.toString('base64')
        });
    } catch (error) {
        next(error);
    }
});

// Analyze document with OpenAI
app.post('/analyze-document', async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'No text provided for analysis'
            });
        }

        const analysis = await analyzeDocumentWithOpenAI(text);
        res.json(analysis);
    } catch (error) {
        next(error);
    }
});

// File upload and conversion endpoint
app.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        // Validate file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Check file size
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 10MB limit'
            });
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Please upload a supported document format.'
            });
        }

        // Validate metadata
        const metadata = req.body;
        const requiredFields = ['incomingOutgoing', 'letterDate', 'letterNumber', 'from', 'to', 'subject', 'summary'];
        const missingFields = requiredFields.filter(field => !metadata[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required metadata fields: ${missingFields.join(', ')}`
            });
        }

        // Process document with OCR if needed
        let fileBuffer = req.file.buffer;
        let extractedText = '';

        try {
            if (req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf') {
                const { processedBuffer, extractedText: text } = await ocrHelper.processDocument(
                    fileBuffer,
                    req.file.mimetype
                );
                fileBuffer = processedBuffer;
                extractedText = text;
            }
        } catch (ocrError) {
            console.error('OCR processing error:', ocrError);
            return res.status(500).json({
                success: false,
                message: 'Failed to process document text. Please try again.'
            });
        }

        // Convert file to PDF/A-3
        let conversionResult;
        try {
            conversionResult = await pdfConverter.convertToPDFA3(
                fileBuffer,
                req.file.originalname,
                extractedText
            );
        } catch (conversionError) {
            console.error('PDF/A-3 conversion error:', conversionError);
            return res.status(500).json({
                success: false,
                message: 'Failed to convert document to PDF/A-3 format. Please try again.'
            });
        }

        // Create document record
        const document = {
            _id: Date.now().toString(),
            fileName: req.file.originalname,
            originalFormat: req.file.mimetype,
            convertedPath: conversionResult.convertedPath,
            extractedText: extractedText,
            metadata: {
                incomingOutgoing: metadata.incomingOutgoing,
                letterDate: new Date(metadata.letterDate),
                letterNumber: metadata.letterNumber,
                from: metadata.from,
                to: metadata.to,
                subject: metadata.subject,
                reference: metadata.reference || '',
                summary: metadata.summary
            },
            uploadedAt: new Date()
        };

        // Store document in memory
        documents.push(document);

        // Return success response
        res.json({
            success: true,
            message: 'File uploaded and converted successfully',
            document: {
                id: document._id,
                fileName: document.fileName,
                previewUrl: `/uploads/converted/${path.basename(conversionResult.convertedPath)}`,
                metadata: document.metadata,
                extractedText: document.extractedText
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get all documents
app.get('/documents', async (req, res, next) => {
    try {
        // Return documents sorted by upload date (newest first)
        const sortedDocuments = documents
            .sort((a, b) => b.uploadedAt - a.uploadedAt)
            .map(doc => ({
                ...doc,
                previewUrl: `/uploads/converted/${path.basename(doc.convertedPath)}`
            }));
        res.json(sortedDocuments);
    } catch (error) {
        next(error);
    }
});

// Cleanup OCR worker on server shutdown
process.on('SIGTERM', async () => {
    await ocrHelper.cleanup();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await ocrHelper.cleanup();
    process.exit(0);
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
