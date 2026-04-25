import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/User.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from 'jsonwebtoken';


//Method to generate refresh and access token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // find the userById
        const user = await User.findById(userId)
        // generate new accessToken
        const accessToken = await user.generateAccessToken()
        //generate new refreshToken
        const refreshToken = await user.generateRefreshToken()

        //store new access & refresh token in DB
        user.refreshToken = refreshToken
        //Mogoose model kicks in here asking that password is required we just user "validateBeforeSave:false" (to not validate)
        await user.save({ validateBeforeSave: false })

        //access & refresh token generated 
        return { accessToken, refreshToken }

    } catch (error) {
        console.log("Error in generateAccessAndRefreshTokens: ", error)
        throw new ApiError(500, 'Something went wrong while generating refresh and access token')
    }
}



//Kind of Higher order function that accepts a function
const registerUser = asyncHandler(async (req, res) => {
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
    const { fullName, email, username, password } = req.body
    console.log("User registered email:", email);



    // validation - not empty, email format, password strength
    // Instead of creating multiple if conditions for each field, we can use array and "some" method to check if any field is empty or contains only whitespace
    if (
        [fullName, email, username, password].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required")
    }



    // check if user already exists in database using username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "User already exists with this email or username")
    }



    // check for images, check for avatar
    // multer gives .files access
    if (!req.files || !req.files.avatar || req.files.avatar.length === 0) {
        throw new ApiError(400, "Avatar image is required. Send request as form-data with file upload.")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }



    // upload them to cloudinary and get the url from response, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar image is required")
    }



    // create user object - create entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })



    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering the user')
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered Successfully')
    )



})



// Login User and handling access & refresh Tokens
const loginUser = asyncHandler(async (req, res) => {
    // retrieve req body -> data
    // username or email exists
    // find the user to check if user exists
    // password check
    // access and refresh token
    // send cookie


    // retrieve req body -> data
    const { email, username, password } = req.body



    // username or email exists
    if (!username && !email) {
        throw new ApiError(400, 'username or email is required')
    }

    //first entry of the user in mongoDB if user is present is returned 
    const user = await User.findOne({

        //for optional searched we use $or
        $or: [{ username }, { email }]
    })



    //find the user to check if user exists
    if (!user) {
        throw new ApiError(404, 'user does not exists');
    }


    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials');
    }



    //generated new access & refresh token by making a new function 
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


    //avoid giving sensitive credentials in frontend 
    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken");


    //cookies
    const options = {
        //by making them true only modifyable by server
        httpOnly: true,
        secure: true
    }

    //set cookies
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                'User logged in successfully'
            )
        );


})


//Logout user
//Here we use the concept of middleware cause there is no other way to get user_id in this function 
const logOutUser = asyncHandler(async (req, res) => {

    //now after dealing with middlewares specifically "auth.middleware.js" we have access to req.user
    await User.findByIdAndUpdate(

        req.user._id,
        {
            //mongodb operator takes objects where we can update fields
            $set: {
                refreshToken: undefined
            }
        },
        {

            //new:true is depricated in mongoose so we user
            returnDocument: 'after'
        }
    )

    //cookies
    const options = {
        //by making them true only modifyable by server
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logged out'))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'unauthorized request')
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token')
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used')
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { access, refreshToken: newRefreshToken },
                    'Access token refreshed'
                )
            )

    } catch (error) {

        throw new ApiError(401, error?.message || 'Invalid refresh token')

    }



})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
}