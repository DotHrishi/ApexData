import React from 'react';

const DRIVERS = ["VER", "NOR", "HAM", "LEC", "PIA", "SAI", "ALO", "RUS"];
const CIRCUITS = [
  "Bahrain", "Monaco", "Silverstone", "Monza", "Singapore",
  "Spa", "Suzuka", "Austin", "Interlagos", "Abu Dhabi"
];
const COMPOUNDS = ["MEDIUM", "SOFT", "HARD", "INTERMEDIATE", "WET"];

const RaceInputPanel = ({ formData, setFormData, onSubmit, isLoading }) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  return (
    <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl p-5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-inter flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Race State Inputs
        </h2>
        <span className="text-[10px] font-tech-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          Telemetry Feeds
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Driver & Circuit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Driver
            </label>
            <select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600 transition-colors"
            >
              {DRIVERS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Circuit
            </label>
            <select
              name="circuit"
              value={formData.circuit}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-inter text-white focus:outline-none focus:border-red-600 transition-colors"
            >
              {CIRCUITS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Lap & Tyre Life */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Current Lap
            </label>
            <input
              type="number"
              name="current_lap"
              value={formData.current_lap}
              min="1"
              max={formData.total_race_laps || 100}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Tyre Life (Laps)
            </label>
            <input
              type="number"
              name="tyre_life"
              value={formData.tyre_life}
              min="1"
              max="80"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600 transition-colors"
              required
            />
          </div>
        </div>

        {/* Compound & Fuel */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Current Compound
            </label>
            <select
              name="compound"
              value={formData.compound}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600 transition-colors"
            >
              {COMPOUNDS.map((cmp) => (
                <option key={cmp} value={cmp}>{cmp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Est. Fuel (kg)
            </label>
            <input
              type="number"
              name="estimated_fuel_kg"
              value={formData.estimated_fuel_kg}
              step="0.1"
              min="0"
              max="110"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600 transition-colors"
              required
            />
          </div>
        </div>

        {/* Weather Conditions */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
          <div>
            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Track Temp (°C)
            </label>
            <input
              type="number"
              name="track_temp"
              value={formData.track_temp}
              step="0.5"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Air Temp (°C)
            </label>
            <input
              type="number"
              name="air_temp"
              value={formData.air_temp}
              step="0.5"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Humidity (%)
            </label>
            <input
              type="number"
              name="humidity"
              value={formData.humidity}
              step="1"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {/* Rolling Pace (3 & 5 Laps) and Lap Delta */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Rolling Pace (3L)
            </label>
            <input
              type="number"
              name="rolling_pace_3"
              value={formData.rolling_pace_3}
              step="0.1"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Rolling Pace (5L)
            </label>
            <input
              type="number"
              name="rolling_pace_5"
              value={formData.rolling_pace_5}
              step="0.1"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider font-inter mb-1">
              Lap Delta (s)
            </label>
            <input
              type="number"
              name="lap_delta"
              value={formData.lap_delta}
              step="0.05"
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-tech-mono text-white focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-red-950/50 hover:shadow-red-900/60 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-inter text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Calculating Optimal Window...
            </>
          ) : (
            <>
              <span>⚡ Generate AI Strategy</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RaceInputPanel;
