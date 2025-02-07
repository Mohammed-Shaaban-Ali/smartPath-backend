"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOtpExpired = exports.getExpirationTime = void 0;
// Default OTP expiry time in minutes
const DEFAULT_EXPIRY_MINUTES = 10;
// Function to calculate the expiration time of the OTP
const getExpirationTime = (minutes = DEFAULT_EXPIRY_MINUTES) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
exports.getExpirationTime = getExpirationTime;
// Function to check if the OTP is expired
const isOtpExpired = (expirationTime) => {
    return Date.now() > expirationTime.getTime();
};
exports.isOtpExpired = isOtpExpired;
