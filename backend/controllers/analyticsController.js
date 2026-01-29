const analyticsModel = require('../models/analyticsModel');

const getSessions = async (req, res) => {
    try {
        const { year, meeting_key } = req.query;
        const data = await analyticsModel.getSessions(year, meeting_key);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDrivers = async (req, res) => {
    try {
        const { session_key } = req.query;
        const data = await analyticsModel.getDrivers(session_key);
        // Filter unique drivers
        const uniqueDrivers = [...new Map(data.map(item => [item.driver_number, item])).values()];
        res.json(uniqueDrivers.sort((a, b) => a.driver_number - b.driver_number));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complex logic moved from frontend
const analyzeRace = async (req, res) => {
    try {
        const { session_key, driver_numbers } = req.body; // Expecting array of driver numbers

        if (!session_key || !driver_numbers || driver_numbers.length === 0) {
            return res.status(400).json({ error: 'Missing session_key or driver_numbers' });
        }

        const driverLapsMap = {};
        const telemetryMap = {};

        // Fetch drivers info for colors/names
        const driversList = await analyticsModel.getDrivers(session_key);

        for (const driverNum of driver_numbers) {
            const laps = await analyticsModel.getLaps(session_key, driverNum);

            const validLaps = laps.filter(l => l.lap_duration);
            if (validLaps.length === 0) continue;

            const fastestLap = validLaps.reduce((prev, current) => (prev.lap_duration < current.lap_duration) ? prev : current);
            driverLapsMap[driverNum] = fastestLap;

            const startTime = fastestLap.date_start;
            const endTime = new Date(new Date(startTime).getTime() + (fastestLap.lap_duration * 1000)).toISOString();

            const teleData = await analyticsModel.getCarData(driverNum, session_key, startTime, endTime);
            telemetryMap[driverNum] = teleData;
        }

        // Format for Frontend Charts
        // 1. Lap Data (Bar Chart)
        const sortedDrivers = Object.keys(driverLapsMap).sort((a, b) => driverLapsMap[a].lap_duration - driverLapsMap[b].lap_duration);

        const lapData = {
            labels: sortedDrivers.map(d => {
                const driverInfo = driversList.find(drv => drv.driver_number == d);
                return driverInfo ? driverInfo.name_acronym : `Driver ${d}`;
            }),
            datasets: [{
                label: 'Fastest Lap Time (s)',
                data: sortedDrivers.map(d => driverLapsMap[d].lap_duration),
                backgroundColor: sortedDrivers.map(d => {
                    const driverInfo = driversList.find(drv => drv.driver_number == d);
                    return driverInfo ? `#${driverInfo.team_colour}` : 'rgba(53, 162, 235, 0.5)';
                }),
                borderColor: 'white',
                borderWidth: 1
            }]
        };

        // 2. Telemetry Data (Line Chart)
        const datasets = [];
        Object.keys(telemetryMap).forEach(driverNum => {
            const dataPoints = telemetryMap[driverNum];
            if (!Array.isArray(dataPoints)) {
                console.warn(`Telemetry data for driver ${driverNum} is not an array:`, dataPoints);
                return;
            }
            const startT = new Date(driverLapsMap[driverNum].date_start).getTime();
            const driverInfo = driversList.find(d => d.driver_number == driverNum);
            const color = driverInfo ? `#${driverInfo.team_colour}` : 'white';

            datasets.push({
                label: driverInfo ? `${driverInfo.name_acronym} Speed` : `Driver ${driverNum}`,
                data: dataPoints.map(p => ({
                    x: (new Date(p.date).getTime() - startT) / 1000,
                    y: p.speed
                })),
                borderColor: color,
                backgroundColor: color,
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.1
            });
        });

        res.json({
            lapData,
            telemetryData: { datasets }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSessions,
    getDrivers,
    analyzeRace
};
