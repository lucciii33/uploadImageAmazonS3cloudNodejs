require("dotenv").config()
const express = require("express")
const multer = require("multer")
const uuid = require("uuid").v4
const { s3Uploadv3 } = require("./s3Service");
const app = express()

//this is for single file upload
// const upload = multer({dest: "uploads"})
// app.post("/upload", upload.single("file"),(req, res)=>{
//     res.json({status: "success"});
// })

//this is for multiple file upload and the number 2 next to the "file string is to get the maximun of files that a user can send"
// const upload = multer({dest: "uploads"})
// app.post("/upload", upload.array("file", 2),(req, res)=>{
//     res.json({status: "success"});
// })

//this is for multiple images in diferent folders
// const upload = multer({dest: "uploads"})
// const multiUpload = upload.fields([
//     {name: "avatar", maxCount:1},
//     {name: "resume", maxCount:1}
// ])
// app.post("/upload", multiUpload,(req, res)=>{
//     console.log(req.files)
//     res.json({status: "success"});
// })

//this is a route to save the picture with the correct name using the uuid library
// const storage = multer.diskStorage({
//     destination: (req, file, cb)=>{
//         cb(null, "uploads")
//     },
//     filename: (req, file, cb)=>{
//         const {originalname} = file;
//         cb(null,`${uuid()}-${originalname}`);
//     }
// })

//this is for s3
const storage = multer.memoryStorage();


// this function is to selec whay type of file you want it, pdf, jpeg, video, etc.
const fileFilter = (req, file, cb)=>{
    //this one is just for any type of image
    if(file.mimetype.split("/")[0]==="image"){
        cb(null, true)
    }
    //this one is just for pdf documents
    // if(file.mimetype.split("/")[1]==="pdf"){
    //     cb(null, true)
    // }
    else{
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
    }
}

const upload = multer({storage, fileFilter, limits: {fileSize: 1000000000, files: 1}})
app.post("/upload", upload.array("file"), async(req, res)=>{
    try{
        const results = await s3Uploadv3(req.files);
        console.log(results);
        res.json({status: "success"});
    }
    catch (err) {
        console.log(err);
      }
})

app.use((error, req, res, next)=>{
if(error instanceof multer.MulterError){
 if(error.code === 'LIMIT_FILE_SIZE'){
    return res.status(400).json({status: "file is to large"});
 };
 if(error.code === 'LIMIT_FIELD_COUNT'){
    return res.status(400).json({status: "file limit reached"});
 };
 if(error.code === 'LIMIT_UNEXPECTED_FILE'){
    return res.status(400).json({status: "wrong file type"});
 };
}
})

app.listen(4000, ()=> console.log("listening on port 4000"))