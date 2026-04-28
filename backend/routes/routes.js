import express from 'express';
import {carData, getNews, getSessions} from '../controllers/controllers.js';

const router = express.Router();

router.get("/home", (req,res)=>{
    console.log("Home route accessed");
    res.send("Welcome to ApexData Home Route");
});

router.get("/news", getNews);
router.get("/carData", carData);
router.get("/sessions", getSessions);

export default router;