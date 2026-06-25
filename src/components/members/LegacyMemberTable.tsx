"use client";

import * as React from "react";
import {
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatTimeAgo } from "@/lib/utils/date";
import { UNN_CAMPUS_DATA } from "@/lib/utils/unn-data";
import {
  sendClaimInvite,
  revokeLegacyInvite,
  deleteLegacyMember,
  updateLegacyMember,
} from "@/lib/actions/migration.actions";
import {
  Search,
  Mail,
  UserCheck,
  Send,
  RefreshCw,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface LegacyMember {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  matric_number: string | null;
  faculty: string | null;
  department: string | null;
  academic_level: string | null;
  organ: string | null;
  society: string | null;
  parish: string | null;
  notes: string | null;
  claim_status: string;
  claim_token: string | null;
  claim_token_expires: string | null;
  created_at: string;
}

interface LegacyMemberTableProps {
  initialMembers: LegacyMember[];
  excoId: string;
  currentUserRole?: string;
}

function getClaimStatusVariant(status: string) {
  switch (status) {
    case "claimed":
      return "active";
    case "invited":
      return "pending";
    case "unclaimed":
    default:
      return "inactive";
  }
}

export function LegacyMemberTable({ initialMembers, excoId, currentUserRole }: LegacyMemberTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [members, setMembers] = React.useState<LegacyMember[]>(initialMembers);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [processingAction, setProcessingAction] = React.useState<string | null>(null);

  // Edit Modal State
  const [editingMember, setEditingMember] = React.useState<LegacyMember | null>(null);
  const [editFaculty, setEditFaculty] = React.useState("");
  const [editDepartment, setEditDepartment] = React.useState("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // Sync state if initialProps change
  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Sync edit modal selects
  React.useEffect(() => {
    if (editingMember) {
      setEditFaculty(editingMember.faculty || "");
      setEditDepartment(editingMember.department || "");
    }
  }, [editingMember]);

  // Actions
  const handleInvite = async (id: string, isResend: boolean) => {
    setProcessingId(id);
    setProcessingAction(isResend ? "resend" : "invite");
    try {
      const res = await sendClaimInvite(id, excoId);
      if (res.error) {
        toast({
          title: "Invitation Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: isResend ? "Invitation Resent" : "Invitation Sent",
          description: `Claim link successfully generated: ${res.claimUrl}`,
          variant: "success",
          duration: 6000, // Show longer so they can grab the mock link if email isn't configured
        });
        router.refresh();
      }
    } catch (err: any) {
      toast({
        title: "Action Failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Are you sure you want to revoke this claim invitation? The token will be deleted.")) {
      return;
    }
    setProcessingId(id);
    setProcessingAction("revoke");
    try {
      const res = await revokeLegacyInvite(id, excoId);
      if (res.error) {
        toast({
          title: "Action Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Invitation Revoked",
          description: "The claim token has been deleted and status reset to unclaimed.",
          variant: "success",
        });
        router.refresh();
      }
    } catch (err: any) {
      toast({
        title: "Action Failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this legacy member record? This will also delete any imported payments and cannot be undone.")) {
      return;
    }
    setProcessingId(id);
    setProcessingAction("delete");
    try {
      const res = await deleteLegacyMember(id, excoId);
      if (res.error) {
        toast({
          title: "Action Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Record Deleted",
          description: "Legacy member record has been permanently deleted.",
          variant: "success",
        });
        router.refresh();
      }
    } catch (err: any) {
      toast({
        title: "Action Failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSavingEdit(true);

    const formData = new FormData(e.currentTarget);
    const values = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      matric_number: formData.get("matric_number") as string || undefined,
      faculty: editFaculty || undefined,
      department: editDepartment || undefined,
      academic_level: formData.get("academic_level") as string || undefined,
      organ: formData.get("organ") as any || undefined,
      society: formData.get("society") as string || undefined,
      parish: formData.get("parish") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const res = await updateLegacyMember(editingMember.id, values, excoId);
      if (res.error) {
        toast({
          title: "Update Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Record Updated",
          description: "The legacy member biodata has been successfully updated.",
          variant: "success",
        });
        setEditingMember(null);
        router.refresh();
      }
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.message || "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filter legacy members
  const filteredMembers = React.useMemo(() => {
    let result = [...members];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(query) ||
          (m.matric_number || "").toLowerCase().includes(query) ||
          (m.email || "").toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((m) => m.claim_status === statusFilter);
    }

    return result;
  }, [members, search, statusFilter]);

  const facultiesList = Object.keys(UNN_CAMPUS_DATA);
  const departmentsList = editFaculty ? UNN_CAMPUS_DATA[editFaculty] || [] : [];

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-[10px] h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search legacy name, matric, or email..."
            className="h-9 w-full rounded-lg bg-surface-page border border-transparent pl-9 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary transition-all focus:border-brand-accent focus:bg-white dark:focus:bg-prussian-blue-3 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-text-secondary whitespace-nowrap select-none">Claim Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full sm:w-36 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-prussian-blue-2 px-2.5 py-1 text-xs text-text-primary focus:border-brand-accent focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="invited">Invited</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>
      </div>

      {/* Legacy Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-prussian-blue-2 rounded-[12px] border border-neutrals-borderLight shadow-card">
          <HelpCircle className="mx-auto h-8 w-8 text-text-tertiary mb-3" />
          <h3 className="text-sm font-bold text-text-primary">No legacy records found</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
            Try adjusting your search filters or migrate new members from your dashboard migration tab.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legacy Member Details</TableHead>
                <TableHead>Matric Number</TableHead>
                <TableHead>Department / Faculty</TableHead>
                <TableHead>Claim Status</TableHead>
                <TableHead>Joined / Migrated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((m) => {
                const isProcessing = processingId === m.id;

                return (
                  <TableRow key={m.id}>
                    {/* Member Details */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={m.full_name}
                          size="md"
                          className="border border-neutrals-borderLight bg-neutral-400 text-white"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-text-primary truncate">{m.full_name}</span>
                          <span className="text-[10px] text-text-tertiary truncate flex items-center gap-1 select-all">
                            <Mail className="h-3 w-3 shrink-0" /> {m.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Matric Number */}
                    <TableCell variant="mono">
                      {m.matric_number || "—"}
                    </TableCell>

                    {/* Department & Faculty */}
                    <TableCell variant="secondary">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary text-xs">{m.department || "—"}</span>
                        <span className="text-text-tertiary text-[10px]">{m.faculty || "—"}</span>
                      </div>
                    </TableCell>

                    {/* Claim Status badge */}
                    <TableCell>
                      <Badge variant={getClaimStatusVariant(m.claim_status)} className="capitalize">
                        {m.claim_status}
                      </Badge>
                    </TableCell>

                    {/* Migrated at */}
                    <TableCell variant="secondary">
                      {formatTimeAgo(m.created_at)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Invite / Resend Invite Actions */}
                        {m.claim_status === "unclaimed" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleInvite(m.id, false)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                            title="Send Claim Invite"
                          >
                            {isProcessing && processingAction === "invite" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}

                        {m.claim_status === "invited" && (
                          <>
                            <Button
                              variant="ghost"
                              onClick={() => handleInvite(m.id, true)}
                              disabled={isProcessing}
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                              title="Resend Claim Invite"
                            >
                              {isProcessing && processingAction === "resend" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              onClick={() => handleRevoke(m.id)}
                              disabled={isProcessing}
                              className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                              title="Revoke Invite Token"
                            >
                              {isProcessing && processingAction === "revoke" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </>
                        )}

                        {/* Edit Action (only if unclaimed or invited) */}
                        {m.claim_status !== "claimed" && (
                          <Button
                            variant="ghost"
                            onClick={() => setEditingMember(m)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-brand hover:text-brand-accent hover:bg-brand-light"
                            title="Edit Legacy Member"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Delete Action — super_admin only, unclaimed/invited only */}
                        {m.claim_status !== "claimed" && currentUserRole === "super_admin" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(m.id)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-danger hover:text-danger-hover hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Delete Legacy Record (Super Admin only)"
                          >
                            {isProcessing && processingAction === "delete" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}

                        {m.claim_status === "claimed" && (
                          <div className="text-[10px] text-emerald-600 font-semibold px-2 flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5" /> Claimed
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrapper>
      )}

      {/* Edit Modal Overlay */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 select-none animate-in fade-in-50">
          <div className="bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight w-full max-w-xl rounded-xl shadow-modal overflow-hidden animate-in scale-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutrals-borderLight px-5 py-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-text-primary">Edit Legacy Member Profile</h3>
                <p className="text-[11px] text-text-secondary">Update the details of legacy member: {editingMember.full_name}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingMember(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Full Name</label>
                  <Input name="full_name" defaultValue={editingMember.full_name} required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Email Address</label>
                  <Input name="email" type="email" defaultValue={editingMember.email || ""} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Phone Number</label>
                  <Input name="phone" defaultValue={editingMember.phone || ""} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Matric Number</label>
                  <Input name="matric_number" defaultValue={editingMember.matric_number || ""} />
                </div>
              </div>

              {/* Faculty & Department Autofill Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Faculty</label>
                  <select
                    value={editFaculty}
                    onChange={(e) => {
                      setEditFaculty(e.target.value);
                      setEditDepartment("");
                    }}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white dark:bg-prussian-blue-2 px-3 py-1.5 text-[13px] text-text-primary focus:border-brand-accent focus:outline-none"
                  >
                    <option value="">Select Faculty...</option>
                    {facultiesList.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white dark:bg-prussian-blue-2 px-3 py-1.5 text-[13px] text-text-primary focus:border-brand-accent focus:outline-none"
                    disabled={!editFaculty}
                  >
                    <option value="">Select Department...</option>
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Academic Level</label>
                  <Select name="academic_level" defaultValue={editingMember.academic_level || "100 Level"}>
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                    <option value="500 Level">500 Level</option>
                    <option value="600 Level">600 Level</option>
                    <option value="Alumnus">Alumnus</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">NFCS Assigned Organ</label>
                  <Select name="organ" defaultValue={editingMember.organ || ""}>
                    <option value="">Not assigned</option>
                    <option value="gospel_band">Gospel Band</option>
                    <option value="evangelical_committee">Evangelical Committee</option>
                    <option value="federation_theater">Federation Theater</option>
                    <option value="social_communications_commission">Social Comms</option>
                    <option value="discipline_committee">Discipline Committee</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Society within Organ</label>
                  <Input name="society" defaultValue={editingMember.society || ""} placeholder="e.g. Choir" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Home Catholic Parish</label>
                  <Input name="parish" defaultValue={editingMember.parish || ""} placeholder="e.g. St. Peter's" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Additional Notes</label>
                <Input name="notes" defaultValue={editingMember.notes || ""} placeholder="e.g. physical register records show dues clear up to 2023" />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-neutrals-borderLight">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingMember(null)}
                  disabled={isSavingEdit}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingEdit}
                  className="px-6"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
