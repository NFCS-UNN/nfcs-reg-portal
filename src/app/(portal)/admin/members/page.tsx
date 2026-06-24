import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Filter, ShieldCheck, Mail, Phone, Eye } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: {
    search?: string;
    status?: string;
    organ?: string;
  };
}

export default async function AdminMembersPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const search = searchParams.search || "";
  const status = searchParams.status || "all";
  const organ = searchParams.organ || "all";

  // Build query
  let query = supabase.from("profiles").select("*");

  if (status !== "all") {
    if (status === "alumni") {
      query = query.eq("role", "alumnus");
    } else {
      query = query.eq("status", status);
    }
  }

  if (organ !== "all") {
    query = query.eq("organ", organ);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,matric_number.ilike.%${search}%`);
  }

  // Sort by created_at desc
  query = query.order("created_at", { ascending: false });

  const { data: members, error } = await query;

  return (
    <div className="space-y-6">
      {/* Directory Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Member Directory
          </h1>
          <p className="text-xs text-text-secondary">
            View, approve, and manage chapter members and alumni.
          </p>
        </div>
        
        <Button asChild variant="primary" className="sm:self-end">
          <Link href="/admin/members/add" className="gap-2">
            <Plus className="h-4 w-4" /> Add Member
          </Link>
        </Button>
      </div>

      {/* Filters and Search Row */}
      <Card className="border border-neutrals-borderLight shadow-card bg-white">
        <CardContent className="p-4">
          <form method="GET" className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-[10px] h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search name, email, matric..."
                className="h-9 w-full rounded-lg bg-surface-page border border-transparent pl-9 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary transition-all focus:border-brand-accent focus:bg-white focus:outline-none focus:shadow-inputFocus"
              />
            </div>

            {/* Filter Status Pilltabs (we will use URL query triggers) */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-text-secondary select-none">Status:</span>
              <div className="flex gap-1.5 bg-surface-page p-1 rounded-lg">
                {[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Active", value: "active" },
                  { label: "Alumni", value: "alumni" },
                ].map((s) => {
                  const isActive = status === s.value;
                  return (
                    <Link
                      key={s.value}
                      href={`/admin/members?status=${s.value}&organ=${organ}&search=${search}`}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all select-none",
                        isActive
                          ? "bg-white text-text-primary shadow-pillTabActive"
                          : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {s.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Organ Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary select-none">Organ:</span>
              <select
                name="organ"
                defaultValue={organ}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-text-primary focus:border-brand-accent focus:outline-none"
              >
                <option value="all">All Organs</option>
                <option value="gospel_band">Gospel Band</option>
                <option value="evangelical_committee">Evangelical Committee</option>
                <option value="federation_theater">Federation Theater</option>
                <option value="social_communications_commission">Social Comms</option>
                <option value="discipline_committee">Discipline Committee</option>
              </select>
            </div>

            <Button type="submit" variant="secondary" className="h-9 px-4 text-xs font-semibold">
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Directory Table Grid */}
      {error ? (
        <div className="text-center py-10 bg-white rounded-[12px] border border-neutrals-borderLight">
          <AlertCircle className="mx-auto h-10 w-10 text-danger mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Failed to load directory</h3>
          <p className="text-xs text-text-secondary mt-1">{error.message}</p>
        </div>
      ) : !members || members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[12px] border border-neutrals-borderLight shadow-card">
          <Users className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
          <h3 className="text-sm font-bold text-text-primary">No members found</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
            Try adjusting your search criteria or register a new member using the onsite form.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member Details</TableHead>
                <TableHead>Matric Number</TableHead>
                <TableHead>Department / Faculty</TableHead>
                <TableHead>Assigned Organ</TableHead>
                <TableHead>Status & Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  {/* Name and avatar info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.passport_photo_url}
                        name={member.full_name}
                        size="md"
                        className="border border-neutrals-borderLight"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-text-primary truncate flex items-center gap-1">
                          {member.full_name}
                          {member.status === "active" && (
                            <ShieldCheck className="h-4 w-4 text-brand-accent shrink-0" />
                          )}
                        </span>
                        <span className="text-xs text-text-tertiary truncate flex items-center gap-1 select-all">
                          <Mail className="h-3 w-3 shrink-0" /> {member.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Matric number monospace */}
                  <TableCell variant="mono">
                    {member.matric_number || "—"}
                  </TableCell>

                  {/* Department & Faculty */}
                  <TableCell variant="secondary">
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary text-[13px]">{member.department || "—"}</span>
                      <span className="text-text-tertiary text-xs">{member.faculty || "—"}</span>
                    </div>
                  </TableCell>

                  {/* Assigned Organ */}
                  <TableCell variant="secondary">
                    <span className="capitalize">
                      {member.organ ? member.organ.replace("_", " ") : "Not assigned"}
                    </span>
                  </TableCell>

                  {/* Status & Role Badges */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={member.status}>{member.status}</Badge>
                      <Badge variant={member.role}>{member.role}</Badge>
                    </div>
                  </TableCell>

                  {/* Actions column */}
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm" className="h-8 px-2.5">
                      <Link href={`/admin/members/${member.id}`} className="gap-1.5 text-xs font-semibold">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}
