import React from 'react';

const Selectors = ({
  years,
  selectedYear,
  onYearChange,
  events,
  selectedEvent,
  onEventChange,
  sessions,
  selectedSession,
  onSessionChange,
  drivers,
  selectedDrivers,
  onDriverToggle,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Year Selector */}
      <div className="flex flex-col">
        <label className="text-white mb-2 font-orbitron">Year</label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="bg-black/50 border border-white/20 text-white p-2 rounded hover:border-blue-500 transition-colors"
          disabled={loading}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Event Selector */}
      <div className="flex flex-col">
        <label className="text-white mb-2 font-orbitron">Event/Country</label>
        <select
          value={selectedEvent}
          onChange={(e) => onEventChange(e.target.value)}
          className="bg-black/50 border border-white/20 text-white p-2 rounded hover:border-blue-500 transition-colors"
          disabled={!selectedYear || loading || events.length === 0}
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.meeting_key || event.country_name} value={event.meeting_key}>
              {event.country_name} - {event.meeting_name}
            </option>
          ))}
        </select>
      </div>

      {/* Session Selector */}
      <div className="flex flex-col">
        <label className="text-white mb-2 font-orbitron">Session</label>
        <select
          value={selectedSession}
          onChange={(e) => onSessionChange(e.target.value)}
          className="bg-black/50 border border-white/20 text-white p-2 rounded hover:border-blue-500 transition-colors"
          disabled={!selectedEvent || loading || sessions.length === 0}
        >
          <option value="">Select Session</option>
          {sessions.map((session) => (
            <option key={session.session_key} value={session.session_key}>
              {session.session_name}
            </option>
          ))}
        </select>
      </div>

      {/* Driver Selector (Multi-select visual) */}
      <div className="flex flex-col relative group">
        <label className="text-white mb-2 font-orbitron">Drivers (Max 5)</label>
        <div className="bg-black/50 border border-white/20 text-white p-2 rounded h-[42px] overflow-hidden group-hover:h-auto group-hover:absolute group-hover:top-8 group-hover:z-50 group-hover:bg-black group-hover:w-full transition-all">
          <div className="mb-2 text-sm text-gray-400">
             {selectedDrivers.length > 0 ? `${selectedDrivers.length} Selected` : 'Select Drivers'}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {drivers.map((driver) => (
              <div
                key={driver.driver_number}
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-800 ${
                  selectedDrivers.includes(driver.driver_number) ? 'bg-blue-900/50' : ''
                }`}
                onClick={() => onDriverToggle(driver.driver_number)}
              >
                <div
                    className="w-4 h-4 rounded-full border border-white mr-2"
                    style={{ backgroundColor: driver.headshot_url ? 'transparent' : `#${driver.team_colour}` }}
                ></div>
                <span className="text-sm">
                  {driver.full_name} ({driver.driver_number})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Selectors;
