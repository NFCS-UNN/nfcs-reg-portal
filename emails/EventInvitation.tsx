import * as React from "react";

interface EventInvitationProps {
  title: string;
  location: string;
  startsAt: string;
  description?: string | null;
}

export default function EventInvitation({
  title,
  location,
  startsAt,
  description,
}: EventInvitationProps) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827" }}>
      <h2 style={{ color: "#091D0A" }}>New Calendar Event</h2>
      <p>Dear Member,</p>
      <p>A new event has been scheduled for the chapter. Details below:</p>

      <div style={{
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        padding: "16px",
        margin: "20px 0"
      }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#134116" }}>{title}</h3>
        <p style={{ margin: "4px 0", fontSize: "13px" }}>
          <strong>Location:</strong> {location}
        </p>
        <p style={{ margin: "4px 0", fontSize: "13px" }}>
          <strong>Starts At:</strong> {new Date(startsAt).toLocaleString()}
        </p>
        {description && (
          <p style={{ margin: "10px 0 0 0", fontSize: "13px", fontStyle: "italic", borderTop: "1px dashed #E5E7EB", paddingTop: "10px" }}>
            {description}
          </p>
        )}
      </div>

      <hr style={{ borderColor: "#E5E7EB" }} />
      <p style={{ fontSize: "12px", color: "#6B7280" }}>
        Nigerian Federation of Catholic Students (NFCS), University of Nigeria, Nsukka Chapter.
      </p>
    </div>
  );
}
