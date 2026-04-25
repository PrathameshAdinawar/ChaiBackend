import dotenv from 'dotenv'
dotenv.config()

import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import connectDB from "./db/index.js"
import { app } from "./app.js"

//            ************** Secound Approach **************



connectDB()
.then(()=>{

    //Used for listening/handling events like server errors, connections, and logging system activities.
    app.on("error", (error) => {
                console.log("ERRR: ", error);
                throw error
            })

    //Used to start backend servers (APIs, web apps)
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at pot:${process.env.PORT}`)
    });
})

.catch((error) => {
    console.log("Error in connecting to DB !!!!", error)
})







/* //                    ********** first approach ***********
import express from "express"

const app = express()

   

    // function connectDB(){}
    // connectDB()

    //better way to to write a function 
    //IIFE (Immediately Invoked Function Expression) 
    //Why use async because there can be a delay in DB (DB is always in anaother continent)
    (async () => {
        try {

            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

            // It is done when DB is connected but express is not able to talk to DB
            app.on("error", (error) => {
                console.log("ERRR: ", error);
                throw error
            })

            //message to show port running ON
            app.listen(process.env.PORT,()=>{

                console.log(`App is listening onm port ${process.env.PORT}`);
            
            })

        } catch (error) {

            console.error('ERROR: ', error)
            throw error

        }
    })()
        */