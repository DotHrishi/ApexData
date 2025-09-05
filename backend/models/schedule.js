import mongoose from "mongoose";

const Schedule = new mongoose.Schema(
    {
        season: String,
        round: Number,
        raceName: String,
        date: String,
        circuit: {
            circuitId: String,
            circuitName: String,
            location: {
                locality:String,
                country: String,
            },
        },
        createdAt: {type: Date, default: Date.now},
    }
);

export default Schedule;