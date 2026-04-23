import { asyncHandler } from "../utils/asynchandler.js";
import{ ApiError } from "../utils/ApiError.js";

import {User} from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

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


    // get user details from frontend/ postman
    // if data coming from form or in json format we use req.body
    // if url its diff approach
    console.log("Request body:", req.body);
    const {fullName,email,username,password} = req.body
    console.log("User registered email:", email);



    // validation - not empty, email format, password strength
    // Instead of creating multiple if conditions for each field, we can use array and "some" method to check if any field is empty or contains only whitespace
    if(
        [fullName,email,username,password].some((field)=> field?.trim() === '')
    ){
        throw new ApiError(400, "All fields are required")
    }



    // check if user already exists in database using username or email
    const existedUser = User.findOne({
        $or:[{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(400, "User already exists with this email or username")
    }



    // check for images, check for avatar
    // multer gives .files access 
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required")
    }



    // upload them to cloudinary and get the url from response, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar image is required")
    }



    // create user object - create entry in database
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username:username.toLowerCase()
    })



    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    if(!createdUser){
        throw new ApiError(500,'Something went wrong while registering the user')
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,'User registered Successfully')
    )



})
export { registerUser }