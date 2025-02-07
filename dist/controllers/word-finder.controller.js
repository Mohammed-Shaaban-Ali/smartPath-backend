"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetailedWord = exports.getRandomWord = void 0;
const generate_rand_util_1 = require("../utils/generate-rand.util");
const gemini_models_1 = require("../constants/gemini/gemini-models");
const gemini_prompts_1 = require("../constants/gemini/gemini-prompts");
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const getRandomWord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the URLSearchQueries
        // If doesn't exist use random values // TODO: Extract from user profile later
        const level = req.query.level || (0, generate_rand_util_1.getRandLevel)();
        const interest = req.query.interest || (0, generate_rand_util_1.getRandInterest)();
        // Generate AI response
        const modelRes = yield gemini_models_1.randomWordModel.generateContent(gemini_prompts_1.geminiPrompts.randomWordGenerator(level, interest));
        const modelResText = modelRes.response.text();
        // Parse it into JSON
        const randomWord = JSON.parse(modelResText);
        // Return the response
        res.status(200).json((0, format_res_util_1.default)("Word details fetched successfully", {
            level,
            interest,
            randomWord,
        }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});
exports.getRandomWord = getRandomWord;
const getDetailedWord = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the URLSearchQueries
        // TODO: Extract from user profile later
        const level = req.query.level || (0, generate_rand_util_1.getRandLevel)();
        const interest = req.query.interest || (0, generate_rand_util_1.getRandInterest)();
        const word = req.query.word;
        // Handle no-word case
        if (!word)
            throw new app_error_util_1.default("Word param is required", 400);
        // Generate AI response
        const modelRes = yield gemini_models_1.wordFinderModel.generateContent(gemini_prompts_1.geminiPrompts.wordFinder(word));
        const modelResText = modelRes.response.text();
        // Parse it into JSON
        const { description, examples, synonyms, antonyms } = JSON.parse(modelResText);
        // Return the response
        res.status(200).json((0, format_res_util_1.default)("Word fetched successfully", {
            word,
            level,
            interest,
            description,
            examples,
            synonyms,
            antonyms,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.getDetailedWord = getDetailedWord;
