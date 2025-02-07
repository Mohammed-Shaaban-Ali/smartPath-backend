"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiPrompts = void 0;
// Feature: RANDOM-WORD  // ! Just for dev, we'll remove it later
const randomWordGenerator = (level, interest) => `Generate a random word suitable for a ${level} level student interested in ${interest} topic.`;
// Feature: WORD-FINDER
const wordFinder = (word, level, interest) => `- give me detailed info about word: "${word}" `;
// Feature: COMPREHENSION-ASSESSMENT
const compAssessmenter = (word, example) => `- Word: "${word}"
    - Example: "${example}"`;
// TODO -> FEATURE: VOICE-CHAT
/* ... some block of code ... */
// TODO -> FEATURE: ROLE-PLAY
/* ... some block of code ... */
exports.geminiPrompts = {
    randomWordGenerator,
    wordFinder,
    compAssessmenter,
};
