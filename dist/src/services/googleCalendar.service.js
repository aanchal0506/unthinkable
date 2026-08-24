"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.disconnect = exports.handleOAuthCallback = exports.getAuthUrl = void 0;
const googleapis_1 = require("googleapis");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleCalendar_config_1 = require("../config/googleCalendar.config");
const userRepository = __importStar(require("../repositories/user.repository"));
const crypto_util_1 = require("../utils/crypto.util");
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
// The OAuth redirect has no Authorization header, so we thread the
// authenticated user's id through Google's `state` param as a short-lived
// signed JWT instead of a raw, spoofable id.
const buildState = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not defined");
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: "10m" });
};
const readState = (state) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not defined");
    const decoded = jsonwebtoken_1.default.verify(state, secret);
    return decoded.userId;
};
const getAuthUrl = (userId) => {
    if (!(0, googleCalendar_config_1.isGoogleConfigured)()) {
        throw new Error("Google Calendar integration is not configured");
    }
    const client = (0, googleCalendar_config_1.getOAuthClient)();
    return client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent", // ensures a refresh_token is issued even on repeat connects
        scope: SCOPES,
        state: buildState(userId),
    });
};
exports.getAuthUrl = getAuthUrl;
const handleOAuthCallback = async (code, state) => {
    const userId = readState(state);
    const client = (0, googleCalendar_config_1.getOAuthClient)();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
        throw new Error("Google did not return a refresh token. Please revoke prior app access in your Google account and try connecting again.");
    }
    await userRepository.updateGoogleTokens(userId, {
        googleRefreshToken: (0, crypto_util_1.encrypt)(tokens.refresh_token),
        googleAccessToken: tokens.access_token ? (0, crypto_util_1.encrypt)(tokens.access_token) : null,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        googleCalendarLinked: true,
    });
    return userId;
};
exports.handleOAuthCallback = handleOAuthCallback;
const disconnect = async (userId) => {
    await userRepository.updateGoogleTokens(userId, {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleCalendarLinked: false,
    });
};
exports.disconnect = disconnect;
// Returns an authenticated calendar client for this user, or null if the
// user hasn't linked Google Calendar (or Google isn't configured at all).
// Never throws — every caller treats "no calendar client" as "skip sync".
const getCalendarClientForUser = async (userId) => {
    if (!(0, googleCalendar_config_1.isGoogleConfigured)())
        return null;
    try {
        const user = await userRepository.getUserById(userId);
        if (!user?.googleCalendarLinked || !user.googleRefreshToken) {
            return null;
        }
        const client = (0, googleCalendar_config_1.getOAuthClient)();
        client.setCredentials({
            refresh_token: (0, crypto_util_1.decrypt)(user.googleRefreshToken),
        });
        return googleapis_1.google.calendar({ version: "v3", auth: client });
    }
    catch (error) {
        console.error(`[google-calendar] Could not build client for user ${userId}:`, error);
        return null;
    }
};
const toISODateTime = (date, time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
};
// Creates the event on a single user's primary calendar. Returns the
// googleEventId, or null if the user hasn't linked their calendar or the
// Calendar API call failed for any reason — callers persist null and move
// on, per the "must not break the booking flow" requirement.
const createEvent = async (userId, input) => {
    const calendar = await getCalendarClientForUser(userId);
    if (!calendar)
        return null;
    try {
        const timeZone = input.timeZone || process.env.DEFAULT_TIMEZONE || "UTC";
        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
                summary: input.summary,
                description: input.description,
                start: { dateTime: toISODateTime(input.date, input.startTime), timeZone },
                end: { dateTime: toISODateTime(input.date, input.endTime), timeZone },
            },
        });
        return response.data.id ?? null;
    }
    catch (error) {
        console.error(`[google-calendar] Failed to create event for user ${userId}:`, error);
        return null;
    }
};
exports.createEvent = createEvent;
const updateEvent = async (userId, eventId, input) => {
    const calendar = await getCalendarClientForUser(userId);
    if (!calendar)
        return false;
    try {
        const timeZone = input.timeZone || process.env.DEFAULT_TIMEZONE || "UTC";
        await calendar.events.update({
            calendarId: "primary",
            eventId,
            requestBody: {
                summary: input.summary,
                description: input.description,
                start: { dateTime: toISODateTime(input.date, input.startTime), timeZone },
                end: { dateTime: toISODateTime(input.date, input.endTime), timeZone },
            },
        });
        return true;
    }
    catch (error) {
        console.error(`[google-calendar] Failed to update event ${eventId} for user ${userId}:`, error);
        return false;
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (userId, eventId) => {
    const calendar = await getCalendarClientForUser(userId);
    if (!calendar)
        return false;
    try {
        await calendar.events.delete({ calendarId: "primary", eventId });
        return true;
    }
    catch (error) {
        // 410 Gone / 404 Not Found just mean it's already deleted — treat as success.
        if (error?.code === 410 || error?.code === 404)
            return true;
        console.error(`[google-calendar] Failed to delete event ${eventId} for user ${userId}:`, error);
        return false;
    }
};
exports.deleteEvent = deleteEvent;
