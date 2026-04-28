import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from "chart.js";
import { Line, Bar, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [data, setData] = useState([]);
  const [driver2Data, setDriver2Data] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sessions State
  const [sessionsList, setSessionsList] = useState([]);
  const [yearsList, setYearsList] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  
  // Controls state
  const [selectedDriver, setSelectedDriver] = useState(55);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedDriver2, setSelectedDriver2] = useState(16);
  const [selectedSession, setSelectedSession] = useState('');
  const [dataType, setDataType] = useState('speed');
  const [chartType, setChartType] = useState('line');

  // Options for dropdowns
  const drivers = [
    { name: 'Max Verstappen', number: 1 },
    { name: 'Sergio Perez', number: 11 },
    { name: 'Lewis Hamilton', number: 44 },
    { name: 'George Russell', number: 63 },
    { name: 'Charles Leclerc', number: 16 },
    { name: 'Carlos Sainz', number: 55 },
    { name: 'Lando Norris', number: 4 },
    { name: 'Oscar Piastri', number: 81 },
    { name: 'Fernando Alonso', number: 14 },
    { name: 'Lance Stroll', number: 18 },
  ];

  const dataTypes = [
    { label: 'Speed (km/hr)', value: 'speed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
    { label: 'RPM', value: 'rpm', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' },
    { label: 'Throttle (%)', value: 'throttle', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)' },
    { label: 'Brake', value: 'brake', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.2)' },
    { label: 'Gear', value: 'n_gear', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' },
  ];

  useEffect(() => {
    fetch('http://localhost:5000/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
           const sorted = data.sort((a,b) => new Date(b.date_start) - new Date(a.date_start));
           setSessionsList(sorted);
           const years = [...new Set(sorted.map(s => s.year))].sort((a,b) => b - a);
           setYearsList(years);
           if (years.length > 0) {
             const defaultYear = years.includes(2024) ? 2024 : years[0];
             setSelectedYear(defaultYear);
             const yearSessions = sorted.filter(s => s.year === defaultYear);
             if (yearSessions.length > 0) {
               setSelectedSession(yearSessions[0].session_key);
             }
           }
        }
      })
      .catch(console.error);
  }, []);

  // Update session dropdown when year changes
  useEffect(() => {
    if (selectedYear) {
      const yearSessions = sessionsList.filter(s => s.year === parseInt(selectedYear));
      if (yearSessions.length > 0 && !yearSessions.find(s => s.session_key === parseInt(selectedSession))) {
        setSelectedSession(yearSessions[0].session_key);
      }
    }
  }, [selectedYear, sessionsList]);

  useEffect(() => {
    if (!selectedSession) return;
    setLoading(true);
    
    const fetchDriver1 = fetch(`http://localhost:5000/carData?driver_number=${selectedDriver}&session_key=${selectedSession}`).then(res => res.json());
    let fetchPromises = [fetchDriver1];
    
    if (isComparing) {
      const fetchDriver2 = fetch(`http://localhost:5000/carData?driver_number=${selectedDriver2}&session_key=${selectedSession}`).then(res => res.json());
      fetchPromises.push(fetchDriver2);
    }

    Promise.all(fetchPromises)
      .then(results => {
        const d1 = results[0];
        setData(Array.isArray(d1) ? d1 : []);
        
        if (isComparing && results.length > 1) {
           const d2 = results[1];
           setDriver2Data(Array.isArray(d2) ? d2 : []);
        } else {
           setDriver2Data([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData([]);
        setDriver2Data([]);
        setLoading(false);
      });
  }, [selectedDriver, selectedDriver2, selectedSession, isComparing]);

  const sorted = useMemo(() => [...data].sort((a, b) => new Date(a.date) - new Date(b.date)), [data]);
  const sorted2 = useMemo(() => [...driver2Data].sort((a, b) => new Date(a.date) - new Date(b.date)), [driver2Data]);

  const labels = sorted.map(d => new Date(d.date).toLocaleTimeString());
  const chartValues = sorted.map(d => d[dataType]);
  
  const selectedTypeInfo = dataTypes.find(t => t.value === dataType);

  const datasets = [
    {
      label: `${selectedTypeInfo.label} - Driver #${selectedDriver}`,
      data: chartValues,
      borderColor: selectedTypeInfo.color,
      backgroundColor: selectedTypeInfo.bgColor,
      tension: 0.3,
      pointRadius: chartType === 'scatter' ? 3 : 0,
      borderWidth: chartType === 'scatter' ? 0 : 2,
      fill: chartType === 'line' && !isComparing,
    }
  ];

  if (isComparing) {
    const chartValues2 = sorted2.map(d => d[dataType]);
    datasets.push({
      label: `${selectedTypeInfo.label} - Driver #${selectedDriver2}`,
      data: chartValues2,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
      tension: 0.3,
      pointRadius: chartType === 'scatter' ? 3 : 0,
      borderWidth: chartType === 'scatter' ? 0 : 2,
    });
  }

  const chartData = {
    labels: chartType === 'scatter' ? [] : labels, // Scatter doesn't use these labels typically, but react-chartjs-2 handles it if passed array of objects. Actually, for scatter we should format data as {x,y}. But for simplicity, we map values to index.
    datasets: chartType === 'scatter' ? datasets.map(ds => ({
      ...ds,
      data: ds.data.map((y, x) => ({ x, y }))
    })) : datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { labels: { color: "white" } },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
      title: {
        display: true,
        text: `${selectedTypeInfo.label} ${isComparing ? 'Comparison' : 'over Time'}`,
        color: 'white',
        font: { size: 16 }
      }
    },
    scales: {
      x: {
        type: chartType === 'scatter' ? 'linear' : 'category',
        ticks: { color: "#9ca3af", maxTicksLimit: 10 },
        grid: { color: "#374151" },
        display: chartType !== 'scatter', // Hide X axis for scatter index for cleaner look or keep it.
      },
      y: {
        ticks: { color: "#9ca3af" },
        grid: { color: "#374151" }
      }
    }
  };

  // Helper for stats
  const calculateStats = (dataset) => {
    if (!dataset || dataset.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = dataset.map(d => d[dataType] || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    return { min, max, avg };
  };

  const stats1 = useMemo(() => calculateStats(data), [data, dataType]);
  const stats2 = useMemo(() => calculateStats(driver2Data), [driver2Data, dataType]);

  // Render correct chart component
  const renderChart = () => {
    switch (chartType) {
      case 'bar': return <Bar data={chartData} options={options} />;
      case 'scatter': return <Scatter data={chartData} options={options} />;
      default: return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div className='bg-black min-h-screen flex flex-col'>
      <Navbar />
      
      <div className='flex-grow flex flex-col lg:flex-row p-5 gap-6'>
        
        {/* Sidebar Controls */}
        <div className='w-full lg:w-1/4 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 backdrop-blur-sm h-fit'>
          <h2 className='text-2xl font-bold text-white mb-6 orbitron'>
            Analysis <span className='text-red-500'>Controls</span>
          </h2>

          <div className='flex gap-4 mb-6'>
            {/* Year Selector */}
            <div className='w-1/2'>
              <label className='block text-gray-400 mb-2 font-medium'>Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className='w-full bg-black text-white p-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none transition-colors'
              >
                {yearsList.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Chart Type Selector */}
            <div className='w-1/2'>
              <label className='block text-gray-400 mb-2 font-medium'>Chart Type</label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                className='w-full bg-black text-white p-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none transition-colors'
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="scatter">Scatter</option>
              </select>
            </div>
          </div>

          {/* Session Selector */}
          <div className='mb-6'>
            <label className='block text-gray-400 mb-2 font-medium'>Session</label>
            <select 
              value={selectedSession} 
              onChange={(e) => setSelectedSession(e.target.value)}
              className='w-full bg-black text-white p-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none transition-colors'
              disabled={sessionsList.length === 0}
            >
              {sessionsList.filter(s => s.year === parseInt(selectedYear)).map(session => (
                <option key={session.session_key} value={session.session_key}>
                  {session.circuit_short_name} - {session.session_name}
                </option>
              ))}
            </select>
          </div>

          {/* Driver 1 Selector */}
          <div className='mb-6'>
            <label className='block text-gray-400 mb-2 font-medium'>Primary Driver</label>
            <select 
              value={selectedDriver} 
              onChange={(e) => setSelectedDriver(e.target.value)}
              className='w-full bg-black text-white p-3 rounded-lg border border-zinc-700 focus:border-red-500 focus:outline-none transition-colors'
            >
              {drivers.map(driver => (
                <option key={driver.number} value={driver.number}>
                  {driver.name} (#{driver.number})
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Toggle */}
          <div className='mb-6 flex items-center gap-3'>
            <input 
              type="checkbox" 
              id="compareToggle"
              checked={isComparing}
              onChange={(e) => setIsComparing(e.target.checked)}
              className="w-5 h-5 accent-red-500 bg-zinc-800 border-zinc-700 rounded cursor-pointer"
            />
            <label htmlFor="compareToggle" className='text-white font-medium cursor-pointer'>
              Compare with another driver
            </label>
          </div>

          {/* Driver 2 Selector */}
          {isComparing && (
            <div className='mb-6 animate-fade-in'>
              <label className='block text-gray-400 mb-2 font-medium'>Comparison Driver</label>
              <select 
                value={selectedDriver2} 
                onChange={(e) => setSelectedDriver2(e.target.value)}
                className='w-full bg-black text-white p-3 rounded-lg border border-zinc-700 focus:border-orange-500 focus:outline-none transition-colors'
              >
                {drivers.map(driver => (
                  <option key={`d2-${driver.number}`} value={driver.number}>
                    {driver.name} (#{driver.number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data Type Selector */}
          <div className='mb-6'>
            <label className='block text-gray-400 mb-2 font-medium'>Data Metric</label>
            <div className='grid grid-cols-1 gap-2'>
              {dataTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDataType(type.value)}
                  className={`p-3 rounded-lg text-left transition-all duration-200 border ${
                    dataType === type.value 
                      ? `bg-zinc-800 border-${type.color.replace('#', '')} text-white shadow-lg` 
                      : 'bg-transparent border-zinc-800 text-gray-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                  style={{ borderColor: dataType === type.value ? type.color : '' }}
                >
                  <span className='font-medium'>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className='w-full lg:w-3/4 flex flex-col gap-6'>
          
          {/* Key Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Max Stat */}
            <div className='bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden'>
               <div className='absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl'></div>
               <span className='text-gray-400 text-sm font-medium mb-1'>MAX {selectedTypeInfo.label.split(' ')[0].toUpperCase()}</span>
               <div className='flex gap-4 items-end'>
                 <div className='text-center'>
                   <span className='text-3xl font-bold text-white'>{stats1.max}</span>
                   {isComparing && <span className='block text-xs text-gray-500'>D1</span>}
                 </div>
                 {isComparing && (
                   <div className='text-center'>
                     <span className='text-3xl font-bold text-orange-500'>{stats2.max}</span>
                     <span className='block text-xs text-gray-500'>D2</span>
                   </div>
                 )}
               </div>
            </div>

            {/* Avg Stat */}
            <div className='bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden'>
               <div className='absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl'></div>
               <span className='text-gray-400 text-sm font-medium mb-1'>AVG {selectedTypeInfo.label.split(' ')[0].toUpperCase()}</span>
               <div className='flex gap-4 items-end'>
                 <div className='text-center'>
                   <span className='text-3xl font-bold text-white'>{stats1.avg}</span>
                   {isComparing && <span className='block text-xs text-gray-500'>D1</span>}
                 </div>
                 {isComparing && (
                   <div className='text-center'>
                     <span className='text-3xl font-bold text-orange-500'>{stats2.avg}</span>
                     <span className='block text-xs text-gray-500'>D2</span>
                   </div>
                 )}
               </div>
            </div>

            {/* Min Stat */}
            <div className='bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden'>
               <div className='absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl'></div>
               <span className='text-gray-400 text-sm font-medium mb-1'>MIN {selectedTypeInfo.label.split(' ')[0].toUpperCase()}</span>
               <div className='flex gap-4 items-end'>
                 <div className='text-center'>
                   <span className='text-3xl font-bold text-white'>{stats1.min}</span>
                   {isComparing && <span className='block text-xs text-gray-500'>D1</span>}
                 </div>
                 {isComparing && (
                   <div className='text-center'>
                     <span className='text-3xl font-bold text-orange-500'>{stats2.min}</span>
                     <span className='block text-xs text-gray-500'>D2</span>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className='bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl flex-grow flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
               <h1 className='text-3xl orbitron text-white'>
                 Telemetry <span className='text-red-500'>Insights</span>
               </h1>
               {loading && <span className='text-red-500 animate-pulse font-mono bg-red-500/10 px-3 py-1 rounded-full text-sm border border-red-500/20'>LIVE SYNC...</span>}
            </div>

            <div className='flex-grow relative min-h-[500px]'>
              {loading && data.length === 0 ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                   <div className='flex flex-col items-center'>
                      <div className='w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4'></div>
                      <p className='text-gray-400 font-mono'>Fetching data from pitwall...</p>
                   </div>
                </div>
              ) : (
                <div className='h-full w-full'>
                   {renderChart()}
                </div>
              )}
              
              {!loading && data.length === 0 && (
                 <div className='absolute inset-0 flex items-center justify-center text-gray-500 font-medium'>
                   No telemetry data available for this selection.
                 </div>
              )}
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Analytics;