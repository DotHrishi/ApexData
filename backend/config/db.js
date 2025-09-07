import mongoose from "mongoose";

const connection = async () => {
    try{
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/apexdata";
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully!");
    } catch(error) {
        console.error("MongoDB connection failed:", error);
        console.log("Server will continue without MongoDB - some features may not work");
        // Don't exit the process, just log the error
    }
};

export default connection;