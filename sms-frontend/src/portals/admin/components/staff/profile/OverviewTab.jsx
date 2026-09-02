import React from 'react';
import { 
    User, Mail, Phone, Calendar, Heart, Shield,
    Briefcase, CreditCard, Building2, MapPin, 
    FileText, Download, UserCheck
} from 'lucide-react';
import Card from '../../../../../components/ui/Card';

function InfoField({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            {Icon && <Icon className="w-5 h-5 text-white font-bold shrink-0 mt-0.5" />}
            <div>
                <p className="text-xs font-semibold text-gray-200 font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-200">{value || <span className="text-gray-600 italic">Not specified</span>}</p>
            </div>
        </div>
    );
}

export default function OverviewTab({ user, profile }) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-[#6338f0]" />
                                Personal Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Full Name" value={`${user.firstName} ${user.lastName}`} icon={User} />
                            <InfoField label="Personal Email" value={profile?.personalEmail || user.email} icon={Mail} />
                            <InfoField label="Phone Number" value={user.phone} icon={Phone} />
                            <InfoField label="Alternate Number" value={profile?.alternateNumber} icon={Phone} />
                            <InfoField label="Blood Group" value={profile?.bloodGroup} icon={Heart} />
                            <InfoField label="Marital Status" value={profile?.maritalStatus} icon={UserCheck} />
                            <InfoField label="Aadhaar Number" value={profile?.aadhaarNumber} icon={Shield} />
                            <InfoField label="PAN Number" value={profile?.panNumber} icon={CreditCard} />
                        </div>
                    </Card.Body>
                </Card>

                {/* Job Information */}
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                Job Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Employee ID" value={profile?.employeeId} />
                            <InfoField label="Department" value={profile?.department} />
                            <InfoField label="Role/Designation" value={user.role} />
                            <InfoField label="Shift Timing" value={profile?.shift} />
                            <InfoField label="Employment Type" value={profile?.employmentType} />
                            <InfoField label="Salary" value={profile?.salary ? `₹${profile.salary.toLocaleString()}` : ''} />
                            <InfoField label="Experience" value={profile?.experience} />
                            <InfoField label="Joining Date" value={new Date(user.createdAt).toLocaleDateString()} />
                        </div>
                    </Card.Body>
                </Card>
                
                {/* Address Information */}
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                Address Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <InfoField label="Address Line 1" value={profile?.addressLine1} />
                            </div>
                            <div className="md:col-span-2">
                                <InfoField label="Address Line 2" value={profile?.addressLine2} />
                            </div>
                            <InfoField label="City" value={profile?.city} />
                            <InfoField label="State" value={profile?.state} />
                            <InfoField label="Pincode" value={profile?.pincode} />
                            <InfoField label="Landmark" value={profile?.landmark} />
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Profile Summary */}
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <h3 className="text-sm font-bold text-white font-bold uppercase tracking-wider mb-4">Profile Summary</h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-white font-bold">Status</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {user.isActive ? 'Active' : 'Deactivated'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-white font-bold">Documents Verified</span>
                                <span className="text-sm font-semibold text-white">
                                    {profile?.documents?.filter(d => d.verified).length || 0} / {profile?.documents?.length || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-white font-bold">Account Created</span>
                                <span className="text-sm font-semibold text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-white font-bold">Last Updated</span>
                                <span className="text-sm font-semibold text-white">{new Date(profile?.updatedAt || user.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Documents Preview */}
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <h3 className="text-sm font-bold text-white font-bold uppercase tracking-wider mb-4">Documents</h3>
                        <div className="space-y-3">
                            {profile?.documents?.length > 0 ? (
                                profile.documents.slice(0, 3).map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#6338f0]/10 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-[#6338f0]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-200">{doc.type}</p>
                                                <p className={`text-[10px] font-bold ${doc.verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {doc.verified ? 'VERIFIED' : 'PENDING'}
                                                </p>
                                            </div>
                                        </div>
                                        <a 
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-white font-bold hover:text-white transition-colors flex items-center justify-center"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-sm text-gray-200 font-bold">
                                    No documents uploaded
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* About Notes */}
                <Card className="bg-[#151921] border-white/5">
                    <Card.Body className="p-6">
                        <h3 className="text-sm font-bold text-white font-bold uppercase tracking-wider mb-4">About Staff</h3>
                        <p className="text-sm text-white font-bold leading-relaxed">
                            {profile?.bio || 'No bio or additional notes provided for this staff member yet.'}
                        </p>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
