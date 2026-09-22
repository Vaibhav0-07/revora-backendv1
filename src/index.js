import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './database/index.js';
dotenv.config({
    path:"./.env",
});
const app = express();
const port = process.env.PORT || 3000; 

connectDB()
.then(()=>{
    app.on("error", (error) => {
        console.error("Server error:", error);
        process.exit(1); // Exit the process with failure
    })
    app.listen(`${process.env.PORT || 3000}`, ()=> {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
})
.catch((error)=>{
    console.error("Failed to connect to the database", error);
    process.exit(1); // Exit the process with failure
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});