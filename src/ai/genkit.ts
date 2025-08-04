
/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It serves as a central point for Genkit configuration.
 */
import { genkit, type GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This `ai` object will be used throughout the application to define flows, prompts, etc.
export const ai = genkit({
  plugins: [googleAI()],
});
