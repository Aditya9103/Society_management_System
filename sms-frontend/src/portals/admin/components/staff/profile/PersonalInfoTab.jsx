import React from 'react';
import { User, Heart, MapPin, Phone, Mail, FileText } from 'lucide-react';
import Card from '../../../../../components/ui/Card';

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-white/5 last:border-0 gap-2">
            <span className="text-sm font-bold text-white font-bold">{label}</span>
            <span className="text-sm font-semibold text-gray-200 sm:text-right">{value || <span className="text-gray-600 italic">Not specified</span>}</span>
        </div>
    );
}

export default function PersonalInfoTab({ user, profile }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-[#6338f0]" />
                            <h3 className="text-lg font-bold text-white">Basic Information</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="First Name" value={user.firstName} />
                            <InfoRow label="Last Name" value={user.lastName} />
                            <InfoRow label="Gender" value={profile?.gender} />
                            <InfoRow label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null} />
                            <InfoRow label="Blood Group" value={profile?.bloodGroup} />
                            <InfoRow label="Marital Status" value={profile?.maritalStatus} />
                        </div>
                    </Card.Body>
                </Card>

                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Phone className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-lg font-bold text-white">Contact Details</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="Primary Phone" value={user.phone} />
                            <InfoRow label="Alternate Phone" value={profile?.alternateNumber} />
                            <InfoRow label="Personal Email" value={profile?.personalEmail} />
                            <InfoRow label="Work Email" value={user.email} />
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            <h3 className="text-lg font-bold text-white">Address Details</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="Address Line 1" value={profile?.addressLine1} />
                            <InfoRow label="Address Line 2" value={profile?.addressLine2} />
                            <InfoRow label="Landmark" value={profile?.landmark} />
                            <InfoRow label="City" value={profile?.city} />
                            <InfoRow label="State" value={profile?.state} />
                            <InfoRow label="Pincode" value={profile?.pincode} />
                        </div>
                    </Card.Body>
                </Card>

                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Heart className="w-5 h-5 text-rose-500" />
                            <h3 className="text-lg font-bold text-white">Emergency Contact</h3>
                        </div>
                        <div className="flex flex-col">
                            <InfoRow label="Contact Name" value={profile?.emergencyContactName} />
                            <InfoRow label="Relationship" value={profile?.emergencyContactRelation} />
                            <InfoRow label="Contact Number" value={profile?.emergencyContactNumber} />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
