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
import { useToast } from "@/components/ui/toast";
import { formatTimeAgo } from "@/lib/utils/date";
import {
  confirmPayment,
  reversePayment,
  deletePayment,
} from "@/lib/actions/payment.actions";
import {
  Search,
  Check,
  RotateCcw,
  Trash2,
  Loader2,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentItem {
  id: string;
  amount: number;
  dues_type: string;
  channel: string;
  status: string;
  payment_reference: string | null;
  payment_period: string | null;
  receipt_number: string | null;
  payment_date: string | null;
  created_at: string;
  profile_id: string | null;
  legacy_member_id: string | null;
  notes: string | null;
  profiles?: {
    full_name: string;
    matric_number: string | null;
    passport_photo_url: string | null;
  } | null;
  legacy_members?: {
    full_name: string;
    matric_number: string | null;
  } | null;
  recorder?: {
    full_name: string;
    passport_photo_url: string | null;
  } | null;
}

interface DuesTableProps {
  initialPayments: PaymentItem[];
  currentUserRole?: string;
}

function getPaymentStatusVariant(status: string) {
  switch (status) {
    case "confirmed":
      return "paid";
    case "pending":
      return "pending";
    case "failed":
      return "unpaid";
    case "reversed":
      return "partial";
    default:
      return "inactive";
  }
}

export function DuesTable({ initialPayments, currentUserRole }: DuesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [payments, setPayments] = React.useState<PaymentItem[]>(initialPayments);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [channelFilter, setChannelFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [processingAction, setProcessingAction] = React.useState<string | null>(null);

  // Sync state if initialProps change
  React.useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  // Actions
  const handleConfirm = async (id: string) => {
    setProcessingId(id);
    setProcessingAction("confirm");
    try {
      const res = await confirmPayment(id);
      if (res.error) {
        toast({
          title: "Action Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Payment Confirmed",
          description: "The payment has been successfully confirmed and receipt generated.",
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

  const handleReverse = async (id: string) => {
    if (!window.confirm("Are you sure you want to reverse this payment? This changes the status to reversed.")) {
      return;
    }
    setProcessingId(id);
    setProcessingAction("reverse");
    try {
      const res = await reversePayment(id);
      if (res.error) {
        toast({
          title: "Action Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Payment Reversed",
          description: "The payment status has been successfully reversed.",
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
    if (!window.confirm("Are you sure you want to delete this payment record? This action is permanent and cannot be undone.")) {
      return;
    }
    setProcessingId(id);
    setProcessingAction("delete");
    try {
      const res = await deletePayment(id);
      if (res.error) {
        toast({
          title: "Action Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Record Deleted",
          description: "The payment record has been permanently deleted.",
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

  // Filtering logic
  const filteredPayments = React.useMemo(() => {
    let result = [...payments];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((p) => {
        const memberName = (p.profiles?.full_name || p.legacy_members?.full_name || "").toLowerCase();
        const matric = (p.profiles?.matric_number || p.legacy_members?.matric_number || "").toLowerCase();
        const ref = (p.payment_reference || "").toLowerCase();
        const receipt = (p.receipt_number || "").toLowerCase();
        return memberName.includes(query) || matric.includes(query) || ref.includes(query) || receipt.includes(query);
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Channel filter
    if (channelFilter !== "all") {
      result = result.filter((p) => p.channel === channelFilter);
    }

    // Dues Type filter
    if (typeFilter !== "all") {
      result = result.filter((p) => p.dues_type === typeFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "amount-high") {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === "amount-low") {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });

    return result;
  }, [payments, search, statusFilter, channelFilter, typeFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannelFilter("all");
    setTypeFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters = search || statusFilter !== "all" || channelFilter !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search & Filters Controls */}
      <div className="bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-[10px] h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name, matric, or reference..."
              className="h-9 w-full rounded-lg bg-surface-page border border-transparent pl-9 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary transition-all focus:border-brand-accent focus:bg-white dark:focus:bg-prussian-blue-3 focus:outline-none"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-prussian-blue-2 px-2.5 py-1 text-xs text-text-primary focus:border-brand-accent focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-secondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-prussian-blue-2 px-2 py-0 text-[11px] text-text-primary focus:border-brand-accent focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>

          {/* Channel filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-secondary">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-prussian-blue-2 px-2 py-0 text-[11px] text-text-primary focus:border-brand-accent focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="online">Online</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Dues Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-secondary">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-7 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-prussian-blue-2 px-2 py-0 text-[11px] text-text-primary focus:border-brand-accent focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="membership_levy">Membership Levy</option>
              <option value="annual_dues">Annual Dues</option>
              <option value="special_levy">Special Levy</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-7 px-2.5 text-[11px] font-semibold text-danger hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              Clear Filters
            </Button>
          )}

          {/* Results Counter */}
          <span className="text-[11px] text-text-tertiary ml-auto">
            Showing {filteredPayments.length} of {payments.length} records
          </span>
        </div>
      </div>

      {/* Dues Statements Table */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-prussian-blue-2 rounded-[12px] border border-neutrals-borderLight shadow-card">
          <Info className="mx-auto h-8 w-8 text-text-tertiary mb-3" />
          <h3 className="text-sm font-bold text-text-primary">No payments match filters</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
            Try adjusting your search query or reset the filters to see all payments.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member Details</TableHead>
                <TableHead>Matric Number</TableHead>
                <TableHead>Reference / Recpt</TableHead>
                <TableHead>Dues / Levy Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Channel & Auditor</TableHead>
                <TableHead>Status & Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => {
                const memberName = p.profiles?.full_name || p.legacy_members?.full_name || "Unknown Member";
                const matricNumber = p.profiles?.matric_number || p.legacy_members?.matric_number || "—";
                const avatarUrl = p.profiles?.passport_photo_url;
                const isLegacy = p.legacy_member_id && !p.profile_id;
                
                // Exco / Auditor information
                const auditorName = p.recorder?.full_name;
                const auditorAvatar = p.recorder?.passport_photo_url;

                const isProcessing = processingId === p.id;

                return (
                  <TableRow key={p.id}>
                    {/* Member Details */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={avatarUrl}
                          name={memberName}
                          size="md"
                          className="border border-neutrals-borderLight"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-text-primary truncate flex items-center gap-1">
                            {memberName}
                            {isLegacy && (
                              <span className="text-[9px] px-1.5 py-0.2 border border-neutrals-border bg-surface-subtle text-text-tertiary select-none rounded font-normal scale-90">
                                Legacy
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Matric Number */}
                    <TableCell variant="mono">
                      {matricNumber}
                    </TableCell>

                    {/* Reference / Receipt Number */}
                    <TableCell variant="mono">
                      <div className="flex flex-col">
                        <span>{p.payment_reference || "—"}</span>
                        {p.receipt_number && (
                          <span className="text-[9px] text-text-tertiary">Rec: {p.receipt_number}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Dues/Levy Type */}
                    <TableCell className="capitalize text-xs font-medium">
                      {p.dues_type.replace("_", " ")}
                    </TableCell>

                    {/* Amount */}
                    <TableCell variant="mono" className="font-semibold text-text-primary">
                      ₦{parseFloat(p.amount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Session Period */}
                    <TableCell variant="secondary" className="text-xs font-semibold">
                      {p.payment_period || "—"}
                    </TableCell>

                    {/* Channel & Auditor Info */}
                    <TableCell variant="secondary">
                      <div className="flex flex-col gap-1">
                        <Badge variant="inactive" className="capitalize px-1.5 py-0.5 rounded-[4px] border-none select-none w-fit text-[9px]">
                          {p.channel}
                        </Badge>
                        {p.channel === "manual" && auditorName && (
                          <div className="flex items-center gap-1 mt-0.5" title={`Recorded by ${auditorName}`}>
                            <Avatar
                              src={auditorAvatar}
                              name={auditorName}
                              size="xs"
                              className="border border-neutrals-borderLight"
                            />
                            <span className="text-[9px] text-text-tertiary max-w-[80px] truncate">{auditorName}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status & Date */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getPaymentStatusVariant(p.status)} className="w-fit">
                          {p.status}
                        </Badge>
                        <span className="text-[10px] text-text-tertiary" title={p.payment_date || p.created_at}>
                          {p.payment_date || formatTimeAgo(p.created_at)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Confirm action (for pending/reversed/failed) */}
                        {p.status !== "confirmed" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleConfirm(p.id)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                            title="Confirm Payment"
                          >
                            {isProcessing && processingAction === "confirm" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}

                        {/* Reverse action (for confirmed) */}
                        {p.status === "confirmed" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleReverse(p.id)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                            title="Reverse Payment"
                          >
                            {isProcessing && processingAction === "reverse" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}

                        {/* Delete action — super_admin only */}
                        {currentUserRole === "super_admin" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(p.id)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-danger hover:text-danger-hover hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Delete Record (Super Admin only)"
                          >
                            {isProcessing && processingAction === "delete" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
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
    </div>
  );
}
