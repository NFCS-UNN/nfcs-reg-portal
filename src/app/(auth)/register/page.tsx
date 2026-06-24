import * as React from "react";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#082040] via-[#0C3060] to-[#051525] py-12 px-4 relative overflow-hidden">
      {/* Decorative background blur elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#38BDF8] opacity-15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0EA5E9] opacity-10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[960px] flex flex-col gap-6 relative z-10 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-[12px] bg-white flex items-center justify-center font-bold text-xl select-none shadow-md border border-[#BAE6FD]" style={{color: '#38BDF8'}}>
            N
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white">
              NFCS UNN Portal
            </h1>
            <p className="text-xs text-blue-200 opacity-80">
              Catholic Student & Alumni Member Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="border border-white/10 shadow-modal bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <RegistrationForm />
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[10px] text-blue-300 opacity-60">
          &copy; {new Date().getFullYear()} NFCS UNN. All rights reserved.
        </p>
      </div>
    </main>
  );
}
