import mongoose from 'mongoose';
import { getComplaintById } from './src/modules/complaint/complaint.service.js';

async function test() {
    await mongoose.connect('mongodb://localhost:27017/sms');
    const Complaint = mongoose.model('Complaint');
    const c = await Complaint.findOne().lean();
    if (!c) { console.log("No complaints found"); process.exit(1); }
    
    console.log("Found complaint:", c._id);
    const Resident = mongoose.model('Resident');
    const r = await Resident.findById(c.raisedBy).lean();
    if (!r) { console.log("No resident found for complaint"); process.exit(1); }
    
    try {
        const res = await getComplaintById(c._id.toString(), r.userId.toString(), 'RESIDENT');
        console.log("Success! Fetched complaint:", res._id);
    } catch(err) {
        console.error("Error fetching:", err);
    }
    
    process.exit(0);
}
test();
