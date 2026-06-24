"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { migrationSchema, type MigrationFormValues } from "@/lib/validations/migration.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { migrateLegacyMember } from "@/lib/actions/migration.actions";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/useUser";
import { ORGANS } from "@/lib/validations/member.schema";

export function MigrateForm() {
  const { toast } = useToast();
  const { profile } = useUser();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MigrationFormValues>({
    resolver: zodResolver(migrationSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      matric_number: "",
      faculty: "",
      department: "",
      academic_level: "",
      organ: undefined,
      society: "",
      parish: "",
      migration_source: "manual_entry",
      notes: "",
      dues_amount_paid: "",
      dues_period: "",
    },
  });

  const onSubmit = async (values: MigrationFormValues) => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await migrateLegacyMember(values, profile.id);
      if (result?.error) {
        setError(result.error);
        toast({
          title: "Migration Failed",
          description: result.error,
          variant: "error",
        });
      } else {
        setSuccess(true);
        reset();
        toast({
          title: "Record Migrated",
          description: "Legacy member record has been created successfully.",
          variant: "success",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-status-successBackground border border-status-successBorder text-status-successText select-none">
          <CheckCircle className="h-5 w-5 shrink-0 text-status-successText" />
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold">Migration Successful</h3>
            <p className="text-[11px] leading-relaxed opacity-95">
              The legacy member profile has been imported. An account claim token has been prepared.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-status-errorBackground p-3 text-xs font-semibold text-status-errorText border border-status-errorBorder animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Core Identity */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-1.5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Member Info</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Full Name</label>
              <Input error={!!errors.full_name} {...register("full_name")} placeholder="John Alumnus" />
              {errors.full_name && <p className="text-[11px] text-danger mt-1 font-medium">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Email Address (Optional)</label>
              <Input error={!!errors.email} type="email" {...register("email")} placeholder="john.a@example.com" />
              {errors.email && <p className="text-[11px] text-danger mt-1 font-medium">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Phone Number</label>
              <Input error={!!errors.phone} {...register("phone")} placeholder="08012345678" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Matric Number</label>
              <Input error={!!errors.matric_number} {...register("matric_number")} placeholder="2018/65432" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Migration Source</label>
              <Select error={!!errors.migration_source} {...register("migration_source")}>
                <option value="manual_entry">Manual Entry</option>
                <option value="notebook">Notebook Register</option>
                <option value="dues_card">Dues Card Card</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Academic / Organ */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-1.5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Academic & Church Info</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Faculty</label>
              <Input error={!!errors.faculty} {...register("faculty")} placeholder="Arts" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Department</label>
              <Input error={!!errors.department} {...register("department")} placeholder="History" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <option value=""></option>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Assigned Organ</label>
              <Select error={!!errors.organ} {...register("organ")}>
                <option value="">Select Organ</option>
                {ORGANS.map((o) => (
                  <option key={o} value={o}>
                    {o.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Society</label>
              <Input {...register("society")} placeholder="e.g. Legion of Mary" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Home Parish</label>
              <Input {...register("parish")} placeholder="e.g. St. Peter" />
            </div>
          </div>
        </div>

        {/* Historical Dues */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-1.5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Historical Dues Payment</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Amount Paid (₦)</label>
              <Input error={!!errors.dues_amount_paid} {...register("dues_amount_paid")} placeholder="5000" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Payment Period / Session</label>
              <Input error={!!errors.dues_period} {...register("dues_period")} placeholder="e.g. 2022/2023" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Migration Notes</label>
            <Input {...register("notes")} placeholder="e.g. Transferred from Notebook Register page 22" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutrals-borderLight">
          <Button type="submit" variant="primary" className="px-6 h-10 text-xs font-semibold" isLoading={isLoading}>
            Migrate Legacy Member
          </Button>
        </div>
      </form>
    </div>
  );
}
