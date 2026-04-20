import multer from "multer";

const storage = multer.diskStorage({

    destination:function(req, file, cb){
        //file is not handled in express directly so we use ,multer/express fileupload is used
        cb(null,'./public/temp')

    },
    //A function that determines the name of the uploaded file. If nothing is passed, Multer will generate a 32 character pseudorandom hex string with no extension.
    filename:function(req,file,cb){

        const uniqueSUffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSUffix)

    }
})

export const upload = multer({storage,})