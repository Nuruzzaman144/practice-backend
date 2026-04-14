import { v2 as cloudinary} from 'cloudinary'
import fs from 'fs'



cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET_KEY,

})


const uploadOnCloudinary=async (localFilePath)=>{
   try {
     if(!localFilePath) return null
 
     const res=await cloudinary.uploader.upload(localFilePath,{
         resource_type:"auto"
     })
 
     console.log("File has been uploaded on cloudinary ",res.url)
     return res;
   } catch (error) {
    fs.unlinkSync(localFilePath)
    // remove the locally save temoparay file as the upload operation got failed
    return null
    
   }

}
 

 //only for testing
// cloudinary.v2.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function(error, result) { console.log(result); }
// );


export {uploadOnCloudinary}