import mongoose from 'mongoose';

(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/sms');
        const User = (await import('./src/modules/auth/user.model.js')).default;
        const resident = await User.findOne({ role: 'RESIDENT' }).lean();
        if (!resident) {
            console.log('No resident found.');
            process.exit(0);
        }
        console.log('Resident Role:', resident.role);
        console.log('Resident Society ID:', resident.societyId);
        
        const Society = (await import('./src/modules/society/society.model.js')).default;
        const society = await Society.findById(resident.societyId).lean();
        console.log('Society isActive:', society?.isActive);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();
