"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatRes = (message, data) => {
    return {
        success: true,
        message,
        data: data || null,
    };
};
exports.default = formatRes;
