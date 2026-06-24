import * as React from "react";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-surface-page px-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-[10px] bg-brand flex items-center justify-center text-white font-bold text-xl select-none">
            N
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              NFCS UNN Portal
            </h1>
            <p className="text-xs text-text-secondary">
              Catholic Student & Alumni Member Portal
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="border border-neutrals-borderLight shadow-card bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-base font-semibold text-text-primary">
                Welcome Back
              </h2>
              <p className="text-xs text-text-tertiary">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <LoginForm />

            <div className="mt-6 pt-6 border-t border-neutrals-borderLight text-center text-xs">
              <span className="text-text-tertiary">New member? </span>
              <Link href="/register" className="font-semibold text-brand-accent hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[10px] text-text-tertiary">
          &copy; {new Date().getFullYear()} NFCS UNN. All rights reserved.
        </p>
      </div>
    </main>
  );
}
