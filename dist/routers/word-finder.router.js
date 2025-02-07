"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const word_finder_controller_1 = require("../controllers/word-finder.controller");
const router = (0, express_1.Router)();
router.get("/", word_finder_controller_1.getDetailedWord);
router.get("/random", word_finder_controller_1.getRandomWord);
exports.default = router;
