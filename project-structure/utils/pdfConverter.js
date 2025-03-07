const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class PDFConverter {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../uploads');
        this.convertedDir = path.join(this.uploadsDir, 'converted');
        this.tempDir = path.join(this.uploadsDir, 'temp');
        
        // Create necessary directories
        [this.uploadsDir, this.convertedDir, this.tempDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async convertToPDFA3(inputBuffer, originalFileName, extractedText = '') {
        try {
            // Create temporary file from buffer
            const tempFilePath = path.join(this.tempDir, originalFileName);
            fs.writeFileSync(tempFilePath, inputBuffer);

            // Generate output filename
            const outputFileName = `${path.parse(originalFileName).name}_${Date.now()}.pdf`;
            const outputPath = path.join(this.convertedDir, outputFileName);

            // Enhanced Ghostscript command for PDF/A-3 conversion with better quality
            const gsCommand = `gs -dPDFA=3 -dBATCH -dNOPAUSE -dQUIET \
                -sProcessColorModel=DeviceRGB -dUseCIEColor \
                -sDEVICE=pdfwrite -dPDFACompatibilityPolicy=1 \
                -dAutoRotatePages=/None \
                -dCompatibilityLevel=1.7 \
                -dPDFSETTINGS=/prepress \
                -dEmbedAllFonts=true \
                -dSubsetFonts=true \
                -dAutoFilterColorImages=false \
                -dAutoFilterGrayImages=false \
                -dColorImageFilter=/FlateEncode \
                -dGrayImageFilter=/FlateEncode \
                -dMonoImageFilter=/FlateEncode \
                -sOutputFile="${outputPath}" "${tempFilePath}"`;

            // Execute conversion
            const { stdout, stderr } = await execPromise(gsCommand);
            
            // Validate the converted file
            if (!fs.existsSync(outputPath)) {
                throw new Error('Conversion failed: Output file not created');
            }

            const isValid = await this.validatePDFA3(outputPath);
            if (!isValid) {
                throw new Error('Conversion failed: Invalid PDF/A-3 format');
            }

            // Clean up temporary file
            fs.unlinkSync(tempFilePath);

            return {
                success: true,
                convertedPath: outputPath,
                fileName: outputFileName,
                stdout,
                stderr
            };
        } catch (error) {
            console.error('PDF/A-3 conversion error:', error);
            throw new Error('Failed to convert file to PDF/A-3 format');
        }
    }

    async validatePDFA3(filePath) {
        try {
            // Use Ghostscript to validate PDF/A compliance
            const validationCommand = `gs -dNODISPLAY -dNOSAFER -dPDFA=3 -dBATCH -dNOPAUSE \
                -dPDFSTOPONERROR -dShowAnnots=false \
                -sFile="${filePath}"`;
            
            await execPromise(validationCommand);
            return true;
        } catch (error) {
            console.error('PDF/A-3 validation error:', error);
            return false;
        }
    }
}

module.exports = new PDFConverter();
