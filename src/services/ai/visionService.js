const vision = require('@google-cloud/vision');
const { gcpKeyPath } = require('../../config');
const tracer = require('../../utils/tracer');

const visionClient = new vision.ImageAnnotatorClient({ keyFilename: gcpKeyPath });

const extractDocumentText = async (fileBuffer) => {
  tracer.log('VISION_SERVICE', 'Starting Document OCR on image buffer.');
  
  const [result] = await visionClient.documentTextDetection({
    image: { content: fileBuffer },
  });

  const fullText = result.fullTextAnnotation.text;
  const pages = result.fullTextAnnotation.pages;

  // This is a more detailed way to get the text, with blocks, paragraphs, and words
  const rawData = [];
  pages.forEach(page => {
    page.blocks.forEach(block => {
      block.paragraphs.forEach(paragraph => {
        const paragraphText = paragraph.words.map(word => {
          return word.symbols.map(s => s.text).join('');
        }).join(' ');
        rawData.push(paragraphText);
      });
    });
  });

  const rawTests = rawData.filter(line => line.trim() !== '');

  tracer.log('VISION_SERVICE', 'Document OCR complete. Raw text:', fullText);
  
  // Note: The OCR confidence score is not directly available for the full text.
  // You would need to aggregate scores from individual words.
  const confidence = 0.9; // A practical placeholder for this project

  return { rawTests, fullText, confidence };
};

module.exports = { extractDocumentText };