import * as React from "react";

interface ClaimAccountInviteProps {
  fullName: string;
  claimUrl: string;
}

export default function ClaimAccountInvite({
  fullName,
  claimUrl,
}: ClaimAccountInviteProps) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827" }}>
      <h2 style={{ color: "#091D0A" }}>Claim Your NFCS UNN Portal Account</h2>
      <p>Dear {fullName},</p>
      <p>
        The Chapter Exco has digitized legacy membership registers and dues cards. We found your matching record in the register!
      </p>
      <p>
        Click the link below to activate your account, set your password, and view your historical dues payments:
      </p>
      
      <div style={{ margin: "24px 0" }}>
        <a
          href={claimUrl}
          style={{
            background: "#091D0A",
            color: "#FFFFFF",
            padding: "10px 20px",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            display: "inline-block"
          }}
        >
          Claim My Account
        </a>
      </div>

      <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
        If the button above does not work, copy and paste this link in your browser:<br />
        <a href={claimUrl} style={{ color: "#134116" }}>{claimUrl}</a>
      </p>

      <hr style={{ borderColor: "#E5E7EB" }} />
      <p style={{ fontSize: "12px", color: "#6B7280" }}>
        Nigerian Federation of Catholic Students (NFCS), University of Nigeria, Nsukka Chapter.
      </p>
    </div>
  );
}
