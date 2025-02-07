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
exports.handleDeleteWordlist = exports.postWordlist = exports.getSingleWordlist = exports.getAllWordlists = void 0;
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const wordlist_service_1 = require("../services/wordlist.service");
// GET: all wordlists by userID
const getAllWordlists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wordlists = yield (0, wordlist_service_1.getUserWordlists)(req.userId);
        res
            .status(200)
            .json((0, format_res_util_1.default)("Wordlists fetched successfully", wordlists));
    }
    catch (err) {
        next(err);
    }
});
exports.getAllWordlists = getAllWordlists;
// GET -> single wordlist by ID
const getSingleWordlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wordlist = yield (0, wordlist_service_1.getWordlistByID)(req.params.id);
        res.status(200).json((0, format_res_util_1.default)("Wordlist fetched successfully", wordlist));
    }
    catch (err) {
        next(err);
    }
});
exports.getSingleWordlist = getSingleWordlist;
// POST -> create new wordlist
const postWordlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ! We don't want any words now, just create it
        const { name } = req.body;
        const userId = req.userId;
        // ! No need for that line; we already did validation in the middleware
        // if (!userId) throw new AppError("User ID is required", 400);
        if (!name)
            throw new app_error_util_1.default("Wordlist name is required", 400);
        const wordListData = {
            name,
            userId,
        };
        const newWordlist = yield (0, wordlist_service_1.createWordlist)(wordListData);
        res
            .status(200)
            .json((0, format_res_util_1.default)("Wordlist created successfully", newWordlist));
    }
    catch (err) {
        next(err);
    }
});
exports.postWordlist = postWordlist;
// Delete -> delete wordlist by ID
const handleDeleteWordlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const userId = req.userId;
        if (!_id)
            throw new app_error_util_1.default("Wordlist `_id` is required", 400);
        const wordListData = {
            _id,
            userId,
        };
        const newWordlist = yield (0, wordlist_service_1.deleteWordlist)(wordListData);
        res
            .status(200)
            .json((0, format_res_util_1.default)("Wordlist deleted successfully", newWordlist));
    }
    catch (err) {
        next(err);
    }
});
exports.handleDeleteWordlist = handleDeleteWordlist;
