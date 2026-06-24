import * as React from "react";

interface RegistrationConfirmationProps {
  fullName: string;
  matricNumber: string;
}

export default function RegistrationConfirmation({
  fullName,
  matricNumber,
}: RegistrationConfirmationProps) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827" }}>
      <h2 style={{ color: "#091D0A" }}>NFCS UNN Portal Registration</h2>
      <p>Dear {fullName},</p>
      <p>
        Your registration has been submitted successfully with matric number <strong>{matricNumber}</strong>.
      </p>
      <p>
        Your account is currently <strong>pending approval</strong>. An Exco member will verify your academic details shortly. You will receive another notification once your account has been approved and activated.
      </p>
      <hr style={{ borderColor: "#E5E7EB" }} />
      <p style={{ fontSize: "12px", color: "#6B7280" }}>
        Nigerian Federation of Catholic Students (NFCS), University of Nigeria, Nsukka Chapter.
      </p>
    </div>
  );
}
