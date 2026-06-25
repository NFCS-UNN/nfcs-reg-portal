"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { saveDuesConfig } from "@/lib/actions/dues-config.actions";
import { useToast } from "@/components/ui/toast";
import { DollarSign, Save } from "lucide-react";

interface DuesRow {
  id: string | null;
  year_ordinal: number;
  label: string;
  annual_dues: number;
  constitution: number;
  cgan: number;
  total: number;
}

export function DuesConfigEditor({ initialRows, adminId }: { initialRows: DuesRow[]; adminId: string }) {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<DuesRow[]>(initialRows);
  const [loading, setLoading] = React.useState(false);

  // Recalculate total when any field changes
  const updateRow = (ordinal: number, field: keyof DuesRow, value: number | string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.year_ordinal !== ordinal) return row;
        const updated = { ...row, [field]: value };
        if (field !== "label") {
          updated.total = Number(updated.annual_dues) + Number(updated.constitution) + Number(updated.cgan);
        }
        return updated;
      })
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    rows.forEach((row) => {
      formData.set(`year_ordinal_${row.year_ordinal}`, String(row.year_ordinal));
      formData.set(`label_${row.year_ordinal}`, row.label);
      formData.set(`annual_dues_${row.year_ordinal}`, String(row.annual_dues));
      formData.set(`constitution_${row.year_ordinal}`, String(row.constitution));
      formData.set(`cgan_${row.year_ordinal}`, String(row.cgan));
    });

    const result = await saveDuesConfig(formData, adminId);
    setLoading(false);

    if (result.error) {
      toast({ title: "Save Failed", description: "Failed to save dues config: " + result.error, variant: "error" });
    } else {
      toast({ title: "Dues Config Saved", description: "Configuration saved successfully!", variant: "success" });
    }
  };

  return (
    <Card className="border border-neutrals-borderLight shadow-card bg-white dark:bg-prussian-blue-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-accent" /> Dues Amount Configuration
          </CardTitle>
          <CardDescription>
            Manage the annual dues breakdown per academic year. Changes take effect immediately for future payments.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={loading} variant="primary" size="sm" className="gap-1.5 shrink-0">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutrals-borderLight">
                <th className="text-left text-[10px] font-semibold text-text-tertiary uppercase py-2 pr-4 w-40">Year Label</th>
                <th className="text-right text-[10px] font-semibold text-text-tertiary uppercase py-2 pr-4 w-32">Annual Dues (₦)</th>
                <th className="text-right text-[10px] font-semibold text-text-tertiary uppercase py-2 pr-4 w-32">Constitution (₦)</th>
                <th className="text-right text-[10px] font-semibold text-text-tertiary uppercase py-2 pr-4 w-32">CGAN (₦)</th>
                <th className="text-right text-[10px] font-semibold text-text-tertiary uppercase py-2 w-32">Total (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutrals-borderLight">
              {rows.map((row) => (
                <tr key={row.year_ordinal} className="group hover:bg-surface-page transition-colors">
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateRow(row.year_ordinal, "label", e.target.value)}
                      className="w-full text-xs font-semibold text-text-primary bg-transparent border-0 border-b border-dashed border-transparent group-hover:border-neutrals-borderLight focus:border-brand-accent focus:outline-none px-0 py-0.5"
                    />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <input
                      type="number"
                      min={0}
                      value={row.annual_dues}
                      onChange={(e) => updateRow(row.year_ordinal, "annual_dues", parseInt(e.target.value, 10) || 0)}
                      className="w-24 text-xs text-right text-text-primary bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight rounded-md px-2 py-1 focus:border-brand-accent focus:outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <input
                      type="number"
                      min={0}
                      value={row.constitution}
                      onChange={(e) => updateRow(row.year_ordinal, "constitution", parseInt(e.target.value, 10) || 0)}
                      className="w-24 text-xs text-right text-text-primary bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight rounded-md px-2 py-1 focus:border-brand-accent focus:outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <input
                      type="number"
                      min={0}
                      value={row.cgan}
                      onChange={(e) => updateRow(row.year_ordinal, "cgan", parseInt(e.target.value, 10) || 0)}
                      className="w-24 text-xs text-right text-text-primary bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight rounded-md px-2 py-1 focus:border-brand-accent focus:outline-none"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-sm font-bold text-brand-accent">
                      ₦{row.total.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-text-tertiary mt-4">
          * Changes are saved to the database and reflected in new payment calculations. Existing confirmed payments are not affected.
        </p>
      </CardContent>
    </Card>
  );
}
