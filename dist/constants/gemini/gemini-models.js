"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compAssessModel = exports.wordFinderModel = exports.randomWordModel = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const gemini_config_1 = require("./gemini-config");
const gemini_response_schema_1 = require("./gemini-response-schema");
const gemini_system_instructions_1 = require("./gemini-system-instructions");
exports.genAI = new generative_ai_1.GoogleGenerativeAI(gemini_config_1.geminiAPIKey);
// Feature: RANDOM-WORD  // ! Just for dev, we'll remove it later
exports.randomWordModel = exports.genAI.getGenerativeModel({
    model: gemini_config_1.geminiModelName,
    systemInstruction: gemini_system_instructions_1.geminiSystemInstructions.randomWordGenerator,
    generationConfig: {
        responseMimeType: gemini_config_1.responseMimeType,
        responseSchema: gemini_response_schema_1.geminiResponseSchema.randomWordGenerator,
    },
});
// Feature: WORD-FINDER
exports.wordFinderModel = exports.genAI.getGenerativeModel({
    model: gemini_config_1.geminiModelName,
    systemInstruction: gemini_system_instructions_1.geminiSystemInstructions.wordFinder,
    generationConfig: {
        responseMimeType: gemini_config_1.responseMimeType,
        responseSchema: gemini_response_schema_1.geminiResponseSchema.wordFinder,
    },
});
// Feature: COMPREHENSION-ASSESSMENT
exports.compAssessModel = exports.genAI.getGenerativeModel({
    model: gemini_config_1.geminiModelName,
    systemInstruction: gemini_system_instructions_1.geminiSystemInstructions.compAssessmenter,
    generationConfig: {
        responseMimeType: gemini_config_1.responseMimeType,
        responseSchema: gemini_response_schema_1.geminiResponseSchema.compAssessmenter,
    },
});
// TODO -> FEATURE: VOICE-CHAT
/* ... some block of code ... */
// TODO -> FEATURE: ROLE-PLAY
/* ... some block of code ... */
