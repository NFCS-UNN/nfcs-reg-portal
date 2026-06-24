"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, type MemberFormValues, ORGANS } from "@/lib/validations/member.schema";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { registerMember } from "@/lib/actions/member.actions";
import { 
  AlertCircle, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Pencil, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  MapPin, 
  School, 
  GraduationCap, 
  Hash, 
  Award, 
  Music, 
  Church,
  Eye,
  EyeOff,
  LayoutDashboard
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export function RegistrationForm() {
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    mode: "onBlur",
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

  const watchedValues = watch();
  const passwordVal = watchedValues.password || "";

  // Password rules validation for checklist
  const passwordRules = {
    lowercase: /[a-z]/.test(passwordVal),
    uppercase: /[A-Z]/.test(passwordVal),
    numbers: /[0-9]/.test(passwordVal),
    length: passwordVal.length >= 6,
  };

  // Photo change handler
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

  // Nav handles
  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["full_name", "email", "password", "phone"];
    } else if (step === 2) {
      fieldsToValidate = ["faculty", "department", "matric_number", "academic_level"];
    } else if (step === 3) {
      fieldsToValidate = ["organ"];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (values: MemberFormValues) => {
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
      const result = await registerMember(formData);
      console.log("[register/onSubmit] server action result:", result);
      if (result?.success === true) {
        setSuccess(true);
        toast({
          title: "Registration Submitted",
          description: "Your registration is awaiting exco approval.",
          variant: "success",
        });
      } else if (result?.error) {
        const errMsg = typeof result.error === "string"
          ? result.error
          : JSON.stringify(result.error) || "Registration failed. Please try again.";
        setError(errMsg);
        toast({
          title: "Registration Failed",
          description: errMsg,
          variant: "error",
        });
      } else {
        const errMsg = "Server error: could not complete registration. Please try again.";
        setError(errMsg);
        toast({ title: "Registration Failed", description: errMsg, variant: "error" });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stateful submit handler — wraps onSubmit for the animated button promise API
  const handleStatefulSubmit = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      // handleSubmit validates and calls fn; if validation fails fn is never called
      const submitPromise = handleSubmit(async (values) => {
        setIsLoading(true);
        setError(null);
        const formData = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            formData.append(key, String(val));
          }
        });
        if (photoFile) formData.append("passport_photo", photoFile);
        try {
          const result = await registerMember(formData);
          console.log("[register] server action result:", result);
          if (result?.success === true) {
            setSuccess(true);
            toast({
              title: "Registration Submitted",
              description: "Your registration is awaiting exco approval.",
              variant: "success",
            });
            resolve();
          } else if (result?.error) {
            const errMsg = typeof result.error === "string"
              ? result.error
              : JSON.stringify(result.error) || "Registration failed. Please try again.";
            setError(errMsg);
            toast({ title: "Registration Failed", description: errMsg, variant: "error" });
            resolve(); // Resolve so the button resets — error is shown in UI
          } else {
            // Empty {} or unknown response — likely a Next.js serialization error
            const errMsg = "Server error: could not complete registration. Please try again.";
            setError(errMsg);
            toast({ title: "Registration Failed", description: errMsg, variant: "error" });
            resolve(); // Resolve so the button resets — error is shown in UI
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
          setError(msg);
          toast({ title: "Submission Error", description: msg, variant: "error" });
          resolve(); // Resolve so the button resets — error is shown in UI
        } finally {
          setIsLoading(false);
        }
      }, (validationErrors) => {
        // Called when RHF validation fails — resolve so the button resets
        const firstError = Object.values(validationErrors)[0];
        const msg = firstError?.message as string ?? "Please fill in all required fields.";
        toast({ title: "Validation Error", description: msg, variant: "error" });
        resolve(); // Resolve so the button resets — error is shown via toast
      })();

      // If handleSubmit itself throws synchronously, catch it
      if (submitPromise && typeof submitPromise.catch === "function") {
        submitPromise.catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Submission failed.";
          setError(msg);
          toast({ title: "Submission Error", description: msg, variant: "error" });
          resolve();
        });
      }
    });
  };


  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-12 px-6">
        <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm animate-bounce">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">Registration Submitted!</h3>
          <p className="text-sm text-text-secondary max-w-md leading-relaxed">
            Thank you for registering. Your profile has been created with a <strong className="text-brand-orange">pending</strong> status. An Exco member will review your credentials and approve your account shortly.
          </p>
        </div>
        <Button asChild variant="primary" className="mt-4 px-8 py-2.5 h-auto text-sm font-semibold rounded-xl bg-brand hover:bg-brand-accent transition-colors shadow-lg">
          <a href="/login">Go to Login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row min-h-[520px]">
        {/* LEFT COLUMN: Vertical Stepper Timeline */}
        <div className="w-full md:w-[320px] bg-slate-50/70 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 select-none">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registration Steps</h3>
              <p className="text-xs text-text-tertiary">Follow the timeline to register</p>
            </div>

            {/* Stepper items */}
            <div className="relative pl-1 space-y-8">
              {/* Stepper vertical line indicator */}
              <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-slate-200" />

              {/* Step 1: Account Setup */}
              <div 
                onClick={() => step > 1 && setStep(1)}
                className={cn(
                  "relative flex items-start gap-4 transition-all duration-200",
                  step > 1 ? "cursor-pointer hover:opacity-90" : ""
                )}
              >
                <div 
                  className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-200 shadow-sm shrink-0",
                    step === 1 && "bg-[#38BDF8] text-slate-900 border-[#38BDF8] ring-4 ring-sky-500/10 scale-110",
                    step > 1 && "bg-brand text-white border-brand",
                    step < 1 && "bg-white text-text-tertiary border-slate-200"
                  )}
                >
                  {step > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold", step === 1 ? "text-[#0EA5E9]" : "text-slate-700")}>
                      Personal Details
                    </span>
                    {step > 1 && <Pencil className="h-3 w-3 text-text-tertiary shrink-0" />}
                  </div>
                  {step > 1 && watchedValues.full_name && (
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {watchedValues.full_name}
                    </p>
                  )}
                  {step > 1 && watchedValues.email && (
                    <p className="text-[10px] text-text-tertiary truncate">
                      {watchedValues.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Academic Info */}
              <div 
                onClick={() => step > 2 && setStep(2)}
                className={cn(
                  "relative flex items-start gap-4 transition-all duration-200",
                  step > 2 ? "cursor-pointer hover:opacity-90" : ""
                )}
              >
                <div 
                  className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-200 shadow-sm shrink-0",
                    step === 2 && "bg-[#38BDF8] text-slate-900 border-[#38BDF8] ring-4 ring-sky-500/10 scale-110",
                    step > 2 && "bg-brand text-white border-brand",
                    step < 2 && "bg-white text-text-tertiary border-slate-200"
                  )}
                >
                  {step > 2 ? <CheckCircle className="h-4 w-4" /> : "2"}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-bold", step === 2 ? "text-[#0EA5E9]" : "text-slate-500")}>
                      Academic Info
                    </span>
                    {step > 2 && <Pencil className="h-3 w-3 text-text-tertiary shrink-0" />}
                  </div>
                  {step > 2 && watchedValues.matric_number && (
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      Matric: {watchedValues.matric_number}
                    </p>
                  )}
                  {step > 2 && watchedValues.department && (
                    <p className="text-[10px] text-text-tertiary truncate">
                      Dept: {watchedValues.department}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Catholic & Photo */}
              <div 
                onClick={() => step > 3 && setStep(3)}
                className={cn(
                  "relative flex items-start gap-4 transition-all duration-200",
                  step > 3 ? "cursor-pointer hover:opacity-90" : ""
                )}
              >
                <div 
                  className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-200 shadow-sm shrink-0",
                    step === 3 && "bg-[#38BDF8] text-slate-900 border-[#38BDF8] ring-4 ring-sky-500/10 scale-110",
                    step > 3 && "bg-brand text-white border-brand",
                    step < 3 && "bg-white text-text-tertiary border-slate-200"
                  )}
                >
                  {step > 3 ? <CheckCircle className="h-4 w-4" /> : "3"}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-bold", step === 3 ? "text-[#0EA5E9]" : "text-slate-500")}>
                      Catholic & Photo
                    </span>
                    {step > 3 && <Pencil className="h-3 w-3 text-text-tertiary shrink-0" />}
                  </div>
                  {step > 3 && watchedValues.organ && (
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      Organ: {watchedValues.organ.replace(/_/g, " ").toUpperCase()}
                    </p>
                  )}
                  {step > 3 && photoFile && (
                    <p className="text-[10px] text-emerald-600 font-medium">
                      ✓ Photo Selected
                    </p>
                  )}
                </div>
              </div>

              {/* Step 4: Confirm Details */}
              <div className="relative flex items-start gap-4 transition-all duration-200">
                <div 
                  className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-200 shadow-sm shrink-0",
                    step === 4 && "bg-[#38BDF8] text-slate-900 border-[#38BDF8] ring-4 ring-sky-500/10 scale-110",
                    step < 4 && "bg-white text-text-tertiary border-slate-200"
                  )}
                >
                  4
                </div>
                <div className="flex-1 pt-0.5">
                  <span className={cn("text-xs font-bold", step === 4 ? "text-[#0EA5E9]" : "text-slate-500")}>
                    Confirm Details
                  </span>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    Review and submit portal request
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center md:text-left">
            <span className="text-[11px] text-text-tertiary">Already registered? </span>
            <Link href="/login" className="text-[11px] font-bold text-brand hover:underline">
              Sign In instead
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Inputs */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-h-[440px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-100 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Personal Details</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">Enter your contact and profile details to create your account.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.full_name} 
                        {...register("full_name")} 
                        placeholder="John Doe" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.email} 
                        type="email" 
                        {...register("email")} 
                        placeholder="john@example.com" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Password with checklist & visibility toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.password} 
                        type={showPassword ? "text" : "password"} 
                        {...register("password")} 
                        placeholder="••••••••" 
                        className="pl-9 pr-9 h-10 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password.message}
                      </p>
                    )}

                    {/* Password requirements checklist */}
                    <div className="mt-2.5 p-3 bg-slate-50/50 rounded-lg border border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Password must contain:</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", passwordRules.lowercase ? "bg-emerald-500" : "bg-slate-300")} />
                          <span>lower-case</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", passwordRules.numbers ? "bg-emerald-500" : "bg-slate-300")} />
                          <span>numbers</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", passwordRules.uppercase ? "bg-emerald-500" : "bg-slate-300")} />
                          <span>upper-case</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", passwordRules.length ? "bg-emerald-500" : "bg-slate-300")} />
                          <span>6+ characters</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.phone} 
                        {...register("phone")} 
                        placeholder="08012345678" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Date of Birth (Optional)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        type="date" 
                        error={!!errors.date_of_birth} 
                        {...register("date_of_birth")} 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Residential Address (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.address} 
                        {...register("address")} 
                        placeholder="12 University Road" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="gap-2 select-none h-10 rounded-lg text-xs bg-[#38BDF8] text-slate-900 hover:bg-[#0EA5E9] hover:text-white px-6 shadow-sm font-semibold border-none"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Info */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Academic Information</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">Provide your university student credentials to complete academic setup.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Faculty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Faculty</label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.faculty} 
                        {...register("faculty")} 
                        placeholder="Engineering" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                    {errors.faculty && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.faculty.message}
                      </p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Department</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.department} 
                        {...register("department")} 
                        placeholder="Mechanical Engineering" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                    {errors.department && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.department.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Matric Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Matric Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        error={!!errors.matric_number} 
                        {...register("matric_number")} 
                        placeholder="2019/123456" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                    {errors.matric_number && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.matric_number.message}
                      </p>
                    )}
                  </div>

                  {/* Academic Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Academic Level</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none z-10" />
                      <Select 
                        error={!!errors.academic_level} 
                        {...register("academic_level")}
                        className="pl-9 h-10 rounded-lg text-xs"
                      >
                        <option value="">Select Level</option>
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                        <option value="500 Level">500 Level</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </Select>
                    </div>
                    {errors.academic_level && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.academic_level.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={prevStep} 
                    className="gap-2 select-none h-10 rounded-lg text-xs hover:bg-slate-100 px-5 shadow-sm font-semibold border border-slate-200"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="gap-2 select-none h-10 rounded-lg text-xs bg-brand text-white hover:bg-brand-accent px-6 shadow-sm font-semibold"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Catholic & Photo */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">NFCS & Profile Photo</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">Select your assigned organ and upload a professional passport photograph.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Assigned Organ */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Assigned Organ</label>
                    <div className="relative">
                      <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none z-10" />
                      <Select 
                        error={!!errors.organ} 
                        {...register("organ")}
                        className="pl-9 h-10 rounded-lg text-xs"
                      >
                        <option value="">Select Organ</option>
                        {ORGANS.map((o) => (
                          <option key={o} value={o}>
                            {o.replace(/_/g, " ").toUpperCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {errors.organ && (
                      <p className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {errors.organ.message}
                      </p>
                    )}
                  </div>

                  {/* Society */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Society/Association (Opt)</label>
                    <div className="relative">
                      <Church className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        {...register("society")} 
                        placeholder="e.g. St. Jude" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Home Parish */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Home Parish (Optional)</label>
                    <div className="relative">
                      <Church className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                      <Input 
                        {...register("parish")} 
                        placeholder="e.g. St. Peter's" 
                        className="pl-9 h-10 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Photo Upload Zone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Passport Photograph</label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-accent transition-all duration-150">
                    {/* Photo Preview */}
                    <div className="h-20 w-20 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative group">
                      {photoPreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoPreview} alt="Passport preview" className="h-full w-full object-cover" />
                        </>
                      ) : (
                        <Upload className="h-6 w-6 text-text-tertiary" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 w-full text-center sm:text-left">
                      <div className="relative inline-block">
                        <input
                          type="file"
                          id="passport_photo"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          disabled={isLoading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="gap-2 text-[11px] h-8 rounded-lg hover:bg-slate-200 border border-slate-200 font-semibold"
                        >
                          <Upload className="h-3.5 w-3.5" /> Choose Image
                        </Button>
                      </div>
                      <p className="text-[10px] text-text-tertiary leading-normal">
                        JPEG, PNG, or WEBP up to 2MB. Your passport image will be used for your official Digital Membership ID Card.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={prevStep} 
                    className="gap-2 select-none h-10 rounded-lg text-xs hover:bg-slate-100 px-5 shadow-sm font-semibold border border-slate-200"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="gap-2 select-none h-10 rounded-lg text-xs bg-brand text-white hover:bg-brand-accent px-6 shadow-sm font-semibold"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Confirm Details & Consent */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Confirm Details</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">Please review your submission details before completing registration.</p>
                </div>

                <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-4 text-xs">
                  {/* Account Summary */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-200/60 gap-1.5">
                    <div>
                      <span className="font-bold text-slate-800">Account: </span>
                      <span className="text-text-secondary">{watchedValues.full_name} ({watchedValues.email})</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="text-brand hover:underline font-bold self-start sm:self-auto"
                    >
                      Edit Info
                    </button>
                  </div>

                  {/* Academic Summary */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-200/60 gap-1.5">
                    <div>
                      <span className="font-bold text-slate-800">Academic: </span>
                      <span className="text-text-secondary">{watchedValues.department} ({watchedValues.matric_number}) — {watchedValues.academic_level}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setStep(2)} 
                      className="text-brand hover:underline font-bold self-start sm:self-auto"
                    >
                      Edit Info
                    </button>
                  </div>

                  {/* Organ Summary */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                    <div>
                      <span className="font-bold text-slate-800">NFCS Organ: </span>
                      <span className="text-text-secondary">
                        {watchedValues.organ ? watchedValues.organ.replace(/_/g, " ").toUpperCase() : "None"}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setStep(3)} 
                      className="text-brand hover:underline font-bold self-start sm:self-auto"
                    >
                      Edit Info
                    </button>
                  </div>
                </div>

                {/* Consent & Policy Agreement Text */}
                <div className="p-4 rounded-xl bg-orange-50/30 border border-orange-100 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Consent & Agreement</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      By submitting this registration request, you agree to the NFCS Portal <strong className="text-slate-800">Terms and Conditions</strong>, and confirm that you have read and understood our <strong className="text-slate-800">Data Use Policy</strong>. Your account will undergo Exco review for approval.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={prevStep} 
                    className="gap-2 select-none h-10 rounded-lg text-xs hover:bg-slate-100 px-5 shadow-sm font-semibold border border-slate-200"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <StatefulButton
                    type="button"
                    onClick={handleStatefulSubmit}
                    className="gap-2 rounded-lg px-6 h-10 text-xs font-bold"
                  >
                    I Agree &amp; Submit
                  </StatefulButton>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* BOTTOM BANNER: Get access to Premium Dashboard */}
      <div className="w-full bg-gradient-to-r from-[#082040] via-[#0C3A6E] to-[#082040] text-white p-6 flex flex-col sm:flex-row items-center justify-between border-t border-sky-900/30 relative overflow-hidden select-none gap-4">
        {/* Glow effect backgrounds */}
        <div className="absolute right-0 top-[-50%] w-[150px] h-[150px] rounded-full bg-[#38BDF8] opacity-25 blur-[40px] pointer-events-none" />
        <div className="absolute left-[30%] bottom-[-50%] w-[200px] h-[200px] rounded-full bg-[#0EA5E9] opacity-20 blur-[50px] pointer-events-none" />

        <div className="space-y-1 text-center sm:text-left z-10 max-w-lg">
          <h4 className="text-sm font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-1.5">
            <LayoutDashboard className="h-4 w-4 text-brand-orange animate-pulse" />
            Get access to your Premium Dashboard
          </h4>
          <p className="text-[11px] text-blue-200 opacity-90 leading-normal">
            Complete registration to manage your profile, pay dues, view session history, and access digital membership services upon account approval.
          </p>
        </div>

        {/* CSS Mockup Dashboard Shape */}
        <div className="relative shrink-0 z-10 h-16 w-32 rounded-lg bg-[#0F265C] border border-blue-400/20 p-2 overflow-hidden shadow-md flex flex-col gap-1">
          {/* Header layout */}
          <div className="flex justify-between items-center pb-1 border-b border-blue-400/10">
            <div className="flex gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500/80" />
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/80" />
              <div className="h-1.5 w-1.5 rounded-full bg-green-500/80" />
            </div>
            <div className="h-1.5 w-12 bg-blue-400/20 rounded-full" />
          </div>
          {/* Body mockup content */}
          <div className="flex gap-2 pt-1 flex-1">
            <div className="w-8 flex flex-col gap-1 shrink-0">
              <div className="h-2 w-full bg-brand-orange rounded-sm opacity-90" />
              <div className="h-1.5 w-4/5 bg-blue-300/30 rounded-sm" />
              <div className="h-1.5 w-3/5 bg-blue-300/20 rounded-sm" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-3 w-full bg-blue-400/20 rounded-sm" />
              <div className="flex justify-between gap-1 mt-0.5">
                <div className="h-3 w-1/3 bg-[#134074] rounded-sm" />
                <div className="h-3 w-1/2 bg-[#1E3A8A] rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
