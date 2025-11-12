import { useEffect, useState } from "react";
import RaceIsLive from "./RaceIsLive";

const UpcomingRace = () => {
  const counter = "countdown";

    const [race, setRace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    });
    
    useEffect(() => {
      async function fetchNextRace() {
        try {
        const response = await fetch("http://localhost:5000/api/next-race");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch race details");
        }

        setRace(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNextRace();
  }, []);

  useEffect(() => {
    if (!race || !race.date) return;

    const raceTime = new Date(race.date).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = raceTime - now;

      if (diff < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      if (diff === 0) {
        setTimeLeft({ days: 0, hours: 2, minutes: 0, seconds: 0 });
        <RaceIsLive />
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [race]);

  if (loading) {
    return (
      <div>
        <h1 className="m-4 p-4 text-4xl font-bold fontStyle">UPCOMING RACE</h1>
        <div className="border-2 m-4 p-2 rounded-2xl border-blue-600 size-fit text-overflow-auto">
          <h1 className="text-xl font-semibold mb-4">Loading next race...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="m-4 p-4 text-4xl font-bold fontStyle">UPCOMING RACE</h1>
        <div className="border-2 m-4 p-2 rounded-2xl border-red-600 size-fit text-overflow-auto">
          <h1 className="text-xl font-semibold mb-4 text-red-500">Error: {error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="m-4 p-4 text-4xl font-bold fontStyle"><span className="text-blue-600">UPCOMING</span> RACE</h1>
      <div className="bg-white border-2 m-4 p-4 rounded-2xl border-blue-600 size-fit text-overflow-auto flex flex-col gap-4">

        <div className="mb-4">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">{race?.name || "Race Name Not Available"}</h1>
          <p className="text-lg text-amber-400">{race?.location || ""}</p>
          <p className="text-md text-gray-700">Round {race?.round || ""} • {race?.date || ""}</p>
        </div>

        <div className="grid grid-flow-col gap-5 text-center auto-cols-max text-white">
          <div className="flex flex-col p-2 bg-black rounded-box text-white border-red-600 border-2 rounded-2xl">
            <span className="countdown font-mono text-5xl">
              <span aria-live="polite" aria-label={counter}>
                {timeLeft.days}
              </span>
            </span>
            days
          </div>
          <div className="flex flex-col p-2 bg-black rounded-box text-white border-red-600 border-2 rounded-2xl">
            <span className="countdown font-mono text-5xl">
              <span aria-live="polite" aria-label={counter}>
                {timeLeft.hours}
              </span>
            </span>
            hours
          </div>
          <div className="flex flex-col p-2 bg-black rounded-box text-white border-red-600 border-2 rounded-2xl">
            <span className="countdown font-mono text-5xl">
              <span aria-live="polite" aria-label={counter}>
                {timeLeft.minutes}
              </span>
            </span>
            min
          </div>
          <div className="flex flex-col p-2 bg-black rounded-box text-white border-red-600 border-2 rounded-2xl">
            <span className="countdown font-mono text-5xl">
              <span aria-live="polite" aria-label={counter}>
                {timeLeft.seconds}
              </span>
            </span>
            sec
          </div>
        </div>
          
      </div>
    </div>
  );
};

export default UpcomingRace
