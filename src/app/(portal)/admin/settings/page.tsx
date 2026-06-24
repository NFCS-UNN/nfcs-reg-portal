import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import {
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
  Settings,
  History,
  Lock,
  ArrowRightLeft
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  updateMemberRole,
  suspendMember,
  approveMember
} from "@/lib/actions/member.actions";

interface PageProps {
  searchParams: {
    tab?: string;
    search?: string;
  };
}

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const activeTab = searchParams.tab || "roles";
  const search = searchParams.search || "";

  // Get current session user to ensure they are super admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return redirect("/login");
  }

  // Fetch current user's profile to verify super_admin role
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (!myProfile || myProfile.role !== "super_admin") {
    return redirect("/dashboard");
  }

  // 1. Roles management query
  let profilesQuery = supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (search) {
    profilesQuery = profilesQuery.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,matric_number.ilike.%${search}%`
    );
  }

  const { data: profiles } = await profilesQuery;

  // 2. Audit logs query
  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select(`
      id,
      action,
      target_type,
      target_id,
      metadata,
      created_at,
      profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // Form action handlers
  const handleUpdateRole = async (formData: FormData) => {
    "use server";
    const memberId = formData.get("memberId") as string;
    const role = formData.get("role") as any;
    if (memberId && role) {
      await updateMemberRole(memberId, role, currentUser.id);
    }
  };

  const handleToggleSuspend = async (formData: FormData) => {
    "use server";
    const memberId = formData.get("memberId") as string;
    const currentStatus = formData.get("currentStatus") as string;
    if (memberId) {
      if (currentStatus === "suspended") {
        await approveMember(memberId, currentUser.id); // Re-activates/approves
      } else {
        await suspendMember(memberId, currentUser.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand" /> System Settings
          </h1>
          <p className="text-xs text-text-secondary">
            Manage administrative permissions, update Exco roles, and monitor audit log records.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-1.5 border-b border-neutrals-borderLight pb-px select-none">
        <Link
          href={`/admin/settings?tab=roles&search=${search}`}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold transition-all ${
            activeTab === "roles"
              ? "border-brand text-brand font-bold"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" /> Exco & Roles
        </Link>
        <Link
          href={`/admin/settings?tab=audit&search=${search}`}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold transition-all ${
            activeTab === "audit"
              ? "border-brand text-brand font-bold"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <History className="h-3.5 w-3.5" /> System Audit Logs
        </Link>
      </div>

      {activeTab === "roles" ? (
        <div className="space-y-6">
          {/* Search form for roles */}
          <Card className="border border-neutrals-borderLight shadow-card bg-white">
            <CardContent className="p-4">
              <form method="GET" className="flex items-center gap-2">
                <input type="hidden" name="tab" value="roles" />
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-[10px] h-4 w-4 text-text-tertiary" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Search members to change role or suspend..."
                    className="h-9 w-full rounded-lg bg-surface-page border border-transparent pl-9 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:shadow-inputFocus"
                  />
                </div>
                <Button type="submit" variant="secondary" className="h-9 px-4 text-xs font-semibold">
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Members list & role settings */}
          <Card className="border border-neutrals-borderLight shadow-card bg-white">
            <CardHeader>
              <CardTitle>Member Access Control</CardTitle>
              <CardDescription>
                Assign administrative privileges, update profiles to Exco or Alumnus status, or suspend/restore portal access.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Details</TableHead>
                      <TableHead>Portal Role</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead className="text-right">Action controls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!profiles || profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-xs text-text-tertiary">
                          No matching portal accounts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={profile.passport_photo_url}
                                name={profile.full_name}
                                size="md"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-text-primary truncate">
                                  {profile.full_name} {profile.id === currentUser.id && "(You)"}
                                </span>
                                <span className="text-xs text-text-tertiary truncate">
                                  {profile.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <form action={handleUpdateRole} className="flex items-center gap-2">
                              <input type="hidden" name="memberId" value={profile.id} />
                              <select
                                name="role"
                                defaultValue={profile.role}
                                disabled={profile.id === currentUser.id}
                                className="h-8 rounded-md border border-neutrals-border bg-white px-2 py-0.5 text-xs text-text-primary focus:border-brand-accent focus:outline-none disabled:opacity-60 disabled:bg-surface-page"
                              >
                                <option value="student">Student</option>
                                <option value="alumnus">Alumnus</option>
                                <option value="exco">Exco</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                              {profile.id !== currentUser.id && (
                                <Button type="submit" variant="secondary" size="sm" className="h-8 px-2 font-semibold text-xs text-brand-accent hover:bg-brand-light">
                                  Save Role
                                </Button>
                              )}
                            </form>
                          </TableCell>

                          <TableCell>
                            <Badge variant={profile.status}>{profile.status}</Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            {profile.id !== currentUser.id && (
                              <form action={handleToggleSuspend}>
                                <input type="hidden" name="memberId" value={profile.id} />
                                <input type="hidden" name="currentStatus" value={profile.status} />
                                {profile.status === "suspended" ? (
                                  <Button type="submit" variant="primary" size="sm" className="h-8 px-3 text-xs gap-1.5 font-semibold">
                                    <UserCheck className="h-3.5 w-3.5" /> Restore Access
                                  </Button>
                                ) : (
                                  <Button type="submit" variant="danger" size="sm" className="h-8 px-3 text-xs gap-1.5 font-semibold">
                                    <UserX className="h-3.5 w-3.5" /> Suspend
                                  </Button>
                                )}
                              </form>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Audit Logs card */}
          <Card className="border border-neutrals-borderLight shadow-card bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#6366F1]" /> System Audit Trails
              </CardTitle>
              <CardDescription>
                Review details of recent administrator and system updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin (Actor)</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details & Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!auditLogs || auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-xs text-text-tertiary">
                          No audit log entries found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log: any) => {
                        const actorName = log.profiles?.full_name || "System / Member";
                        const actorEmail = log.profiles?.email || "";
                        
                        // Custom action colors
                        let actionVariant = "neutral";
                        if (log.action.includes("approve") || log.action.includes("confirm")) {
                          actionVariant = "success";
                        } else if (log.action.includes("suspend") || log.action.includes("reject") || log.action.includes("delete")) {
                          actionVariant = "danger";
                        } else if (log.action.includes("create") || log.action.includes("migrate")) {
                          actionVariant = "primary";
                        }

                        return (
                          <TableRow key={log.id} className="hover:bg-surface-page transition-colors">
                            <TableCell className="whitespace-nowrap text-xs text-text-secondary">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-text-primary">{actorName}</span>
                                {actorEmail && (
                                  <span className="text-[10px] text-text-tertiary">{actorEmail}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                actionVariant === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                actionVariant === "danger" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                actionVariant === "primary" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }`}>
                                {log.action.replace(/_/g, " ")}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs md:max-w-md">
                              <div className="flex flex-col gap-1 text-[11px] text-text-secondary font-mono">
                                <div>
                                  <span className="font-semibold text-text-tertiary">Target:</span> {log.target_type} ({log.target_id?.substring(0, 8) || "N/A"})
                                </div>
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                  <div className="bg-surface-page p-1.5 rounded border border-neutrals-borderLight text-[10px] overflow-x-auto whitespace-pre">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
