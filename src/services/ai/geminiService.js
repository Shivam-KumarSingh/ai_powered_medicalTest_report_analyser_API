const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../../config');
const tracer = require('../../utils/tracer');

const genAI = new GoogleGenerativeAI(geminiApiKey);

const model = genAI.getGenerativeModel({
  model:"gemini-2.5-flash",
  systemInstruction: `
You are a highly skilled medical data normalization and summarization assistant.
Your role is to accurately extract and correct laboratory test information from text.
Always respond ONLY in valid JSON. Never include markdown, commentary, or code fences.
Be precise, factual, and medically neutral.
  `,
});

const generationConfig = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8196,
  responseMimeType: 'application/json',
};

const cleanJSON = (raw) => raw.replace(/```json|```/g, '').trim();

const normalizeTests = async (rawText) => {
  tracer.log('GEMINI_SERVICE', 'Starting normalization with Gemini.');

  const prompt = `### Task Description
You are a highly capable medical data extraction assistant. Your task is to process raw, messy text from a medical report that has lost its tabular structure due to OCR processing. Your goal is to correctly identify and group the test names, values, units, and reference ranges(fill it if missing) into a clean, structured JSON object.

### Rules and Constraints
1.  **Strict Output Format:** You must respond **ONLY** with a valid JSON object.
2.  **Data Inference:** Use your knowledge and the provided data to correctly correlate test names with their corresponding values and units, even if they appear on separate lines.
3.  **No Hallucinations:** Do not create or include any test results that are not explicitly mentioned in the input text.
4.  **Confidence Score:** Provide a confidence score (from 0.0 to 1.0) for the normalization task. A score of 1.0 indicates perfect certainty.

### Output Format
The output must be a JSON object with the following structure:
- "tests": An array of JSON objects.
- "tests"[i]": Each object must contain keys: "name", "value", "unit", "status", and "ref_range".
- "normalization_confidence": A float value representing the model's confidence in the output.

### Examples

**Example 1 (Handles Multiple Lines and Mismatched Data):**
Input:
\`\`\`
Test Name**Example 1**
Input: CBC: Hemoglobin 10.2 g/dL (Low), WBC 11,200 /uL (High)
Output:
{
  "tests": [
    {"name": "Hemoglobin", "value": 10.2, "unit": "g/dL", "status": "low", "ref_range": {"low": 12.0, "high": 15.0}},
    {"name": "WBC", "value": 11200, "unit": "/uL", "status": "high", "ref_range": {"low": 4000, "high": 11000}}
  ],
  "normalization_confidence": 0.95
}

**Example 2**
Input: Glocose: 95 mg/dl (Nromal). Heamglobin 14.5 g/dL (Normal)
Output:
{
  "tests": [
    {"name": "Glucose", "value": 95, "unit": "mg/dL", "status": "normal", "ref_range": {"low": 70, "high": 100}},
    {"name": "Hemoglobin", "value": 14.5, "unit": "g/dL", "status": "normal", "ref_range": {"low": 12.0, "high": 15.0}}
  ],
  "normalization_confidence": 0.97
}
Values
Units
Reference Range
CBC
bal NBC Count -EDTA
6100
Blood
Cells cu 3500-10000 ITHT
... (rest of the OCR output)
HAEMOGLOBIN - EDTA BLOOD
14.3
gms / dl
11.5-16.5
...
MCH -EDTA BLOOD
36 *
pg
27-32
\`\`\`
Output:
\`\`\`json
{
  "tests": [
    {
      "name": "WBC NBT Count -EDTA",
      "value": 6100,
      "unit": "Cells / cu mm",
      "status": "normal",
      "ref_range": { "low": 3500, "high": 10000 }
    },
    {
      "name": "HAEMOGLOBIN",
      "value": 14.3,
      "unit": "gms / dl",
      "status": "normal",
      "ref_range": { "low": 11.5, "high": 16.5 }
    },
    {
      "name": "MCH",
      "value": 36,
      "unit": "pg",
      "status": "high",
      "ref_range": { "low": 27, "high": 32 }
    }
  ],
  "normalization_confidence": 0.95
}
\`\`\`


### Input for Normalization
Text:
\`\`\`
${rawText}
\`\`\`

IMPORTANT:
Respond ONLY with the JSON object, starting with '{' and ending with '}'.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig,
    });
    const text = result.response.text();

    // Log the exact raw text received for debugging
    tracer.log('GEMINI_SERVICE', 'Normalization raw response:', text);

    // Check if the response is empty or just whitespace
    if (!text || text.trim() === '') {
      throw new Error("Gemini returned an empty response. The input text might be too complex or an API error occurred.");
    }
    
    const cleaned = cleanJSON(text);
    const json = JSON.parse(cleaned);

    return {
      tests: json.tests,
      normalizationConfidence: json.normalization_confidence
    };
  } catch (error) {
    tracer.error('GEMINI_SERVICE', 'Normalization failed.', error);
    throw new Error('Normalization failed. Malformed response or API error.');
  }
};

const generateSummary = async (normalizedTests) => {
  tracer.log('GEMINI_SERVICE', 'Starting summary generation with Gemini.');

  const prompt = `
### CONTEXT
You are generating a brief and patient-friendly explanation of medical test results.

### ROLE
Act as a medical communication assistant that explains test outcomes clearly.

### AUDIENCE
Patients with limited medical knowledge.

### FORMAT
Output JSON strictly in this schema:
{
  "summary": "",
  "explanations": ["", ""]
}

### ONE-SHOT EXAMPLE
Input:
[
  {"name": "Hemoglobin", "value": 10.2, "unit": "g/dL", "status": "low"},
  {"name": "WBC", "value": 11200, "unit": "/uL", "status": "high"}
]
Output:
{
  "summary": "Your results show a low hemoglobin level and a high white blood cell count.",
  "explanations": [
    "Low hemoglobin may relate to anemia.",
    "High WBC can occur with infections."
  ]
}

### INPUT FOR SUMMARY GENERATION
${JSON.stringify(normalizedTests)}

IMPORTANT:
Respond ONLY with the JSON object, starting with '{' and ending with '}'.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig,
    });

    const text = result.response.text();
    tracer.log('GEMINI_SERVICE', 'Summary raw response:', text);

    const cleaned_sum = cleanJSON(text);
    const json = JSON.parse(cleaned_sum);

    return {
      summary: json.summary,
      explanations: json.explanations
    };
  } catch (error) {
    tracer.error('GEMINI_SERVICE', 'Summary generation failed.', error);
    throw new Error('Summary generation failed. Malformed response or API error.');
  }
};
// Add this to your geminiService.js file
const checkWithGemini = async (normalizedName, rawText) => {
  const prompt = `
  You are a medical data validation assistant.
  Your task is to determine if a corrected medical test name is a plausible, common variation or typo of the raw OCR text.
  Respond ONLY with "true" or "false".

  Example 1:
  Raw OCR: bal NBC Count -EDTA
  Corrected Name: WBC NBT Count -EDTA
  Answer: true

  Example 2:
  Raw OCR: Haemooglobin
  Corrected Name: Hemoglobin
  Answer: true

  Example 3:
  Raw OCR: Blood Pressure Reading
  Corrected Name: Glucose
  Answer: false

  Raw OCR: ${rawText}
  Corrected Name: ${normalizedName}
  Answer:
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toLowerCase();
    return text === 'true';
  } catch (error) {
    tracer.error('GEMINI_VALIDATION', 'Gemini validation failed.', error);
    return false; // Fail safe if the API call fails
  }
};

module.exports = { normalizeTests, generateSummary, checkWithGemini };