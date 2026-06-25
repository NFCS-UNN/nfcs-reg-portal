"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { saveNotificationSettings } from "@/lib/actions/dues-config.actions";
import { Bell, Loader2 } from "lucide-react";

export function NotificationSettingsEditor({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [emailDues, setEmailDues] = React.useState(true);
  const [emailReg, setEmailReg] = React.useState(true);
  const [emailAnnounce, setEmailAnnounce] = React.useState(false);
  const [smsMfa, setSmsMfa] = React.useState(false);
  const [smsDuesReminder, setSmsDuesReminder] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedEmailDues = localStorage.getItem("settings_notif_email_dues");
    const savedEmailReg = localStorage.getItem("settings_notif_email_reg");
    const savedEmailAnn = localStorage.getItem("settings_notif_email_ann");
    const savedSmsMfa = localStorage.getItem("settings_notif_sms_mfa");
    const savedSmsDues = localStorage.getItem("settings_notif_sms_dues");

    if (savedEmailDues !== null) setEmailDues(savedEmailDues === "true");
    if (savedEmailReg !== null) setEmailReg(savedEmailReg === "true");
    if (savedEmailAnn !== null) setEmailAnnounce(savedEmailAnn === "true");
    if (savedSmsMfa !== null) setSmsMfa(savedSmsMfa === "true");
    if (savedSmsDues !== null) setSmsDuesReminder(savedSmsDues === "true");
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const values = {
      emailDues,
      emailReg,
      emailAnnounce,
      smsMfa,
      smsDuesReminder,
    };

    try {
      const res = await saveNotificationSettings(values, adminId);
      if (res.error) {
        toast({
          title: "Save Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        // Save to localStorage
        localStorage.setItem("settings_notif_email_dues", String(emailDues));
        localStorage.setItem("settings_notif_email_reg", String(emailReg));
        localStorage.setItem("settings_notif_email_ann", String(emailAnnounce));
        localStorage.setItem("settings_notif_sms_mfa", String(smsMfa));
        localStorage.setItem("settings_notif_sms_dues", String(smsDuesReminder));

        toast({
          title: "Settings Saved",
          description: "Notification dispatch thresholds updated.",
          variant: "success",
        });
      }
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-neutrals-borderLight shadow-card bg-white dark:bg-prussian-blue-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand" /> Notification Settings
        </CardTitle>
        <CardDescription>
          Choose when to send emails or broadcast bulk SMS alerts to chapter members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Email dispatch triggers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary border-b border-neutrals-borderLight pb-1.5">Email Notifications</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutrals-borderLight bg-surface-page select-none">
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-semibold text-text-primary">Dues Receipt Emailed</h5>
                  <p className="text-[9px] text-text-tertiary">Send registration receipt emails automatically after confirming payments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDues(!emailDues)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailDues ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      emailDues ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutrals-borderLight bg-surface-page select-none">
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-semibold text-text-primary">Member Approval Alert</h5>
                  <p className="text-[9px] text-text-tertiary">Notify members instantly via email when their profiles are approved by administrators.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailReg(!emailReg)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailReg ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      emailReg ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutrals-borderLight bg-surface-page select-none">
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-semibold text-text-primary">Announcements Emailed</h5>
                  <p className="text-[9px] text-text-tertiary">Send a copy of all new chapter announcements directly to every member&apos;s mailbox.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAnnounce(!emailAnnounce)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailAnnounce ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      emailAnnounce ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SMS triggers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary border-b border-neutrals-borderLight pb-1.5">SMS Broadcaster Options</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutrals-borderLight bg-surface-page select-none">
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-semibold text-text-primary">Admin MFA SMS Verification</h5>
                  <p className="text-[9px] text-text-tertiary">Send validation codes via SMS for administrative login authentication.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsMfa(!smsMfa)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smsMfa ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      smsMfa ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutrals-borderLight bg-surface-page select-none">
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-semibold text-text-primary">Dues Arrears Reminders</h5>
                  <p className="text-[9px] text-text-tertiary">Broadcast scheduled bulk SMS alerts to members with unpaid session dues.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsDuesReminder(!smsDuesReminder)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smsDuesReminder ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      smsDuesReminder ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 border-t border-neutrals-borderLight">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="px-6 h-9 text-xs font-semibold"
            >
              Save Notification Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
