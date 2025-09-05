import fetch from "node-fetch";

export function checkHealth (req,res) {
    res.status(200).json({status: "API is healthy"});
}

export async function getSchedule (req, res) {
    try{
        const response=await fetch("http://192.168.29.63:5001/schedule");
        
        if(!response.ok) {
            console.error(`Flask return status: ${response.status}`);
            return res.status(502).json({error: "Flask API is unavailable"})
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Failed to fetch schedule from Flask", error.message);
        res.status(500).json({error:"Please check Flask API"});
    }
}