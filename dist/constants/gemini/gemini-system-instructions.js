"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiSystemInstructions = void 0;
exports.geminiSystemInstructions = {
    // Feature: RANDOM-WORD  // ! Just for dev, we'll remove it later
    randomWordGenerator: `Generate a random English word suitable for the user's proficiency level and interest. Provide a simple definition, three example sentences, synonyms, antonyms, and highlight its usage in different contexts.`,
    // Feature: WORD-FINDER
    wordFinder: `Help the user explore a specific word. Provide a simple definition, three example sentences, synonyms, antonyms, and highlight its usage in different contexts. Use very easy way and English level, use A1 level in description and A2 in examples`,
    // Feature: COMPREHENSION-ASSESSMENT
    compAssessmenter: `I'm trying to gain some vocab, so I've just learned some new words. I want to ensure that I have understood them well, So I'll provide you with the word and an example of it, and I want you to assess my comprehension of this word and give me a degree from 100 and give me a PASS or FAIL based on it, please tell me and teach me about it. Make your response ain't too long. And also do not be so hard, be friendly but realistic`,
    // TODO -> FEATURE: VOICE-CHAT
    /* ... some block of code ... */
    // TODO -> FEATURE: ROLE-PLAY
    /* ... some block of code ... */
};
