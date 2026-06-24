"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TableWrapper, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { parseCSV, type CSVRow } from "@/lib/utils/csv";
import { bulkMigrateLegacyMembers } from "@/lib/actions/migration.actions";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/useUser";
import { Upload, FileText, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

export function MigrationUploader() {
  const { toast } = useToast();
  const { profile } = useUser();
  const [csvData, setCsvData] = React.useState<CSVRow[]>([]);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<{
    successCount: number;
    failCount: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const parsed = parseCSV(text);
          setCsvData(parsed);
          toast({
            title: "CSV Parsed",
            description: `Found ${parsed.length} rows inside ${file.name}`,
            variant: "success",
          });
        } catch (err) {
          toast({
            title: "Parsing Error",
            description: "Failed to parse the CSV structure.",
            variant: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCommit = async () => {
    if (!profile || csvData.length === 0) return;
    setIsProcessing(true);

    try {
      const response = await bulkMigrateLegacyMembers(csvData, profile.id);
      if (response?.error) {
        toast({
          title: "Migration Failed",
          description: response.error,
          variant: "error",
        });
      } else if (response) {
        setResults({
          successCount: response.successCount || 0,
          failCount: response.failCount || 0,
          errors: response.errors || [],
        });
        setCsvData([]);
        setFileName(null);
        toast({
          title: "Import Finished",
          description: `Successfully imported ${response.successCount} legacy members.`,
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Migration Failed",
        description: "An unexpected error occurred during execution.",
        variant: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download template CSV helper
  const downloadTemplate = () => {
    const headers = "full_name,email,phone,matric_number,faculty,department,academic_level,organ,society,parish,migration_source,notes,dues_amount_paid,dues_period\n";
    const example = '"John Doe","john@example.com","08012345678","2019/12345","Engineering","Electrical","Graduate","gospel_band","","St. Peter","dues_card","Notebook pg 5","5000","2023/2024"\n';
    
    const blob = new Blob([headers + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nfcs_legacy_migration_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-surface-subtle select-none">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-text-primary">CSV Migration Template</h4>
          <p className="text-[11px] text-text-tertiary">
            Download our standard schema CSV template, populate it, and upload it below.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={downloadTemplate} className="gap-1.5 text-xs font-semibold h-9">
          <FileText className="h-4 w-4 text-brand-accent" /> Download CSV Template
        </Button>
      </div>

      {/* CSV File Dropzone */}
      <div className="border-2 border-dashed border-gray-300 rounded-[12px] bg-surface-subtle p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors hover:bg-brand-light hover:border-brand-accent relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-8 w-8 text-text-tertiary" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-text-primary">
            {fileName ? `Selected: ${fileName}` : "Click to select or drag and drop CSV file"}
          </p>
          <p className="text-[10px] text-text-tertiary">CSV files only up to 5MB.</p>
        </div>
      </div>

      {/* Migration Results Alert */}
      {results && (
        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-accent" />
            <h4 className="text-xs font-bold text-text-primary">Bulk Import Report</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium border-y border-neutrals-borderLight py-2">
            <div>Success Count: <span className="text-brand-accent font-bold">{results.successCount}</span></div>
            <div>Failed Count: <span className="text-danger font-bold">{results.failCount}</span></div>
          </div>
          {results.errors.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-danger">Errors Details:</span>
              <div className="max-h-24 overflow-y-auto text-[11px] text-danger bg-rose-50 p-2 rounded-md font-mono space-y-0.5">
                {results.errors.map((err, idx) => <div key={idx}>{err}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Preview Table */}
      {csvData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center select-none">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-text-primary">Parsed Members Preview</h4>
              <p className="text-[11px] text-text-tertiary">Review columns before submitting.</p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleCommit}
              isLoading={isProcessing}
              className="px-6 text-xs h-9 font-semibold"
            >
              Commit Migration ({csvData.length} rows)
            </Button>
          </div>

          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email / Warning</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Assigned Organ</TableHead>
                  <TableHead>Dues Amount (₦)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(0, 10).map((row, idx) => {
                  const hasEmail = !!row.email;
                  const hasFullName = !!row.full_name;

                  return (
                    <TableRow key={idx}>
                      <TableCell className={!hasFullName ? "text-danger" : ""}>
                        {row.full_name || "MISSING NAME"}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-text-primary">{row.email || "No email"}</span>
                          {!hasEmail && (
                            <span className="text-[10px] text-status-warningText font-semibold flex items-center gap-0.5 mt-0.5 bg-status-warningBackground p-0.5 rounded border border-status-warningBorder max-w-max select-none">
                              <AlertTriangle className="h-3 w-3 shrink-0" /> Manual Claim Token Required
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell variant="secondary">{row.phone || "—"}</TableCell>
                      <TableCell variant="mono">{row.matric_number || "—"}</TableCell>
                      <TableCell variant="secondary" className="capitalize">
                        {row.organ ? row.organ.replace("_", " ") : "—"}
                      </TableCell>
                      <TableCell variant="mono">{row.dues_amount_paid || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
          
          {csvData.length > 10 && (
            <p className="text-center text-[10px] text-text-tertiary select-none">
              Showing first 10 of {csvData.length} records.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
