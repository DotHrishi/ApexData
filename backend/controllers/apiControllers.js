import fetch from "node-fetch";
import Schedule from "../models/schedule.js";
import dotenv from "dotenv";

dotenv.config();

export function checkHealth (req,res) {
    res.status(200).json({status: "API is healthy"});
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

export async function getSchedule (req,res) {
    try{

        const schedule = await Schedule.find();

        if(schedule.length > 0) {
            console.log("Cached hit! from MongoDB!");
            return res.status(200).json(schedule);
        }

        console.log("Cache is empty!");
        const response=await fetch("http://192.168.29.63:5001/schedule");

        if(!response.ok) {
            console.error(`Flask return status: ${response.status}`);
            return res.status(502).json({error: "Flask API is unavailable"});
        }

        const data = await response.json();

        await Schedule.insertMany(data);
        console.log("Cached updated data in MongoDB from Flask");
        return res.status(200).json(data);
    } catch (error) {
        console.error("Failed to fetch schedule from Flask", error.message);
        return res.status(500).json({error:"Please check Flask API"});
    }
}

// export async function latestNews (req, res) {
//     try{
//         const response = await fetch(`https://newsapi.org/v2/everything?q=Formula1%201&from=2025-08-09&sortBy=popularity&apiKey=
//             `);
        
//         if(!response.ok) {
//             console.error(`News API returned status: ${response.status}`);
//             return res.status(502).json({error: "News API is unavailable"});
//         }

//         const data = await response.json();
        
//         if(data.articles && data.articles.length > 0) {
//             const latestArticle = data.articles[0];
//             const title = latestArticle.title;
//             const content = latestArticle.description || latestArticle.content;
//             res.status(200).json({title, content});
//         } else {
//             res.status(404).json({error: "No news articles found"});
//         }
//     } catch (error) {
//         console.error("Failed to fetch news", error.message);
//         res.status(500).json({error: "Failed to fetch news"});
//     }
// }

export async function getTeams (req, res) {
}