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
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.callback = exports.connect = void 0;
const googleCalendarService = __importStar(require("../services/googleCalendar.service"));
// GET /api/google/connect — returns the Google consent URL for the logged-in user
const connect = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const url = googleCalendarService.getAuthUrl(req.user.id);
        return res.status(200).json({ url });
    }
    catch (error) {
        console.error("Google connect error:", error);
        return res.status(400).json({
            message: error.message || "Failed to start Google Calendar connection",
        });
    }
};
exports.connect = connect;
// GET /api/google/callback — Google redirects here with ?code=&state=
const callback = async (req, res) => {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "/";
    try {
        if (!code || typeof code !== "string" || !state || typeof state !== "string") {
            throw new Error("Missing code or state from Google");
        }
        await googleCalendarService.handleOAuthCallback(code, state);
        return res.redirect(`${frontendUrl}/settings?googleCalendar=connected`);
    }
    catch (error) {
        console.error("Google OAuth callback error:", error);
        return res.redirect(`${frontendUrl}/settings?googleCalendar=error`);
    }
};
exports.callback = callback;
// DELETE /api/google/disconnect
const disconnect = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        await googleCalendarService.disconnect(req.user.id);
        return res.status(200).json({ message: "Google Calendar disconnected" });
    }
    catch (error) {
        console.error("Google disconnect error:", error);
        return res.status(500).json({ message: "Failed to disconnect Google Calendar" });
    }
};
exports.disconnect = disconnect;
