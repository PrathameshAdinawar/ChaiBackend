import express from 'express';
import cors from "cors"
import cookieParser from 'cookie-parser';

const app = express();

//used for middleware/configurations
app.use(cors({

    origin:process.env.CORS_ORIGIN,

    //What problem it solves ?
    //allows the frontend to send cookies to backend (cookies are used for authentication)
    credentials:true

}))

//    *** express configurations for parsing the data coming from frontend ***
//why is it used ?
//it is to get the limited json data from default is 100kb
app.use(express.json({limit:"16kb"}))

//it is used to get the data from url in readable format and also to get the limited data from url
app.use(express.urlencoded({extended:true, limit:"16kb"}))

//public assets are used to store the images, videos, pdfs etc. which can be accessed by frontend
app.use(express.static("public"))

//cookies which are kept in browser and only server can read and remove
app.use(cookieParser())


//named export
export { app };