import React, {useEffect, useState} from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend} from "chart.js";
import {Line} from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Analytics = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    fetch("http://localhost:5000/carData")
    .then((res)=>res.json())
    .then((data)=>{
      setData(data);
      setLoading(false);
    })
    .catch((err)=>{
      console.error(err);
      setLoading(false);
    });
  }, []);

  const sorted=[...data].sort(
    (a,b)=>new Date(a.data)-new Date(b.date)
  );

  const labels=sorted.map(d=>
    new Date(d.date).toLocaleDateString()
  );
  
  const speedData=data.map(d=>d.speed);

  const chartData={
    labels,
    datasets: [
      {
        label: "Speed (km/hr)",
        data: speedData,
        borderColor: "#ef4444",
        backgroundColor: "rgb(239,68,0.2)",
        tension: 0.3,
        pointRadius: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {color: "white"}
      }
    },
    scales: {
      x: {
        ticks: {color: "white"},
        grid: {color: "#222"}
      }
    }
  };

  return (
    <div className='bg-black' min-h-screen>
        <Navbar />
        <div className='bg-black text-white p-5 m-5'>
        <h1 className='text-4xl orbitron mb-6'>CAR <span>DATA</span></h1>

        {loading ? (
          <p className='text-gray-600 animate-pulse'>Loading telemetry....</p>
        ):(
          <div className='bg-zinc-900 p-6 rounded-xl shadow-lg'>
            <h2 className='text-xl mb-4'>Speed vs Time</h2>
            <Line data={chartData} options={options} />
          </div>
        )}
        </div>
        <Footer />
    </div>
  )
}

export default Analytics;