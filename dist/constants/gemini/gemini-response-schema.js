"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiResponseSchema = void 0;
const generative_ai_1 = require("@google/generative-ai");
// Feature: RANDOM-WORD  // ! Just for dev, we'll remove it later
const randomWordGenerator = {
    type: generative_ai_1.SchemaType.OBJECT,
    description: "Generated random word with detailed exploration.",
    properties: {
        word: {
            type: generative_ai_1.SchemaType.STRING,
            description: "The random generated word.",
        },
        definition: {
            type: generative_ai_1.SchemaType.STRING,
            description: "Simple definition of the word.",
        },
        examples: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "Three example sentences using the word.",
        },
        synonyms: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "Synonyms of the word.",
        },
        antonyms: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "Antonyms of the word.",
        },
    },
    required: ["word", "definition", "examples", "synonyms", "antonyms"],
};
// Feature: WORD-FINDER
const wordFinder = {
    type: generative_ai_1.SchemaType.OBJECT,
    description: "Detailed exploration of a specific word.",
    properties: {
        description: {
            type: generative_ai_1.SchemaType.STRING,
            description: "Simple definition of the word.",
        },
        examples: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "Exactly three example sentences using the word.",
        },
        synonyms: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "List of synonyms of the word.",
        },
        antonyms: {
            type: generative_ai_1.SchemaType.ARRAY,
            items: { type: generative_ai_1.SchemaType.STRING },
            description: "List of antonyms of the word.",
        },
    },
    required: ["description", "examples", "synonyms", "antonyms"],
};
// Feature: COMPREHENSION-ASSESSMENT
const compAssessmenter = {
    type: generative_ai_1.SchemaType.OBJECT,
    description: "Assessment of a user-provided sentence for correctness and appropriateness.",
    properties: {
        score: {
            type: generative_ai_1.SchemaType.NUMBER,
            description: "Assessment score (out of 100).",
        },
        feedback: {
            type: generative_ai_1.SchemaType.STRING,
            description: "Feedback for improvement.",
        },
        correctedVersion: {
            type: generative_ai_1.SchemaType.STRING,
            description: "Corrected version of the example if it was wrong",
            nullable: true,
        },
    },
    required: ["score", "feedback"],
};
// TODO -> FEATURE: VOICE-CHAT
/* ... some block of code ... */
// TODO -> FEATURE: ROLE-PLAY
/* ... some block of code ... */
exports.geminiResponseSchema = {
    randomWordGenerator,
    wordFinder,
    compAssessmenter,
};
