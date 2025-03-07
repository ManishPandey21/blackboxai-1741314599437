const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

class OCRHelper {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
  }

  async convertImageToPDF(imageBuffer) {
    try {
      // Convert image to PNG format for better OCR results
      const pngBuffer = await sharp(imageBuffer)
        .png()
        .toBuffer();

      // Perform OCR
      await this.initialize();
      const { data: { text } } = await this.worker.recognize(pngBuffer);

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Add the original image to the PDF
      const image = await pdfDoc.embedPng(pngBuffer);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });

      // Add OCR text layer
      page.drawText(text, {
        x: 0,
        y: height - 20,
        size: 0, // Hidden text for searchability
        color: rgb(0, 0, 0),
        opacity: 0
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return { pdfBuffer: Buffer.from(pdfBytes), extractedText: text };
    } catch (error) {
      console.error('Error in convertImageToPDF:', error);
      throw error;
    }
  }

  async extractTextFromPDF(pdfBuffer) {
    try {
      // Convert PDF to images
      const images = await this.pdfToImages(pdfBuffer);
      
      // Perform OCR on each image
      await this.initialize();
      let fullText = '';
      
      for (const image of images) {
        const { data: { text } } = await this.worker.recognize(image);
        fullText += text + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error in extractTextFromPDF:', error);
      throw error;
    }
  }

  async pdfToImages(pdfBuffer) {
    try {
      // Use sharp to convert PDF pages to images
      const images = [];
      const image = await sharp(pdfBuffer)
        .png()
        .toBuffer();
      images.push(image);
      return images;
    } catch (error) {
      console.error('Error in pdfToImages:', error);
      throw error;
    }
  }

  async processDocument(fileBuffer, mimeType) {
    try {
      let extractedText = '';
      let processedBuffer = fileBuffer;

      if (mimeType.startsWith('image/')) {
        const { pdfBuffer, extractedText: text } = await this.convertImageToPDF(fileBuffer);
        processedBuffer = pdfBuffer;
        extractedText = text;
      } else if (mimeType === 'application/pdf') {
        extractedText = await this.extractTextFromPDF(fileBuffer);
      }

      return {
        processedBuffer,
        extractedText
      };
    } catch (error) {
      console.error('Error in processDocument:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
      } catch (error) {
        console.error('Error in cleanup:', error);
        throw error;
      }
    }
  }
}

module.exports = new OCRHelper();
