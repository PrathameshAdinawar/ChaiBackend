import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/User.model.js";

//next is important in middleware as it guides where to go can be back to main file or another middleware 
// res is not getting used so we can put _
export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {

        //In Postman we can also give headers normally as "Authorization: Bearer <token>"" for modile app development 
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')

        if (!token) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        // Attach authenticated user to req.user so next middleware/controller can access it
        req.user = user;
        next();

    } catch (error) {

        throw new ApiError(401,error?.message || 'Invalid access to token')

    }

})