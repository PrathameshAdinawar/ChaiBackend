import { Router } from "express";

import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logOutUser,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";

import { upload } from '../middlewares/multer.middleware.js'
import { User } from "../models/user.model.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(

    // middleware injection for file upload
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),

    registerUser,
) //http://localhost:8000/api/v1/users/register


router.route("/login").post(loginUser)

//Secured Routes
//first runs the "verifyJWT" from middlewares and when the next() is reached it runs the "logOutUser" from controllers
router.route("/logout").post(verifyJWT, logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route('/change-password').post(verifyJWT, changeCurrentPassword)

router.route('/current-user').get(verifyJWT, getCurrentUser)

router.route('/update-account').patch(verifyJWT, updateAccountDetails)

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

router.route('/cover-image').patch(verifyJWT, upload.single('/coverImage'), updateUserCoverImage)

router.route('/c/:username').get(verifyJWT, getUserChannelProfile)

router.route('/history').get(verifyJWT, getWatchHistory)

export default router;