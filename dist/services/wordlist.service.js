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
exports.deleteWordlist = exports.createWordlist = exports.getWordlistByID = exports.getUserWordlists = void 0;
const WordList_1 = __importDefault(require("../models/WordList"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const getUserWordlists = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wordlists = yield WordList_1.default.find({ userId }).populate("words");
    return wordlists;
});
exports.getUserWordlists = getUserWordlists;
const getWordlistByID = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const wordlist = yield WordList_1.default.findById(_id).populate("words");
    if (!wordlist)
        throw new app_error_util_1.default("There is no wordlists found with this ID", 404);
    return wordlist;
});
exports.getWordlistByID = getWordlistByID;
const createWordlist = (wordlist) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the wordlist already exist
    const wordlistIsExist = yield WordList_1.default.findOne(wordlist);
    if (!!wordlistIsExist)
        throw new app_error_util_1.default("Wordlist is already exist", 400);
    // If doesn't exist, create it
    const createdWordList = new WordList_1.default(wordlist).save();
    return createdWordList;
});
exports.createWordlist = createWordlist;
const deleteWordlist = (wordlist) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the wordlist doesn't exist
    const wordlistExist = yield WordList_1.default.findById(wordlist._id);
    if (!wordlistExist)
        throw new app_error_util_1.default("There is no wordlists found", 404);
    // If exist, delete it
    const deletedWordlist = yield WordList_1.default.deleteOne(wordlist);
    return deletedWordlist;
});
exports.deleteWordlist = deleteWordlist;
