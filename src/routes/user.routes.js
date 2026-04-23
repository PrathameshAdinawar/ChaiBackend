import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import{ User } from "../models/User.model.js"

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

export default router;