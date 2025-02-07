"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comp_assess_controller_1 = require("../controllers/comp-assess.controller");
const router = (0, express_1.Router)();
router.post("/", comp_assess_controller_1.getComprehensionAssessment);
exports.default = router;
