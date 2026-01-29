import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Selectors from '../components/Selectors';
import { LapTimeChart, TelemetryChart } from '../components/Charts';
import useAnalytics from '../hooks/useAnalytics';

const AnalyticsPage = () => {

  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState([]);


  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [drivers, setDrivers] = useState([]);


  const [lapData, setLapData] = useState(null);
  const [telemetryData, setTelemetryData] = useState(null);



  const [error, setError] = useState(null);

  const years = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  const { loading, error: hookError, fetchEvents, fetchSessions, fetchDrivers, analyzeRace } = useAnalytics();
  

  useEffect(() => {
    if (hookError) setError(hookError);
  }, [hookError]);

  useEffect(() => {
    if (!selectedYear) return;
    const loadEvents = async () => {
        const data = await fetchEvents(selectedYear);
        setEvents(data);
    };
    loadEvents();
  }, [selectedYear, fetchEvents]);

  useEffect(() => {
    if (!selectedEvent) {
        setSessions([]);
        return;
    }
    const loadSessions = async () => {
        const data = await fetchSessions(selectedYear, selectedEvent);
        setSessions(data);
    };
    loadSessions();
  }, [selectedEvent, selectedYear, fetchSessions]);

  useEffect(() => {
    if (!selectedSession) {
        setDrivers([]);
        return;
    }
    const loadDrivers = async () => {
        const data = await fetchDrivers(selectedSession);
        setDrivers(data);
    };
    loadDrivers();
  }, [selectedSession, fetchDrivers]);

  const handleDriverToggle = (driverNum) => {
    if (selectedDrivers.includes(driverNum)) {
      setSelectedDrivers(selectedDrivers.filter(d => d !== driverNum));
    } else {
      if (selectedDrivers.length < 5) {
        setSelectedDrivers([...selectedDrivers, driverNum]);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedSession || selectedDrivers.length === 0) {
        setError("Please select a session and at least one driver.");
        return;
    }
    
    setError(null);
    setLapData(null);
    setTelemetryData(null);

    const result = await analyzeRace(selectedSession, selectedDrivers);
    
    if (result) {

        const { lapData, telemetryData } = result;
        setLapData(lapData);
        setTelemetryData(telemetryData);
    }
  };


  return (
    <div className="bg-black min-h-screen flex flex-col text-white">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,_#000_35%,_#08152e_60%,_#0b1c3f_100%)]" />
          <div className="absolute -bottom-56 -right-56 w-[1000px] h-[1000px] bg-gradient-to-r from-black-400 from-10% via-red-500 via-30% to-blue-600 to-70% opacity-20 blur-3xl rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.85),transparent_65%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-center font-orbitron text-green-500">
            Race Analytics
        </h1>

        <Selectors
           years={years}
           selectedYear={selectedYear}
           onYearChange={setSelectedYear}
           events={events}
           selectedEvent={selectedEvent}
           onEventChange={setSelectedEvent}
           sessions={sessions}
           selectedSession={selectedSession}
           onSessionChange={setSelectedSession}
           drivers={drivers}
           selectedDrivers={selectedDrivers}
           onDriverToggle={handleDriverToggle}
           loading={loading}
        />

        <div className="text-center mb-8">
            <button 
                onClick={handleAnalyze} 
                disabled={loading || !selectedSession}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                    loading || !selectedSession 
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                    : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/50'
                }`}
            >
                {loading ? 'Analyzing...' : 'Visualize Telemetry'}
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {lapData && (
                <div className="bg-black/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl">
                    <LapTimeChart data={lapData} />
                </div>
            )}
            {telemetryData && (
                <div className="bg-black/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl">
                    <TelemetryChart data={telemetryData} type="Speed" />
                </div>
            )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default AnalyticsPage;
