import { google, calendar_v3 } from "googleapis";
import jwt from "jsonwebtoken";

import { getOAuthClient, isGoogleConfigured } from "../config/googleCalendar.config";
import * as userRepository from "../repositories/user.repository";
import { encrypt, decrypt } from "../utils/crypto.util";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

// The OAuth redirect has no Authorization header, so we thread the
// authenticated user's id through Google's `state` param as a short-lived
// signed JWT instead of a raw, spoofable id.
const buildState = (userId: number): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign({ userId }, secret, { expiresIn: "10m" });
};

const readState = (state: string): number => {
  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error("JWT_SECRET is not defined");

  const decoded = jwt.verify(state, secret) as { userId: number };

  return decoded.userId;
};

const getAuthUrl = (userId: number): string => {
  if (!isGoogleConfigured()) {
    throw new Error("Google Calendar integration is not configured");
  }

  const client = getOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // ensures a refresh_token is issued even on repeat connects
    scope: SCOPES,
    state: buildState(userId),
  });
};

const handleOAuthCallback = async (code: string, state: string) => {
  const userId = readState(state);

  const client = getOAuthClient();

  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Please revoke prior app access in your Google account and try connecting again."
    );
  }

  await userRepository.updateGoogleTokens(userId, {
    googleRefreshToken: encrypt(tokens.refresh_token),
    googleAccessToken: tokens.access_token ? encrypt(tokens.access_token) : null,
    googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    googleCalendarLinked: true,
  });

  return userId;
};

const disconnect = async (userId: number) => {
  await userRepository.updateGoogleTokens(userId, {
    googleAccessToken: null,
    googleRefreshToken: null,
    googleTokenExpiry: null,
    googleCalendarLinked: false,
  });
};

// Returns an authenticated calendar client for this user, or null if the
// user hasn't linked Google Calendar (or Google isn't configured at all).
// Never throws — every caller treats "no calendar client" as "skip sync".
const getCalendarClientForUser = async (
  userId: number
): Promise<calendar_v3.Calendar | null> => {
  if (!isGoogleConfigured()) return null;

  try {
    const user = await userRepository.getUserById(userId);

    if (!user?.googleCalendarLinked || !user.googleRefreshToken) {
      return null;
    }

    const client = getOAuthClient();

    client.setCredentials({
      refresh_token: decrypt(user.googleRefreshToken),
    });

    return google.calendar({ version: "v3", auth: client });
  } catch (error) {
    console.error(`[google-calendar] Could not build client for user ${userId}:`, error);
    return null;
  }
};

interface AppointmentEventInput {
  summary: string;
  description: string;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  timeZone?: string;
}

const toISODateTime = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);

  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);

  return combined.toISOString();
};

// Creates the event on a single user's primary calendar. Returns the
// googleEventId, or null if the user hasn't linked their calendar or the
// Calendar API call failed for any reason — callers persist null and move
// on, per the "must not break the booking flow" requirement.
const createEvent = async (
  userId: number,
  input: AppointmentEventInput
): Promise<string | null> => {
  const calendar = await getCalendarClientForUser(userId);

  if (!calendar) return null;

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
  } catch (error) {
    console.error(`[google-calendar] Failed to create event for user ${userId}:`, error);
    return null;
  }
};

const updateEvent = async (
  userId: number,
  eventId: string,
  input: AppointmentEventInput
): Promise<boolean> => {
  const calendar = await getCalendarClientForUser(userId);

  if (!calendar) return false;

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
  } catch (error) {
    console.error(`[google-calendar] Failed to update event ${eventId} for user ${userId}:`, error);
    return false;
  }
};

const deleteEvent = async (userId: number, eventId: string): Promise<boolean> => {
  const calendar = await getCalendarClientForUser(userId);

  if (!calendar) return false;

  try {
    await calendar.events.delete({ calendarId: "primary", eventId });
    return true;
  } catch (error: any) {
    // 410 Gone / 404 Not Found just mean it's already deleted — treat as success.
    if (error?.code === 410 || error?.code === 404) return true;

    console.error(`[google-calendar] Failed to delete event ${eventId} for user ${userId}:`, error);
    return false;
  }
};

export {
  getAuthUrl,
  handleOAuthCallback,
  disconnect,
  createEvent,
  updateEvent,
  deleteEvent,
};
