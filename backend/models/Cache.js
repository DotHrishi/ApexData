import mongoose from 'mongoose';

const NewsCacheSchema = new mongoose.Schema({
    query: { type: String, required: true, unique: true },
    data: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now, expires: 7200 } // 2 hours TTL
});

const CarDataCacheSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // driver_number + session_key
    data: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // 1 hour TTL
});

const SessionsCacheSchema = new mongoose.Schema({
    query: { type: String, required: true, unique: true }, // usually "all" or specific year
    data: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours TTL
});

export const NewsCache = mongoose.model('NewsCache', NewsCacheSchema);
export const CarDataCache = mongoose.model('CarDataCache', CarDataCacheSchema);
export const SessionsCache = mongoose.model('SessionsCache', SessionsCacheSchema);
