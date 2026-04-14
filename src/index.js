import dotenv from 'dotenv'
import connectDB from "./db/index.js";

import { app } from "./app.js";

dotenv.config({
    path:'/.env'
})



   
connectDB()
.then(()=>{
      
     
          
    app.listen(process.env.PORT || 8080 ,()=>{
        console.log(`Server is Running at PORT:${process.env.PORT}`)

    })

    
})
.catch((err)=>{
    console.log("Mongodb db connection failed !!!  ",err)

})
  







// import mongoose from "mongoose";

// import { DB_NAME } from "./constance";
// import express from "express"
// const app = express();

// (async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URL}/${DB_NAME}`
//     );

//     console.log("MongoDB connected:", connectionInstance.connection.host);

//     app.on("error", (error) => {
//       console.log("ERROR:", error);
//       throw error;
//     });

//     app.listen(process.env.PORT || 5000, () => {
//       console.log(`App is listening on port ${process.env.PORT || 5000}`);
//     });

//   } catch (error) {
//     console.error("ERROR:", error);
//   throw error
//   }
// })();
    
