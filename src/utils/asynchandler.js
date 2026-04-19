// Promise based method 
const asyncHandler = (requestHandler) => {

    (req, res, next) => {

        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err))

    }
}

export { asyncHandler }

//Try catch method
//higher order function which takes a function as an argument and returns a function
// const asyncHandler = (fn) => async(req,res,next) => {
//     try{

//         await fn(req,res,next)

//     }catch(error){

//         //if user passed the error code then use that otherwise use 500
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message || "Internal Server Error"
//         })
//     }
// }