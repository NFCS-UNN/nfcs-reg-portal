"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, type MemberFormValues, ORGANS } from "@/lib/validations/member.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { onsiteRegisterMember } from "@/lib/actions/member.actions";
import { AlertCircle, Upload, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/useUser";
import { UNN_CAMPUS_DATA } from "@/lib/utils/unn-data";

export function OnsiteRegistrationForm() {
  const { toast } = useToast();
  const { profile } = useUser();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  // Dynamic dropdown states for UNN Campus Data
  const [selectedFaculty, setSelectedFaculty] = React.useState("");
  const [selectedDepartment, setSelectedDepartment] = React.useState("");
  const [selectedHostel, setSelectedHostel] = React.useState("");
  const [customAddress, setCustomAddress] = React.useState("");

  const isRestrictedRole = profile ? (profile.role !== "exco" && profile.role !== "super_admin") : false;
  const isFacultyDisabled = isRestrictedRole && !!profile?.faculty;
  const isDepartmentDisabled = isRestrictedRole && !!profile?.department;
  const isAcademicLevelDisabled = isRestrictedRole && !!profile?.academic_level;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, disabled },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      address: "",
      faculty: "",
      department: "",
      matric_number: "",
      academic_level: "",
      organ: undefined,
      society: "",
      parish: "",
      password: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Passport photo must be under 2MB.",
          variant: "error",
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: MemberFormValues) => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      formData.append(key, val);
    });

    if (photoFile) {
      formData.append("passport_photo", photoFile);
    }

    try {
      const result = await onsiteRegisterMember(formData, profile.id);
      if (result?.error) {
        setError(result.error);
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "error",
        });
      } else {
        setSuccess(true);
        reset();
        setPhotoFile(null);
        setPhotoPreview(null);
        toast({
          title: "Member Registered",
          description: "The member is now active in the system.",
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
      {/* Onsite Warning Banner from DESIGN.json */}
      <div className="flex gap-3 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[8px] text-[#065F46] select-none">
        <Info className="h-5 w-5 shrink-0 text-[#134116]" />
        <span className="text-[13px] font-semibold leading-normal">
          Onsite registration — member will be activated immediately
        </span>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-status-successBackground border border-status-successBorder text-status-successText">
          <CheckCircle className="h-5 w-5 shrink-0 text-status-successText" />
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold">Registration Successful</h3>
            <p className="text-[11px] leading-relaxed opacity-95">
              The member has been registered and activated. They can now sign in with their email and the password you provided.
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

        {/* Section 1: Credentials */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Account Credentials</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Email Address</label>
              <Input error={!!errors.email} type="email" {...register("email")} placeholder="member@example.com" />
              {errors.email && <p className="text-[11px] text-danger mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Temporary Password</label>
              <Input error={!!errors.password} type="text" {...register("password")} placeholder="Password123" />
              {errors.password && <p className="text-[11px] text-danger mt-1 font-medium">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Personal details */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Personal Profile</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Full Name</label>
              <Input error={!!errors.full_name} {...register("full_name")} placeholder="Jane Doe" />
              {errors.full_name && <p className="text-[11px] text-danger mt-1 font-medium">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Phone Number</label>
              <Input error={!!errors.phone} {...register("phone")} placeholder="08098765432" />
              {errors.phone && <p className="text-[11px] text-danger mt-1 font-medium">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Date of Birth</label>
              <Input type="date" error={!!errors.date_of_birth} {...register("date_of_birth")} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Residential Address</label>
              <Input error={!!errors.address} {...register("address")} placeholder="7 Chuba Road" />
            </div>
          </div>
        </div>

        {/* Section 3: Academic details */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Academic Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Faculty Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
                <span>Faculty</span>
                {isFacultyDisabled && <span className="text-[10px] text-amber-600 font-normal">Locked (Contact Admin to change)</span>}
              </label>
              <Select
                name="faculty"
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setSelectedDepartment(""); // Reset department when faculty changes
                }}
                disabled={isLoading || isFacultyDisabled}
                className="text-xs"
                required
              >
                <option value="">Select Faculty</option>
                {Object.keys(UNN_CAMPUS_DATA).map((fac) => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </Select>
            </div>

            {/* Department Dropdown (Filtered by Faculty) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
                <span>Department</span>
                {isDepartmentDisabled && <span className="text-[10px] text-amber-600 font-normal">Locked</span>}
              </label>
              <Select
                name="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                disabled={isLoading || !selectedFaculty || isDepartmentDisabled}
                className="text-xs"
                required
              >
                <option value="">Select Department</option>
                {selectedFaculty &&
                  UNN_CAMPUS_DATA[selectedFaculty]?.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Matric Number</label>
              <Input error={!!errors.matric_number} {...register("matric_number")} placeholder="2020/54321" />
              {errors.matric_number && <p className="text-[11px] text-danger mt-1 font-medium">{errors.matric_number.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Academic Level</label>
              <Select error={!!errors.academic_level} {...register("academic_level")}>
                <option value="">Select Level</option>
                <option value="100 Level">100 Level</option>
                <option value="200 Level">200 Level</option>
                <option value="300 Level">300 Level</option>
                <option value="400 Level">400 Level</option>
                <option value="500 Level">500 Level</option>
                <option value="Graduate">Graduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </Select>
              {errors.academic_level && <p className="text-[11px] text-danger mt-1 font-medium">{errors.academic_level.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: NFCS details & Photo */}
        <div className="space-y-4">
          <div className="border-b border-neutrals-borderLight pb-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">NFCS Affiliation & Photo</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Assigned Organ</label>
              <Select error={!!errors.organ} {...register("organ")} className="uppercase">
                <option value="">Select Organ</option>
                {ORGANS.map((o) => (
                  <option key={o} value={o} className="uppercase">
                    {o.charAt(0).toUpperCase() + o.slice(1).replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
              {errors.organ && <p className="text-[11px] text-danger mt-1 font-medium">{errors.organ.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Society/Association (Optional)</label>
              <Input {...register("society")} placeholder="e.g. Block Rosary" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Home Parish (Optional)</label>
              <Input {...register("parish")} placeholder="e.g. St. Albert" />
            </div>
          </div>

          {/* Photo Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">Passport Photograph</label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-gray-200 bg-surface-subtle">
              <div className="h-24 w-24 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Passport photo preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-text-tertiary" />
                )}
              </div>
              <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                <div className="relative inline-block">
                  <input
                    type="file"
                    id="passport_photo"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={isLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="secondary" className="gap-2 text-xs">
                    <Upload className="h-3.5 w-3.5" /> Select Image
                  </Button>
                </div>
                <p className="text-[11px] text-text-tertiary">
                  JPEG, PNG, or WEBP up to 2MB. Image will be used for membership profile card.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutrals-borderLight">
          <Button type="submit" variant="primary" className="gap-2 px-6" isLoading={isLoading} disabled={
            disabled
          }>
            Register & Activate Member
          </Button>
        </div>
      </form>
    </div>
  );
}
