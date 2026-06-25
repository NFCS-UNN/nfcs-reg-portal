"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { savePaymentMethods } from "@/lib/actions/dues-config.actions";
import { CreditCard, Check, Loader2 } from "lucide-react";

export function PaymentMethodsEditor({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [onlineEnabled, setOnlineEnabled] = React.useState(true);
  const [bankName, setBankName] = React.useState("Access Bank");
  const [accountName, setAccountName] = React.useState("NFCS UNN Chapter");
  const [accountNumber, setAccountNumber] = React.useState("1234567890");
  const [receiptChannels, setReceiptChannels] = React.useState("WhatsApp, Physical Card");

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedOnline = localStorage.getItem("settings_online_enabled");
    const savedBank = localStorage.getItem("settings_bank_name");
    const savedAccName = localStorage.getItem("settings_account_name");
    const savedAccNum = localStorage.getItem("settings_account_number");
    const savedChannels = localStorage.getItem("settings_receipt_channels");

    if (savedOnline !== null) setOnlineEnabled(savedOnline === "true");
    if (savedBank) setBankName(savedBank);
    if (savedAccName) setAccountName(savedAccName);
    if (savedAccNum) setAccountNumber(savedAccNum);
    if (savedChannels) setReceiptChannels(savedChannels);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const values = {
      onlineEnabled,
      bankName,
      accountName,
      accountNumber,
      receiptChannels,
    };

    try {
      const res = await savePaymentMethods(values, adminId);
      if (res.error) {
        toast({
          title: "Save Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        // Save to localStorage
        localStorage.setItem("settings_online_enabled", String(onlineEnabled));
        localStorage.setItem("settings_bank_name", bankName);
        localStorage.setItem("settings_account_name", accountName);
        localStorage.setItem("settings_account_number", accountNumber);
        localStorage.setItem("settings_receipt_channels", receiptChannels);

        toast({
          title: "Settings Saved",
          description: "Payment methods have been successfully updated.",
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
          <CreditCard className="h-5 w-5 text-brand" /> Payment Methods Settings
        </CardTitle>
        <CardDescription>
          Configure how members pay their chapter dues (online integration & bank transfer instructions).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-5">
          {/* Toggle Online Payments */}
          <div className="flex items-center justify-between p-3.5 rounded-lg border border-neutrals-borderLight bg-surface-page select-none">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-text-primary">Enable Online Payment Gateway</h4>
              <p className="text-[10px] text-text-tertiary">Allow students to pay dues instantly using Monnify/OPay credit card/transfer webhooks.</p>
            </div>
            <button
              type="button"
              onClick={() => setOnlineEnabled(!onlineEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                onlineEnabled ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  onlineEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Bank Transfer Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary border-b border-neutrals-borderLight pb-1.5">Bank Transfer Details (Manual Payment Info)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary">Bank Name</label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Access Bank"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary">Account Name</label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. NFCS UNN"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text-secondary">Account Number</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1029384756"
                  required
                />
              </div>
            </div>
          </div>

          {/* Receipt Submission Channels */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Acceptable Receipt Channels</label>
            <Input
              value={receiptChannels}
              onChange={(e) => setReceiptChannels(e.target.value)}
              placeholder="e.g. WhatsApp, Email, Physical Card submission"
              required
            />
            <p className="text-[10px] text-text-tertiary">List the channels where exco members verify transfer receipts from students.</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 border-t border-neutrals-borderLight">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="px-6 h-9 text-xs font-semibold"
            >
              Save Payment Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
