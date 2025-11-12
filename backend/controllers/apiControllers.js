import fetch from "node-fetch";
import Schedule from "../models/schedule.js";
import UpcomingRace from "../models/upcomingRace.js";
import dotenv from "dotenv";

dotenv.config();

export function checkHealth(req, res) {
  res.status(200).json({ status: "API is healthy" });
}

//FLASK API FETCH WITHOUT MONGODB CACHING

// export async function getSchedule (req, res) {
//     try{
//         const response=await fetch("http://192.168.29.63:5001/schedule");

//         if(!response.ok) {
//             console.error(`Flask return status: ${response.status}`);
//             return res.status(502).json({error: "Flask API is unavailable"})
//         }

//         const data = await response.json();
//         res.status(200).json(data);

//     } catch (error) {
//         console.error("Failed to fetch schedule from Flask", error.message);
//         res.status(500).json({error:"Please check Flask API"});
//     }
// }

// export async function upcoming_race(req, res) {
//     try{
//       const response=await fetch("http://192.168.29.63:5001/driver_speed");

//       if(!response.ok) {
//         console.error(`Flask returned status: ${response.status}`);
//         return res.status(502).json({ error: "Flask API is unavailable" });
//       }

//       const data= await response.json();
//       const {country, event, date}=data;

//       return res.status(200).json({country, event, date})
//     } catch (error) {
//       console.error("Failed to load data: ", error.message);
//       return res.status(500).json({error: "Failed to fetch upcoming race!"});
//     }
// }

export async function getSchedule(req, res) {
  try {
    const schedule = await Schedule.find();

    if (schedule.length > 0) {
      console.log("Cached hit! from MongoDB!");
      return res.status(200).json(schedule);
    }

    console.log("Cache is empty!");
    const response = await fetch("http://192.168.29.63:5001/schedule");

    if (!response.ok) {
      console.error(`Flask return status: ${response.status}`);
      return res.status(502).json({ error: "Flask API is unavailable" });
    }

    const data = await response.json();

    await Schedule.insertMany(data);
    console.log("Cached updated data in MongoDB from Flask");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch schedule from Flask", error.message);
    return res.status(500).json({ error: "Please check Flask API" });
  }
}

export async function upcoming_race (req, res) {
  try{
    let cachedRace = await UpcomingRace.findOne();

    if(cachedRace) {
      console.log("Serving data from cache");
      res.status(200).json(cachedRace);
    }

    const response = await fetch("http://192.168.29.63:5001/driver_speed");

    if(!response.ok) {
      console.error(`Flask returned status: ${response.status}`);
      return res.status(502).json({error:"Flask API unavailable!"});
    }

    const data= await response.json();
    const {country, event, date}=data;

    cachedRace = new UpcomingRace({country, event, date});
    await cachedRace.save();

    return res.status(200).json({country, event, date});
  } catch (error) {
    console.error("Cant retrieve data!", error.message);
    return res.status(500).json({error: "Failed to fetch from Flask API!"});
  }
}

export async function nextRace (req, res) {
  try {
    const data = await fetch("http://127.0.0.1:5001/next_race")

    if(!data.ok) {
      console.error(`Flask returned status: ${data.status}`);
      return res.status(502).json({error: "Flask API unavailable!"});
    }

    const raceData = await data.json();
    return res.status(200).json(raceData);

  } catch (error) {
    console.error("Error fetching next race:", error.message);
    return res.status(500).json({error: "Failed to fetch next race!"});
  }
}