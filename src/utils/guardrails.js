// Update your src/utils/guardrails.js file
const tracer = require('./tracer');
const { checkWithGemini } = require('../services/ai/geminiService'); // Import the new function

const checkHallucination = async (rawText, normalizedTests) => {
  tracer.log('GUARDRAIL', 'Starting AI-powered hallucination check.');

  for (const test of normalizedTests) {
    const normalizedName = test.name;

    // A simple, fast check first
    if (rawText.toLowerCase().includes(normalizedName.toLowerCase())) {
      tracer.log('GUARDRAIL', `Exact substring match found for "${normalizedName}".`);
      continue;
    }

    // Now, use the AI to do a semantic check
    const isPlausibleMatch = await checkWithGemini(normalizedName, rawText);

    if (!isPlausibleMatch) {
      tracer.error('GUARDRAIL', `Hallucination detected. Test name "${normalizedName}" is not a plausible match to raw input.`);
      return false;
    }

    tracer.log('GUARDRAIL', `AI confirmed plausible match for "${normalizedName}".`);
  }

  tracer.log('GUARDRAIL', 'No hallucinations detected. All tests traced back to raw input.');
  return true;
};

module.exports = { checkHallucination };