import RateLimit from "express-rate-limit";
import MongoStore from "rate-limit-mongo";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const limiter = RateLimit({
  store: new MongoStore({
    uri: mongoUri,
    collectionName: "rateLimit",
    expireTimeMs: 15 * 60 * 1000,
  }),
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: {
    error: "Too many requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default limiter;