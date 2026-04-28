import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import connectDB from './config/db.js';

const app=express();

// Connect to Database
connectDB();

const PORT=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/", router);

app.get("/", (req,res)=>{
    res.send("ApexData Backend is running");
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});