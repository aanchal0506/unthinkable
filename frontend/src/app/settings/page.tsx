"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck2, Link2, Link2Off } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import Loading from "@/components/ui/Loading";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

import { getCurrentUser } from "@/lib/api/auth";
import { getGoogleConnectUrl, disconnectGoogle } from "@/lib/api/google";

export default function SettingsPage() {
  return (
    <Suspense fallback={<AppShell allow={["PATIENT", "DOCTOR"]}><Loading /></AppShell>}>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const calendarParam = searchParams.get("googleCalendar");

  const [linked, setLinked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      setLinked(Boolean(user.googleCalendarLinked));
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Unable to load calendar status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      setError("");

      const url = await getGoogleConnectUrl();

      window.location.href = url;
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to start Google Calendar connection."
      );
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      "Disconnect Google Calendar? Future appointments won't be added to your calendar until you reconnect."
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await disconnectGoogle();

      setLinked(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Unable to disconnect Google Calendar."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell allow={["PATIENT", "DOCTOR"]}>
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow mb-2">Preferences</p>
        <h1 className="font-display text-[26px] text-ink">Calendar &amp; settings</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-soft">
          Connect Google Calendar so appointments are automatically added,
          updated, and removed from your calendar.
        </p>

        {calendarParam === "connected" && (
          <Alert tone="success" className="mt-6">
            Google Calendar connected successfully.
          </Alert>
        )}

        {calendarParam === "error" && (
          <Alert tone="error" className="mt-6">
            We couldn't connect Google Calendar. Please try again.
          </Alert>
        )}

        {error && (
          <Alert tone="error" className="mt-6">
            {error}
          </Alert>
        )}

        <div className="mt-6 rounded-md border border-line bg-surface p-6">
          {loading ? (
            <Loading />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border ${
                    linked
                      ? "border-pine/30 bg-pine-wash text-pine"
                      : "border-line-strong bg-paper text-ink-faint"
                  }`}
                >
                  <CalendarCheck2 className="h-5 w-5" strokeWidth={1.75} />
                </div>

                <div>
                  <p className="font-display text-[16px] text-ink">Google Calendar</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {linked
                      ? "Connected — your appointments will sync automatically."
                      : "Not connected. Appointments won't be added to your calendar."}
                  </p>
                </div>
              </div>

              <span
                className={`stamp shrink-0 ${linked ? "stamp-pine" : "stamp-neutral"}`}
              >
                {linked ? "Connected" : "Not connected"}
              </span>
            </div>
          )}

          {!loading && (
            <div className="mt-6 border-t border-line pt-5">
              {linked ? (
                <Button
                  variant="danger"
                  loading={actionLoading}
                  onClick={handleDisconnect}
                >
                  <Link2Off className="h-4 w-4" />
                  Disconnect Google Calendar
                </Button>
              ) : (
                <Button loading={actionLoading} onClick={handleConnect}>
                  <Link2 className="h-4 w-4" />
                  Connect Google Calendar
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-ink-faint">
          You'll be redirected to Google to sign in and grant calendar
          access. We only create, update, and remove events for your own
          appointments — nothing else on your calendar is touched.
        </p>
      </div>
    </AppShell>
  );
}
