import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  Calendar,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Megaphone,
  Sparkles,
  FolderSync,
  User
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch member profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center gap-3">
        <AlertCircle className="h-10 w-10 text-danger" />
        <h2 className="text-base font-bold text-text-primary">Profile Not Found</h2>
        <p className="text-xs text-text-secondary max-w-xs">
          Your profile record could not be found. Please try logging out and registering again.
        </p>
      </div>
    );
  }

  const role = profile.role;
  const isExcoOrAbove = ["exco", "super_admin"].includes(role);

  // Mock stats or data load depending on role
  // Let's create beautiful mock KPI states to populate stats cards
  const memberStats = {
    totalPaid: "₦15,000",
    outstanding: "₦5,000",
    session: "2024/2025",
    eventsCount: 3,
    announcementsCount: 2,
  };

  const adminStats = {
    totalMembers: 342,
    activeMembers: 310,
    pendingApprovals: 12,
    duesCollected: "₦1,540,000",
  };

  return (
    <div className="space-y-6">
      {/* Pending Account Alert Note Card */}
      {profile.status === "pending" && (
        <div className="flex gap-4 p-5 rounded-[12px] bg-status-pendingBackground border border-status-pendingBorder text-status-pendingText animate-in fade-in duration-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-status-pendingText" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Registration Awaiting Approval</h3>
            <p className="text-xs leading-relaxed opacity-95">
              Welcome, <span className="font-semibold">{profile.full_name}</span>! Your registration is currently pending review. An Exco member will verify your department, faculty, and matric number before activating your full directory access.
            </p>
          </div>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="flex flex-col gap-1.5 bg-brand text-white p-6 md:p-8 rounded-[12px] shadow-card relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <Sparkles className="h-32 w-32 text-white" />
        </div>
        <div className="z-10 flex flex-col gap-1">
          <span className="text-[11px] font-semibold tracking-widest uppercase opacity-75">
            Overview
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Peace be with you, {profile.full_name.split(" ")[0]}!
          </h2>
          <p className="text-xs md:text-sm text-brand-light opacity-90 max-w-md">
            Welcome to the NFCS UNN Portal. Access your dues history, check calendar events, and view announcements.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      {isExcoOrAbove ? (
        // Exco/Super Admin KPIs
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Total Members</span>
                <h3 className="text-2xl font-bold text-text-primary">{adminStats.totalMembers}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-brand-light flex items-center justify-center text-brand">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Active Members</span>
                <h3 className="text-2xl font-bold text-text-primary">{adminStats.activeMembers}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1 flex flex-col">
                <span className="text-xs font-semibold text-text-secondary">Pending Approvals</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-text-primary">{adminStats.pendingApprovals}</h3>
                  {adminStats.pendingApprovals > 0 && (
                    <Badge variant="pending">Review required</Badge>
                  )}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Dues Collected</span>
                <h3 className="text-2xl font-bold text-text-primary">{adminStats.duesCollected}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-brand-light flex items-center justify-center text-brand-accent">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Student/Alumnus KPIs
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Dues Paid ({memberStats.session})</span>
                <h3 className="text-2xl font-bold text-text-primary">{memberStats.totalPaid}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-brand-light flex items-center justify-center text-brand">
                <CreditCard className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Outstanding Levy</span>
                <h3 className="text-2xl font-bold text-text-primary">{memberStats.outstanding}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-danger">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Upcoming Events</span>
                <h3 className="text-2xl font-bold text-text-primary">{memberStats.eventsCount}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-5 flex items-center gap-4 justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Announcements</span>
                <h3 className="text-2xl font-bold text-text-primary">{memberStats.announcementsCount}</h3>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                <Megaphone className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Layout Panel Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area: Left/Center 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Shortcut links to key modules</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {isExcoOrAbove ? (
                  <>
                    <Button variant="secondary" asChild className="justify-start gap-2 h-11 text-xs">
                      <Link href="/admin/members">
                        <Users className="h-4 w-4 text-brand" />
                        Directory
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild className="justify-start gap-2 h-11 text-xs">
                      <Link href="/admin/dues">
                        <CreditCard className="h-4 w-4 text-brand" />
                        Dues Records
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild className="justify-start gap-2 h-11 text-xs">
                      <Link href="/admin/members/migrate">
                        <FolderSync className="h-4 w-4 text-brand" />
                        Migrate Members
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" asChild className="justify-start gap-2 h-11 text-xs">
                      <Link href="/dues">
                        <CreditCard className="h-4 w-4 text-brand" />
                        Pay Dues
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild className="justify-start gap-2 h-11 text-xs">
                      <Link href="/profile">
                        <User className="h-4 w-4 text-brand" />
                        My Profile
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild className="justify-start gap-2 h-11 text-xs">
                      <Link href="/events">
                        <Calendar className="h-4 w-4 text-brand" />
                        Events
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcements Feed Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest updates from Chapter Exco</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/announcements">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {/* Mock Announcement 1 */}
              <div className="flex flex-col gap-1 p-4 rounded-[12px] bg-noteCards-green hover:bg-noteCards-greenSurface transition-colors">
                <div className="flex justify-between items-start gap-2 text-noteCards-greenText">
                  <h4 className="text-[13px] font-bold">General Meeting & Dues Audit</h4>
                  <span className="text-[10px] uppercase font-semibold text-noteCards-greenMeta">June 20, 2026</span>
                </div>
                <p className="text-[12px] text-noteCards-greenSubtext leading-relaxed mt-1">
                  We are having our monthly general assembly this Sunday at St. Peter&apos;s Chaplaincy. All members are requested to update their dues records before then.
                </p>
              </div>

              {/* Mock Announcement 2 */}
              <div className="flex flex-col gap-1 p-4 rounded-[12px] bg-noteCards-purple hover:bg-noteCards-purpleSurface transition-colors">
                <div className="flex justify-between items-start gap-2 text-noteCards-purpleText">
                  <h4 className="text-[13px] font-bold">Gospel Band Auditions</h4>
                  <span className="text-[10px] uppercase font-semibold text-noteCards-purpleMeta">June 18, 2026</span>
                </div>
                <p className="text-[12px] text-noteCards-purpleSubtext leading-relaxed mt-1">
                  If you have talent in musical instruments or vocals, join the Gospel Band organ. Auditions are scheduled for Saturday afternoon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel: Right 1 column */}
        <div className="space-y-6">
          {/* Upcoming Event Schedule Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Events</CardTitle>
                <CardDescription>Timetable & meetings</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/events">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-center border-b border-neutrals-borderLight pb-3 last:border-0 last:pb-0">
                  <div className="h-10 w-10 shrink-0 bg-brand-light text-brand rounded-[8px] flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] leading-none uppercase">Jun</span>
                    <span className="text-sm leading-none mt-0.5">25</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text-primary truncate">Mass & Adoration</span>
                    <span className="text-[11px] text-text-tertiary">Chaplaincy Chapel &bull; 4:00 PM</span>
                  </div>
                </div>

                <div className="flex gap-3 items-center border-b border-neutrals-borderLight pb-3 last:border-0 last:pb-0">
                  <div className="h-10 w-10 shrink-0 bg-purple-50 text-purple-700 rounded-[8px] flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] leading-none uppercase">Jun</span>
                    <span className="text-sm leading-none mt-0.5">28</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text-primary truncate">Monthly General Meeting</span>
                    <span className="text-[11px] text-text-tertiary">Hall A &bull; 2:00 PM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
