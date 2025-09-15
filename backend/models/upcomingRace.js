import mongoose from "mongoose";

const upcomingRaceSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    race_date: {
      type: Date,
      required: true,
    },
    fetched_at: {
      type: Date,
      default: Date.now, 
    },
  },
  { collection: "upcoming_races" } 
);

export default mongoose.model("UpcomingRace", upcomingRaceSchema);
