import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  round: { type: Number, required: true },
  raceName: { type: String, required: true },
  raceDate: String,
  raceTime: String,
  raceUrl: String,
  fp1Date: String,
  fp1Time: String,
  fp2Date: String,
  fp2Time: String,
  fp3Date: String,
  fp3Time: String,
  qualifyingDate: String,
  qualifyingTime: String,
  sprintDate: String,
  sprintTime: String,
  circuit: {
    circuitId: String,
    circuitName: String,
    circuitUrl: String,
    location: {
      locality: String,
      country: String,
      lat: Number,
      long: Number,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Schedule", scheduleSchema);
