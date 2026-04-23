import { asyncHandler } from "../utils/asynchandler.js";
import{ ApiError } from "../utils/ApiError.js";

import {User} from "../models/User.model.js"

//Kind of Higher order function that accepts a function
const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend/ postman
    // validation - not empty, email format, password strength
    // check if user already exists in database using username or email
    // check for images, check for avatar
    // upload them to cloudinary and get the url from response, avatar
    // create user object - create entry in database
    // remove password and refresh token from response
    // check for user creation
    // return res



    // if data coming from form or in json format we use req.body
    // if url its diff approach
    const {fullName,email,username,password} = req.body
    console.log("User registered email:", email);

    // Instead of creating multiple if conditions for each field, we can use array and "some" method to check if any field is empty or contains only whitespace
    if(
        [fullName,email,username,password].some((field)=> field?.trim() === '')
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or:[{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(400, "User already exists with this email or username")
    }
})
export { registerUser }