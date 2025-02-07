"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signToken = (data, expiresIn) => {
    return jsonwebtoken_1.default.sign(data, process.env.JWT_SECRET, {
        expiresIn: expiresIn || "1y",
    });
};
exports.signToken = signToken;
