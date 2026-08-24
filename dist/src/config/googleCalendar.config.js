"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGoogleConfigured = exports.getOAuthClient = void 0;
const googleapis_1 = require("googleapis");
const getOAuthClient = () => {
    return new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
};
exports.getOAuthClient = getOAuthClient;
const isGoogleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI);
exports.isGoogleConfigured = isGoogleConfigured;
