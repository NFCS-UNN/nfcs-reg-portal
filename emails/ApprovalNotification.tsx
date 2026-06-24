import * as React from "react";

interface ApprovalNotificationProps {
  fullName: string;
  status: "active" | "suspended";
}

export default function ApprovalNotification({
  fullName,
  status,
}: ApprovalNotificationProps) {
  const isActive = status === "active";

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827" }}>
      <h2 style={{ color: isActive ? "#091D0A" : "#CA3E1E" }}>
        {isActive ? "NFCS Portal Activated" : "NFCS Account Update"}
      </h2>
      <p>Dear {fullName},</p>
      {isActive ? (
        <p>
          We are pleased to inform you that your member profile has been verified and <strong>activated</strong> by the Chapter Exco. You can now log in, view the directory, pay dues, and get calendar announcements.
        </p>
      ) : (
        <p>
          Your portal account status has been updated to <strong>suspended</strong>. Please reach out to an Exco member if you believe this is an error.
        </p>
      )}
      <hr style={{ borderColor: "#E5E7EB" }} />
      <p style={{ fontSize: "12px", color: "#6B7280" }}>
        Nigerian Federation of Catholic Students (NFCS), University of Nigeria, Nsukka Chapter.
      </p>
    </div>
  );
}
