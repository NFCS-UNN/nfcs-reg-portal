"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMemberBiodata, sendPasswordReset } from "@/lib/actions/member.actions";
import { useToast } from "@/components/ui/toast";
import { UNN_CAMPUS_DATA } from "@/lib/utils/unn-data";

export function MemberProfileEditor({ member, adminId }: { member: any; adminId: string }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  // Faculty & Department State
  const [selectedFaculty, setSelectedFaculty] = React.useState(member.faculty || "");
  const [selectedDepartment, setSelectedDepartment] = React.useState(member.department || "");

  const faculties = Object.keys(UNN_CAMPUS_DATA);
  const departments: string[] = selectedFaculty ? (UNN_CAMPUS_DATA[selectedFaculty] || []) : [];

  const handleFacultyChange = (val: string) => {
    setSelectedFaculty(val);
    setSelectedDepartment(""); // reset department when faculty changes
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("faculty", selectedFaculty);
    formData.set("department", selectedDepartment);

    const result = await updateMemberBiodata(formData, adminId, member.id);
    setLoading(false);

    if (result.error) {
      toast({ title: "Update Failed", description: result.error, variant: "error" });
    } else {
      toast({ title: "Biodata Updated", description: "Member profile updated successfully!", variant: "success" });
      setIsEditing(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!confirm(`Are you sure you want to send a password reset link to ${member.email}?`)) return;
    const result = await sendPasswordReset(member.email, adminId);
    if (result.error) {
      toast({ title: "Reset Failed", description: result.error, variant: "error" });
    } else {
      toast({ title: "Password Reset Link", description: "Link generated successfully.", variant: "success" });
      if (result.link) {
        navigator.clipboard?.writeText(result.link);
        toast({ title: "Copied!", description: "Reset link copied to clipboard.", variant: "success" });
      }
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-prussian-blue-2 p-4 rounded-[12px] border border-neutrals-borderLight shadow-sm">
          <p className="text-sm font-semibold">Super Admin Controls</p>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
              Edit Biodata
            </Button>
            <Button onClick={handlePasswordReset} variant="ghost" size="sm">
              Reset Password
            </Button>
          </div>
        </div>

        {/* Academic Profile */}
        <Card className="border border-neutrals-borderLight shadow-card bg-white dark:bg-prussian-blue-2">
          <CardHeader>
            <CardTitle>Academic Profile</CardTitle>
            <CardDescription>University details</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Faculty</span>
              <p className="text-sm font-medium text-text-primary">{member.faculty || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Department</span>
              <p className="text-sm font-medium text-text-primary">{member.department || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Matric Number</span>
              <p className="text-sm font-mono text-text-primary">{member.matric_number || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Academic Level</span>
              <p className="text-sm font-medium text-text-primary">{member.academic_level || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Catholic & Organ Profile */}
        <Card className="border border-neutrals-borderLight shadow-card bg-white dark:bg-prussian-blue-2">
          <CardHeader>
            <CardTitle>NFCS Organ & Parish details</CardTitle>
            <CardDescription>Communal details</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Assigned Organ</span>
              <p className="text-sm font-medium text-text-primary capitalize">
                {member.organ ? member.organ.replace("_", " ") : "Not assigned"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Society / Association</span>
              <p className="text-sm font-medium text-text-primary">{member.society || "None listed"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-text-tertiary uppercase font-semibold">Home Parish</span>
              <p className="text-sm font-medium text-text-primary">{member.parish || "None listed"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border border-brand shadow-card bg-white dark:bg-prussian-blue-2">
      <form onSubmit={handleSave}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Edit Member Biodata</CardTitle>
            <CardDescription>Super Admin Mode</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => setIsEditing(false)} variant="ghost" size="sm" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Full Name</label>
              <Input name="full_name" defaultValue={member.full_name} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Phone Number</label>
              <Input name="phone" defaultValue={member.phone || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Date of Birth</label>
              <Input name="date_of_birth" type="date" defaultValue={member.date_of_birth || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Address</label>
              <Input name="address" defaultValue={member.address || ""} />
            </div>
            
            {/* Faculty & Department using UNN_CAMPUS_DATA */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Faculty</label>
              <Select value={selectedFaculty} onValueChange={handleFacultyChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} required disabled={!selectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Matric Number</label>
              <Input name="matric_number" defaultValue={member.matric_number || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Academic Level</label>
              <Select name="academic_level" defaultValue={member.academic_level || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Graduate"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Assigned Organ</label>
              <Select name="organ" defaultValue={member.organ || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Organ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gospel_band">Gospel Band</SelectItem>
                  <SelectItem value="evangelical_committee">Evangelical Committee</SelectItem>
                  <SelectItem value="federation_theater">Federation Theater</SelectItem>
                  <SelectItem value="social_communications_commission">Social Comms</SelectItem>
                  <SelectItem value="discipline_committee">Discipline Committee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Society</label>
              <Input name="society" defaultValue={member.society || ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary">Home Parish</label>
              <Input name="parish" defaultValue={member.parish || ""} />
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
