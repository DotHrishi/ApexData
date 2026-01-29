import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/analytics';

const useAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvents = useCallback(async (year) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/sessions?year=${year}`);
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();


            const uniqueEvents = [];
            const map = new Map();
            for (const item of data) {
                if (!map.has(item.meeting_key)) {
                    map.set(item.meeting_key, true);
                    uniqueEvents.push(item);
                }
            }
            return uniqueEvents.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSessions = useCallback(async (year, meeting_key) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/sessions?year=${year}&meeting_key=${meeting_key}`);
            if (!res.ok) throw new Error('Failed to fetch sessions');
            return await res.json();
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDrivers = useCallback(async (session_key) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/drivers?session_key=${session_key}`);
            if (!res.ok) throw new Error('Failed to fetch drivers');
            return await res.json();
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const analyzeRace = useCallback(async (session_key, driver_numbers) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_key, driver_numbers })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchEvents,
        fetchSessions,
        fetchDrivers,
        analyzeRace
    };
};

export default useAnalytics;
