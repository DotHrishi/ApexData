import { useEffect, useState } from "react";
import { getRace } from "../api/f1API";

function App() {
    const [year, setYear]=useState(2025);
    const [round, setRound]=useState(1);
    const [race, setRace] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading]=useState(false);

    const fetchRace=async()=>{
        setLoading(true);
        setError(null);
        setRace(null);

        try{
            const data=await getRace(year, round);
            setRace(data);
        } catch(err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

 return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>ApexData F1</h1>

      {/* Inputs */}
      <div style={{ marginBottom: "16px" }}>
        <label>
          Year:{" "}
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>

        <label style={{ marginLeft: "12px" }}>
          Round:{" "}
          <input
            type="number"
            value={round}
            onChange={(e) => setRound(e.target.value)}
          />
        </label>

        <button
          style={{ marginLeft: "12px" }}
          onClick={fetchRace}
        >
          Get Race
        </button>
      </div>

      {/* States */}
      {loading && <p>Loading race data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Result */}
      {race && (
        <div>
          <h2>{race.event}</h2>
          <p>
            📍 {race.location}, {race.country}
          </p>
          <p>
            🏆 Winner: <strong>{race.winner}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;