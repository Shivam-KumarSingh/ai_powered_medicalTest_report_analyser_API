const { VertexAI } = require('@google-cloud/vertexai');
const { gcpKeyPath, gcpProjectId, gcpLocation } = require('../../config');
const tracer = require('../../utils/tracer');

// Initialize the Vertex AI client
const vertex_ai = new VertexAI({
  project: gcpProjectId,
  location: gcpLocation,
  // The SDK automatically uses GOOGLE_APPLICATION_CREDENTIALS
});

// A system prompt is sent at the start to define the AI's persona and rules.
// Vertex AI has a dedicated parameter for this.
const systemPrompt = `You are a highly specialized and precise medical data processing AI. Your sole purpose is to convert raw, unstructured medical information into a clean, structured, and consistent JSON format. Your output must be accurate and directly based on the provided input. You are not a doctor and must not provide any medical advice, diagnoses, or interpretations. Your responses must be predictable, reliable, and adhere strictly to the requested output format.`;

const normalizeModel = vertex_ai.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.0,
    responseMimeType: 'application/json', // Ensures raw JSON output
  },
  systemInstruction: systemPrompt, // ✅ Corrected
});

const summaryModel = vertex_ai.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.2,
  },
  systemInstruction: systemPrompt, // ✅ Corrected
});

const normalizeTests = async (rawText) => {
  tracer.log('GEMINI_SERVICE', 'Starting normalization with Vertex AI.');
  const prompt = `### Task Description
Your task is to extract medical test results from the raw text, correct any typos, and format the output as a JSON object.

### Rules and Constraints
1.  **Strict Output Format:** You must respond **ONLY** with a valid JSON object.
2.  **Data Extraction:** Extract the test name, value, unit, status, and reference range.
3.  **Typo Correction:** Correct common typos.
4.  **No Hallucinations:** Do not create or include any test results that are not explicitly mentioned in the input text.
5.  **Confidence Score:** Provide a confidence score (from 0.0 to 1.0) for the normalization task. A score of 1.0 indicates perfect certainty.

### Output Format
The output must be a JSON object with the following structure:
- "tests": An array of JSON objects.
- "tests"[i]": Each object must contain keys: "name", "value", "unit", "status", and "ref_range".
- "normalization_confidence": A float value representing the model's confidence in the output.

### Examples
**Example 1:**
Input: \`CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)\`
Output:
\`\`\`json
{
  "tests": [
    { "name": "Hemoglobin", "value": 10.2, "unit": "g/dL", "status": "low", "ref_range": { "low": 12.0, "high": 15.0 } },
    { "name": "WBC", "value": 11200, "unit": "/uL", "status": "high", "ref_range": { "low": 4000, "high": 11000 } }
  ],
  "normalization_confidence": 0.95
}
\`\`\`
### Input for Normalization
Text: \`${rawText}\``;

  try {
    const result = await normalizeModel.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;
    tracer.log('GEMINI_SERVICE', 'Normalization raw response:', text);
    const json = JSON.parse(text); // No need for cleaning due to 'responseMimeType'
    return {
      tests: json.tests,
      normalizationConfidence: json.normalization_confidence,
    };
  } catch (error) {
    tracer.error('GEMINI_SERVICE', 'Normalization failed.', error);
    throw new Error('Normalization failed. Malformed response or API error.');
  }
};

const generateSummary = async (normalizedTests) => {
  tracer.log('GEMINI_SERVICE', 'Starting summary generation with Vertex AI.');
  const prompt = `### Task Description
Based on the following JSON array of medical test results, provide a high-level summary and detailed, patient-friendly explanations.
### Rules and Constraints
1.  **Strict Output Format:** You must respond **ONLY** with a valid JSON object.
2.  **Summary:** The summary should be a single, concise sentence.
3.  **Explanations:** The explanations should be a bulleted list. Each explanation must be factual and non-diagnostic. Use clear, simple language.
4.  **No Diagnoses:** Do not mention specific diseases or medical conditions.
### Examples
**Example 1:**
Input: \`\`\`json[ { "name": "Hemoglobin", "value": 10.2, "status": "low" }, { "name": "WBC", "value": 11200, "status": "high" } ]\`\`\`
Output: \`\`\`json{ "summary": "Your test results indicate a low hemoglobin level and a high white blood cell count.", "explanations": [ "A low hemoglobin level is a common finding and may be related to conditions like anemia.", "A high white blood cell count can occur when the body is fighting an infection or inflammation." ] }\`\`\`
### Input for Summary Generation
JSON: \`${JSON.stringify(normalizedTests)}\``;

  try {
    const result = await summaryModel.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;
    tracer.log('GEMINI_SERVICE', 'Summary raw response:', text);
    const json = JSON.parse(text);
    const summary = json.summary;
    const explanations = json.explanations;
    return { summary, explanations };
  } catch (error) {
    tracer.error('GEMINI_SERVICE', 'Summary generation failed.', error);
    throw new Error('Summary generation failed. Malformed response or API error.');
  }
};

module.exports = { normalizeTests, generateSummary };