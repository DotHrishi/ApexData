const fetch = require('node-fetch');

// Helper to fetch from OpenF1
const fetchOpenF1 = async (endpoint, params = {}) => {
    const url = new URL(`https://api.openf1.org/v1/${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`OpenF1 API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

const getSessions = async (year, meeting_key) => {
    return await fetchOpenF1('sessions', { year, meeting_key });
};

const getDrivers = async (session_key) => {
    return await fetchOpenF1('drivers', { session_key });
};

const getLaps = async (session_key, driver_number) => {
    return await fetchOpenF1('laps', { session_key, driver_number });
};

const getCarData = async (driver_number, session_key, date_start, date_end) => {
    // Manually construct URL for date comparison operators which might be tricky with URLSearchParams
    // Using direct string manipulation for safety with OpenF1's specific syntax
    let url = `https://api.openf1.org/v1/car_data?driver_number=${driver_number}&session_key=${session_key}`;
    if (date_start) url += `&date>=${date_start}`;
    if (date_end) url += `&date<=${date_end}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch car data');
    return await response.json();
};

module.exports = {
    getSessions,
    getDrivers,
    getLaps,
    getCarData
};
