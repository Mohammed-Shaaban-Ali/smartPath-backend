"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wordlist_controller_1 = require("../controllers/wordlist.controller");
const router = (0, express_1.Router)();
router.get("/", wordlist_controller_1.getAllWordlists);
router.get("/:id", wordlist_controller_1.getSingleWordlist);
// ! POST `/wordlist` insteadOf `/wordlist/new`
router.post("/", wordlist_controller_1.postWordlist);
router.delete("/", wordlist_controller_1.handleDeleteWordlist);
exports.default = router;
