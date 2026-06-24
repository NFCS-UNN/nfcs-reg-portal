"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-full bg-surface-page">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Page Content Wrapper */}
      <div className="flex flex-col md:pl-[220px]">
        {/* Top Header Bar */}
        <Navbar onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Inner Content Area */}
        <main className="flex-1 w-full max-w-[1280px] p-6 mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
