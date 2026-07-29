import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import F1StrategyPro from '../components/strategy/F1StrategyPro';
import RaceInputPanel from '../components/strategy/RaceInputPanel';
import RecommendationCards from '../components/strategy/RecommendationCards';
import StrategyRecommendationBanner from '../components/strategy/StrategyRecommendationBanner';
import PacePredictionChart from '../components/strategy/PacePredictionChart';
import CandidateStrategiesTable from '../components/strategy/CandidateStrategiesTable';
import FeatureImportanceChart from '../components/strategy/FeatureImportanceChart';
import SystemInfoCard from '../components/strategy/SystemInfoCard';
import ArchitectureModal from '../components/strategy/ArchitectureModal';
import LoadingOverlay from '../components/strategy/LoadingOverlay';
import { fetchStrategyRecommendation } from '../services/strategyApi';

const DEFAULT_FORM_DATA = {
  driver_id: 'VER',
  circuit: 'Bahrain',
  current_lap: 20,
  compound: 'MEDIUM',
  tyre_life: 15,
  estimated_fuel_kg: 65.0,
  track_temp: 34.0,
  air_temp: 25.0,
  humidity: 50.0,
  pressure: 1013.0,
  rolling_pace_3: 92.5,
  rolling_pace_5: 92.4,
  lap_delta: 0.1,
  stint_progress: 50.0,
  total_race_laps: 57,
};

const AIStrategy = () => {
  const [activeTab, setActiveTab] = useState('pro'); // 'pro' or 'single'
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    handleGenerateStrategy();
  }, []);

  const handleGenerateStrategy = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorState(null);

    try {
      const data = await fetchStrategyRecommendation(formData);
      if (data && data.success === false) {
        setErrorState({
          title: 'Simulation Notice',
          message: data.message || 'Using client-side strategy engine.',
          type: 'backend',
        });
        setRecommendation(data.data || data);
      } else {
        setRecommendation(data);
      }
    } catch (err) {
      console.error('Error generating strategy:', err);
      setErrorState({
        title: 'Strategy Engine Notice',
        message: 'Using client-side fallback simulation.',
        type: 'backend',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-red-600 selection:text-white">
      <Navbar />

      <AnimatePresence>
        {isLoading && activeTab === 'single' && <LoadingOverlay />}
      </AnimatePresence>

      <ArchitectureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl font-tech-mono text-xs max-w-xl">
          <button
            onClick={() => setActiveTab('pro')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pro'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 orbitron'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>🏎️ F1 Strategy Pro Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 orbitron'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>⚡ Single-Lap Forecast</span>
          </button>
        </div>

        {/* Tab 1: F1 Strategy Pro Analyzer */}
        {activeTab === 'pro' && (
          <F1StrategyPro />
        )}

        {/* Tab 2: Single-Lap ML Forecast & Strategy Engine */}
        {activeTab === 'single' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-zinc-800/80 gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-600/40 font-tech-mono">
                    APEXDATA AI SUBSYSTEM
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-tech-mono text-zinc-400 hover:text-white underline transition-colors"
                  >
                    ⓘ How does the AI work?
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white orbitron tracking-tight mt-1">
                  SINGLE-LAP FORECAST ENGINE
                </h1>
              </div>

              <button
                onClick={() => handleGenerateStrategy()}
                disabled={isLoading}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 font-tech-mono text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>🔄 Refresh Simulation</span>
              </button>
            </div>

            {errorState && (
              <div className="border border-amber-800 bg-amber-950/40 text-amber-300 p-3.5 rounded-xl text-xs font-tech-mono flex items-center justify-between">
                <div>
                  <span className="font-bold">⚠️ [{errorState.title}]:</span> {errorState.message}
                </div>
                <button onClick={() => setErrorState(null)} className="underline text-[11px]">Dismiss</button>
              </div>
            )}

            <RecommendationCards recommendation={recommendation} formData={formData} />
            <StrategyRecommendationBanner recommendation={recommendation} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1">
                <RaceInputPanel
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleGenerateStrategy}
                  isLoading={isLoading}
                />
              </div>
              <div className="lg:col-span-2">
                <PacePredictionChart
                  recommendation={recommendation}
                  currentLap={formData.current_lap}
                  totalLaps={formData.total_race_laps}
                  currentCompound={formData.compound}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <CandidateStrategiesTable
                candidateStrategies={recommendation?.candidateStrategies || []}
                recommendedPitLap={recommendation?.recommendedPitLap}
                recommendedCompound={recommendation?.recommendedCompound}
              />
              <FeatureImportanceChart topFactors={recommendation?.topFactors || {}} />
            </div>

            <SystemInfoCard recommendation={recommendation} />
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AIStrategy;
