import * as React from "react";

interface DuesReceiptProps {
  fullName: string;
  reference: string;
  amount: number;
  duesType: string;
  period: string;
  datePaid: string;
}

export default function DuesReceipt({
  fullName,
  reference,
  amount,
  duesType,
  period,
  datePaid,
}: DuesReceiptProps) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827" }}>
      <h2 style={{ color: "#091D0A" }}>Dues Payment Receipt</h2>
      <p>Dear {fullName},</p>
      <p>This is confirmation of your completed dues payment record.</p>
      
      <div style={{
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        padding: "16px",
        margin: "20px 0"
      }}>
        <table style={{ width: "100%", fontSize: "14px" }}>
          <tbody>
            <tr>
              <td style={{ color: "#6B7280", padding: "4px 0" }}>Reference ID</td>
              <td style={{ fontWeight: "bold", textAlign: "right", fontFamily: "monospace" }}>{reference}</td>
            </tr>
            <tr>
              <td style={{ color: "#6B7280", padding: "4px 0" }}>Payment Date</td>
              <td style={{ textAlign: "right" }}>{datePaid}</td>
            </tr>
            <tr>
              <td style={{ color: "#6B7280", padding: "4px 0" }}>Dues Type</td>
              <td style={{ textAlign: "right", textTransform: "capitalize" }}>{duesType.replace("_", " ")}</td>
            </tr>
            <tr>
              <td style={{ color: "#6B7280", padding: "4px 0" }}>Session Period</td>
              <td style={{ textAlign: "right" }}>{period}</td>
            </tr>
            <tr style={{ borderTop: "1px solid #E5E7EB" }}>
              <td style={{ fontWeight: "bold", padding: "10px 0 0 0" }}>Amount Paid</td>
              <td style={{ fontWeight: "bold", color: "#134116", textAlign: "right", padding: "10px 0 0 0", fontFamily: "monospace" }}>
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr style={{ borderColor: "#E5E7EB" }} />
      <p style={{ fontSize: "12px", color: "#6B7280" }}>
        Nigerian Federation of Catholic Students (NFCS), University of Nigeria, Nsukka Chapter.
      </p>
    </div>
  );
}
