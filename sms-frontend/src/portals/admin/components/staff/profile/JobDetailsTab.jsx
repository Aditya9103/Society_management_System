import React from 'react';
import { Briefcase, Clock, Building, Target, BadgeIndianRupee } from 'lucide-react';
import Card from '../../../../../components/ui/Card';

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/5 last:border-0 gap-2">
            <span className="text-sm font-bold text-white font-bold">{label}</span>
            <span className="text-sm font-semibold text-gray-200 sm:text-right">{value || <span className="text-gray-600 italic">Not specified</span>}</span>
        </div>
    );
}

export default function JobDetailsTab({ user, profile }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Briefcase className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-lg font-bold text-white">Employment Information</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="Employee ID" value={profile?.employeeId} />
                            <InfoRow label="Role / Designation" value={user.role} />
                            <InfoRow label="Department" value={profile?.department} />
                            <InfoRow label="Employment Type" value={profile?.employmentType} />
                            <InfoRow label="Joining Date" value={new Date(user.createdAt).toLocaleDateString()} />
                            <InfoRow label="Total Experience" value={profile?.experience} />
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-bold text-white">Shift & Schedule</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="Assigned Shift" value={profile?.shift} />
                            <InfoRow label="Reporting Manager" value={profile?.reportingTo ? "Assigned" : "Not Assigned"} />
                        </div>
                    </Card.Body>
                </Card>

                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BadgeIndianRupee className="w-5 h-5 text-amber-500" />
                            <h3 className="text-lg font-bold text-white">Compensation</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="Salary / Remuneration" value={profile?.salary ? `₹${profile.salary.toLocaleString()}` : null} />
                            <InfoRow label="Payment Frequency" value="Monthly" />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
