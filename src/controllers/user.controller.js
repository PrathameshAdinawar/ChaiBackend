import { asyncHandler } from "../utils/asynchandler.js";

//Kind of Higher order function that accepts a function
const registerUser = asyncHandler( async (req,res)=>{
    res.status(200).json({
        message:"Chai aur Code"
    })
})

export { registerUser }