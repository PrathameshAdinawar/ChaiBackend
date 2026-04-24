import { Router } from "express";
import { loginUser, logOutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import{ User } from "../models/user.model.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(

    // middleware injection for file upload
    upload.fields([ 
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),

    registerUser,
) //http://localhost:8000/api/v1/users/register


router.route("/login").post(loginUser)

//Secured Routes
//first runs the "verifyJWT" from middlewares and when the next() is reached it runs the "logOutUser" from controllers
router.route("/logout").post(verifyJWT, logOutUser)
export default router;