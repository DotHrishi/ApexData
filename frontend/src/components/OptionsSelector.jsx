// DriverSelector.jsx
import { useState } from "react";
// --- Import all our data ---
import { driverList } from "../data/driverData";
import { yearList } from "../data/yearData";
import { eventData } from "../data/eventData";

const OptionsSelector = () => {
  // --- Set default year (as you had) ---
  const defaultYear = 2025;

  // --- State for all inputs ---
  const [year, setYear] = useState(defaultYear);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // --- New state for the list of events based on the selected year ---
  const [availableEvents, setAvailableEvents] = useState(eventData[defaultYear]);
  
  // --- Set default event to the first race of the default year ---
  const [event, setEvent] = useState(eventData[defaultYear][0].id); // e.g., "Bahrain"
  
  const [session, setSession] = useState("R"); // 'R' = Race
  const [driver1, setDriver1] = useState(driverList[0].id); // Default: VER
  const [driver2, setDriver2] = useState(driverList[4].id); // Default: LEC
  
  // --- State for API communication ---
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- New Handler for when the YEAR changes ---
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    
    // Update the list of available events
    const newEvents = eventData[newYear] || []; // Fallback to empty array
    setAvailableEvents(newEvents);
    
    // IMPORTANT: Reset the selected event to the first one of the new year
    // This prevents having "Monza 2023" and "Year 2024" selected
    if (newEvents.length > 0) {
      setEvent(newEvents[0].id);
    } else {
      setEvent(""); // No events for this year
    }
  };

  // --- Driver selection handlers (unchanged) ---
  const handleDriver1Change = (e) => {
    const newDriver1 = e.target.value;
    if (newDriver1 === driver2) {
      const newDriver2 = driverList.find(d => d.id !== newDriver1).id;
      setDriver2(newDriver2);
    }
    setDriver1(newDriver1);
  };

  const handleDriver2Change = (e) => {
    const newDriver2 = e.target.value;
    if (newDriver2 === driver1) {
      const newDriver1 = driverList.find(d => d.id !== newDriver2).id;
      setDriver1(newDriver1);
    }
    setDriver2(newDriver2);
  };

  // --- Function to fetch the graph ---
  const getGraph = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setIsModalOpen(false);

    const params = new URLSearchParams({ year, event, session, driver1, driver2 });
    const API_URL = `http://127.0.0.1:5001/getGraphs?${params.toString()}`;

    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        // --- Robust Error Handling ---
        // Try to parse error as JSON (our Flask app sends this)
        let errorMessage;
        try {
          const errData = await response.json();
          errorMessage = errData.error || `Error: ${response.statusText}`;
        } catch (jsonError) {
          // If JSON fails, it's a server error (like 404 HTML page)
          errorMessage = `Request failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const imageBlob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageObjectUrl);

    } catch (err) {
      console.error("Failed to fetch graph:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={getGraph} 
      className="bg-black text-white m-6 p-6 rounded-lg shadow-xl flex flex-row gap-14"
    >
        <div>
      <h2 className="text-2xl font-bold mb-6 text-center">
        Select Drivers to Compare
      </h2>
      
      {/* --- Session Selectors (Now all dropdowns) --- */}
      <div className="p-4">
        
        {/* --- YEAR DROPDOWN --- */}
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-red-600 mb-2">Year</label>
          <select 
            id="year-select"
            value={year}
            onChange={handleYearChange} // Use the new handler
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md 
                       text-white focus:ring-2 focus:ring-red-500 appearance-none"
          >
            {yearList.map((yearOpt) => (
              <option key={yearOpt.id} value={yearOpt.id}>
                {yearOpt.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* --- EVENT DROPDOWN --- */}
        <div>
          <label htmlFor="event-select" className="block text-sm font-medium text-red-600 mb-2">Event</label>
          <select 
            id="event-select"
            value={event}
            onChange={(e) => setEvent(e.target.value)} // Just update event state
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md 
                       text-white focus:ring-2 focus:ring-red-500 appearance-none"
          >
            {/* Maps over the DYNAMIC availableEvents state */}
            {availableEvents.map((eventOpt) => (
              <option key={eventOpt.id} value={eventOpt.id}>
                {eventOpt.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* --- SESSION DROPDOWN (Unchanged) --- */}
        <div>
          <label htmlFor="session-select" className="block text-sm font-medium text-red-600 mb-2">Session</label>
          <select 
            id="session-select"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md 
                       text-white focus:ring-2 focus:ring-red-500 appearance-none"
          >
            <option value="R">Race (R)</option>
            <option value="Q">Qualifying (Q)</option>
            <option value="S">Sprint (S)</option>
            <option value="SQ">Sprint Qualifying (SQ)</option>
            <option value="FP1">Practice 1 (FP1)</option>
            <option value="FP2">Practice 2 (FP2)</option>
            <option value="FP3">Practice 3 (FP3)</option>
          </select>
        </div>
      </div>

      {/* --- Driver Selectors (Unchanged) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="driver1-select" className="block text-sm font-medium text-red-600 mb-2">Driver 1</label>
          <select
            id="driver1-select"
            value={driver1}
            onChange={handleDriver1Change}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md 
                       text-white focus:ring-2 focus:ring-red-500 appearance-none"
          >
            {driverList.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="driver2-select" className="block text-sm font-medium text-red-600 mb-2">Driver 2</label>
          <select
            id="driver2-select"
            value={driver2}
            onChange={handleDriver2Change}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md 
                       text-white focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {driverList.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Submit Button & Results (Unchanged) --- */}
      <div className="mt-8 text-center">
        <button 
          type="submit" 
          className="bg-red-600 text-white p-4 rounded-md font-bold text-lg
                     hover:bg-red-700 disabled:bg-black"
          disabled={isLoading}
        >
          {isLoading ? <span className="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"></span> : "Generate Graph"}
        </button>
      </div>

    </div>

      {/* --- Display Area for Graph or Error (Unchanged) --- */}
      <div className="mt-8 w-full ">
        {isLoading && (
          <div className="text-center text-gray-400">Loading graph, please wait...</div>
        )}
        {error && (
          <div className="text-center text-blue-600 bg-red-200 border border-blue-600 p-4 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}
        {!imageUrl && !isLoading && !error && (
          <div className="text-center text-gray-400">
            <p className="p-0 mt-0 mb-3">Select options and click "Generate Graph" to see the comparison.</p>
          <img src={`./random/ran${Math.floor(Math.random() * 5) + 1}.jpg`} className="border-2 rounded-2xl border-blue-600"/>
          </div>
        )}
        {imageUrl && (
          <div>
            <img 
              src={imageUrl} 
              alt="Driver Telemetry Comparison" 
              className="w-full h-auto rounded-md border-2 rounded-2xl border-blue-600 cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        )}
      </div>

      {isModalOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                     bg-black bg-opacity-80 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setIsModalOpen(false)} // Click anywhere on the backdrop to close
        >
          <img
            src={imageUrl}
            alt="Full-screen driver telemetry comparison"
            // max-h-full and max-w-full ensure the image fits within the viewport
            className="max-h-full max-w-full rounded-lg shadow-2xl"
          />
        </div>
      )}

    </form>
  );
};

export default OptionsSelector;