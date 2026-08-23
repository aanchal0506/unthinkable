import { Request, Response } from "express";

import * as googleCalendarService from "../services/googleCalendar.service";

interface AuthRequest extends Request {
  user?: { id: number; role: "PATIENT" | "DOCTOR" | "ADMIN" };
}

// GET /api/google/connect — returns the Google consent URL for the logged-in user
const connect = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const url = googleCalendarService.getAuthUrl(req.user.id);

    return res.status(200).json({ url });
  } catch (error: any) {
    console.error("Google connect error:", error);

    return res.status(400).json({
      message: error.message || "Failed to start Google Calendar connection",
    });
  }
};

// GET /api/google/callback — Google redirects here with ?code=&state=
const callback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  const frontendUrl = process.env.FRONTEND_URL || "/";

  try {
    if (!code || typeof code !== "string" || !state || typeof state !== "string") {
      throw new Error("Missing code or state from Google");
    }

    await googleCalendarService.handleOAuthCallback(code, state);

    return res.redirect(`${frontendUrl}/settings?googleCalendar=connected`);
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);

    return res.redirect(`${frontendUrl}/settings?googleCalendar=error`);
  }
};

// DELETE /api/google/disconnect
const disconnect = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await googleCalendarService.disconnect(req.user.id);

    return res.status(200).json({ message: "Google Calendar disconnected" });
  } catch (error: any) {
    console.error("Google disconnect error:", error);

    return res.status(500).json({ message: "Failed to disconnect Google Calendar" });
  }
};

export { connect, callback, disconnect };
