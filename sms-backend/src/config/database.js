import mongoose from "mongoose";
import env from "./env.js";

export const connectToDB = async () => {
    try {
        const mongooseInstance = await mongoose.connect(env.db.mongoUri);
        console.log(`✅  MongoDB Connected Successfully ${mongooseInstance.connections[0].host}`);
    } catch (error) {
        console.error("❌ Error connecting to DB", error);
        process.exit(1);
    }
}



